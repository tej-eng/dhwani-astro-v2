"use client";

import { useState, useMemo, useEffect } from "react";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import metadata from "libphonenumber-js/metadata.min.json";
import ReactCountryFlag from "react-country-flag";
import Select from "react-select";
function getCountries() {
  const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
  const countryCodes = Object.keys(metadata.countries);

  return countryCodes.map((iso) => {
    const dialCode = `+${metadata.countries[iso][0]}`;
    return {
      iso,
      name: displayNames.of(iso),
      dialCode,
    };
  });
}

export default function PhoneInput({ onChange, handleKeyEnter,  resetTrigger,}) {
  const countries = useMemo(() => getCountries(), []);

  const defaultCountry = countries.find((c) => c.iso === "IN") || countries[0];

  const [country, setCountry] = useState(defaultCountry);

  const [number, setNumber] = useState("");
useEffect(() => {
  setNumber("");
 
}, [resetTrigger, defaultCountry]);
  useEffect(() => {
    const phone = parsePhoneNumberFromString(`${country.dialCode}${number}`);
    // console.log("Parsed phonexxxxxxxxxxxxxxxxxx:", phone);
    const cleanNumber = number.replace(/^0+/, "");
    onChange({
      countryCode: country.dialCode,
      mobile: cleanNumber,
      iso: country.iso,
      e164: phone?.number || "",
      isValid: (phone?.isValid() && number.length >= 6) || false,
    });
  }, [number, country, onChange]);

  return (
    <div className="flex gap-0.5 rounded">
      <div className="flex w-20 sm:w-30 items-center gap-0.5 h-full  px-1 py-1 sm:px-3 sm:py-2 border border-gray-200 rounded-lg shadow-lg">
        <Select
          value={country}
          onChange={(selected) => setCountry(selected)}
          options={countries}
          getOptionValue={(option) => option.iso}
          getOptionLabel={(option) => option.name}
          isSearchable
          menuPortalTarget={
            typeof window !== "undefined" ? document.body : null
          }
          menuPosition="fixed"
          styles={{
            control: (base) => ({
              ...base,
              border: "none",
              boxShadow: "none",
              minHeight: "auto",
              background: "transparent",
            }),

            menu: (base) => ({
              ...base,
              width: 240,
              minWidth: 240,
            }),

            menuPortal: (base) => ({
              ...base,
              zIndex: 99999,
            }),

            indicatorSeparator: () => ({
              display: "none",
            }),

            dropdownIndicator: (base) => ({
              ...base,
              padding: 2,
            }),

            valueContainer: (base) => ({
              ...base,
              padding: 0,
            }),
          }}
          formatOptionLabel={(option, { context }) => {
            // Closed state
            if (context === "value") {
              return (
                <div className="flex items-center gap-1">
                  <ReactCountryFlag
                    countryCode={option.iso}
                    svg
                    style={{ width: "1.1em", height: "1.1em" }}
                  />
                  <span className="text-xs sm:text-sm">{option.dialCode}</span>
                </div>
              );
            }

            // Dropdown options
            return (
              <span className="w-15 text-black text-xs sm:text-sm">
                {option.dialCode} {option.name}
              </span>
            );
          }}
        />
      </div>

      <input
        type="tel"
        className="flex-1 px-3  py-2 border border-gray-200 text-gray-800 text-sm sm:text-base rounded-lg placeholder:text-xs shadow-lg outline-none"
        placeholder="Mobile number"
        value={number}
        onKeyDown={handleKeyEnter}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, "");
          if (val.length <= 15) setNumber(val);
        }}
      />
    </div>
  );
}
