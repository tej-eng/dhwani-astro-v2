"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import Image from "next/image";
import { setdaUserForm } from "@/app/redux/services/daUserFormSlice";
import Kundlioth from "../Smcompo/Kundlioth";
import Bestsell from "../Smcompo/Bestsell/Bestsell";
import Sidebanner from "../Smcompo/Sidebanner";
import Freereport from "../Smcompo/Freereport";
import Recastro from "../Smcompo/Recastro";
import FAQue from "../FAQue";
import Callchatsec from "../Smcompo/Callchatsec";

import CustomInput from "../Custom/CustomInput";
import CustomButton from "../Custom/CustomButton";
import { AlertLoading, LocationSelector } from "@/app/common";
import { useLanguage } from "@/app/context/LangContext";

import { createKundliFromMain } from "../../app/actions/createKundliFromMain";
import { useAuth } from "@/app/context/authContext";
import Select from "react-select";
import { fetchBirthDetails } from "@/app/api/astroapi";

const CURRENT_YEAR = new Date().getFullYear();

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((month, index) => ({
  value: String(index + 1),
  label: month,
}));

const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - 1950 + 1 },
  (_, i) => ({
    value: String(CURRENT_YEAR - i),
    label: String(CURRENT_YEAR - i),
  }),
);

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 52,
    borderRadius: 18,
    borderColor: state.isFocused ? "#9333ea" : "#ddd6fe",
    boxShadow: state.isFocused
      ? "0 0 0 4px rgba(147,51,234,.15)"
      : "0 2px 10px rgba(0,0,0,.05)",
    cursor: "pointer",
    "&:hover": {
      borderColor: "#9333ea",
    },
  }),

  placeholder: (base) => ({
    ...base,
    color: "#6b7280",
  }),

  singleValue: (base) => ({
    ...base,
    color: "#111827",
    fontWeight: 500,
  }),

  input: (base) => ({
    ...base,
    color: "#111827",
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#9333ea"
      : state.isFocused
        ? "#f3e8ff"
        : "#fff",
    color: state.isSelected ? "#fff" : "#111827",
    cursor: "pointer",
  }),

  menu: (base) => ({
    ...base,
    borderRadius: 16,
    overflow: "hidden",
  }),

  menuPortal: (base) => ({
    ...base,
    zIndex: 999999,
  }),

  indicatorSeparator: () => ({
    display: "none",
  }),

  dropdownIndicator: (base) => ({
    ...base,
    color: "#9333ea",
  }),
};
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: String(i).padStart(2, "0"),
  label: String(i).padStart(2, "0"),
}));

const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => ({
  value: String(i).padStart(2, "0"),
  label: String(i).padStart(2, "0"),
}));
const Kundlimain = () => {
  const { isLoggedIn, setShowLogin } = useAuth();
  const { messages: t } = useLanguage();
  const dispatch = useDispatch();
  const getBirthDetails = fetchBirthDetails;

  const [alert, setAlert] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    day: "",
    month: "",
    year: "",
    hour: "",
    min: "",
    birthplace: "",
    lat: "",
    lon: "",
    tzone: 5.5,
  });
  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const validateForm = () => {
    const err = {};
    if (!formData.name) err.name = "Name is required";
    if (!formData.day || !formData.month || !formData.year) {
      err.dob = "Date of Birth is required";
    }

    if (!formData.hour || !formData.min) {
      err.birthTime = "Birth Time is required";
    }
    if (!formData.birthplace) err.birthplace = "Birth Place is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (location) => {
    setFormData((prev) => ({
      ...prev,
      birthplace: `${location.city}, ${location.state}, ${location.country}`,
      lat: Number(location.latitude),
      lon: Number(location.longitude),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(true);

    if (!validateForm()) {
      setAlert(false);
      return;
    }
    if (!isLoggedIn) {
      setPendingRoute({
        type: "kundli",
        payload,
      });
      setShowLogin(true);
      return;
    }
    try {
      const day = Number(formData.day);
      const month = Number(formData.month);
      const year = Number(formData.year);

      const hour = Number(formData.hour);
      const min = Number(formData.min);

      const payload = {
        name: formData.name,
        day,
        month,
        year,
        hour,
        min,
        lat: formData.lat,
        lon: formData.lon,
        tzone: formData.tzone,
        birthplace: formData.birthplace,
      };

      dispatch(setdaUserForm(payload));

      await getBirthDetails(payload).unwrap();

      const fd = new FormData();
      Object.entries(payload).forEach(([key, value]) => fd.append(key, value));

      await createKundliFromMain(fd);
    } catch (err) {
      console.error("Kundli submit failed:", err);
    } finally {
      setAlert(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section className="kundli-main-page py-5">
      <div className="kundli-img-txt flex justify-center bg-linear-to-r from-pink-100 to-yellow-100 shadow-xl rounded-2xl p-5">
        <div className="text-black text-center">
          <h4 className="text-xl md:text-2xl uppercase font-bold">
            {t?.kform?.top || "Discover Your Future with a Free Online Kundli"}
          </h4>
          <p>
            Kundli is an astrological chart showing planetary positions at
            birth.
          </p>
        </div>
      </div>

      <div className="kundli-page mt-5 md:max-w-7xl grid grid-cols-7 gap-5 p-2">
        <div className="col-span-5 flex flex-col gap-5">
          <div className="grid grid-cols-6 gap-5 text-black">
            <div className="col-span-2 bg-linear-to-r from-pink-100 to-yellow-100 shadow-lg rounded-2xl p-5 text-center">
              <Image
                src="/ds-img/ganeshji.png"
                width={100}
                height={100}
                alt="Ganesh Ji"
                className="mx-auto hidden md:block"
              />
              <h4 className="text-xl font-semibold mt-2">KUNDLI FREE ONLINE</h4>
              <p className="text-sm">
                Accurate horoscope and birth chart analysis.
              </p>
            </div>

            <div className="col-span-4 bg-purple-200 shadow-lg rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-center text-purple-700 mb-5">
                {t?.kform?.head || "Enter Your Birth Details"}
              </h2>

              <form
                onSubmit={handleSubmit}
                className="max-w-md mx-auto flex flex-col gap-4"
              >
                <CustomInput
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autofill="name"
                  className="rounded-2xl bg-white/90 py-3 outline-none focus:ring-0 px-4"
                />

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-800">
                    Date of Birth
                  </label>

                  <div className="grid grid-cols-3 gap-3">
                    <Select
                      className="p-1 text-xs rounded-"
                      options={DAY_OPTIONS}
                      placeholder="📅 Day"
                      styles={selectStyles}
                      value={DAY_OPTIONS.find((x) => x.value === formData.day)}
                      onChange={(option) =>
                        updateField("day", option?.value || "")
                      }
                    />

                    <Select
                      className="p-1 text-xs"
                      options={MONTH_OPTIONS}
                      placeholder="🗓 Month"
                      styles={selectStyles}
                      value={MONTH_OPTIONS.find(
                        (x) => x.value === formData.month,
                      )}
                      onChange={(option) =>
                        updateField("month", option?.value || "")
                      }
                    />

                    <Select
                      className="p-1 text-xs"
                      options={YEAR_OPTIONS}
                      placeholder="📆 Year"
                      styles={selectStyles}
                      value={YEAR_OPTIONS.find(
                        (x) => x.value === formData.year,
                      )}
                      onChange={(option) =>
                        updateField("year", option?.value || "")
                      }
                    />
                  </div>

                  {errors.dob && (
                    <p className="text-sm text-red-500">{errors.dob}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-800">
                    Birth Time
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      className="p-1 text-xs"
                      options={HOUR_OPTIONS}
                      placeholder="🕐 Hour"
                      styles={selectStyles}
                      value={HOUR_OPTIONS.find(
                        (x) => x.value === formData.hour,
                      )}
                      onChange={(option) =>
                        updateField("hour", option?.value || "")
                      }
                    />

                    <Select
                      className="p-1 text-xs"
                      options={MINUTE_OPTIONS}
                      placeholder="🕑 Minute"
                      styles={selectStyles}
                      value={MINUTE_OPTIONS.find(
                        (x) => x.value === formData.min,
                      )}
                      onChange={(option) =>
                        updateField("min", option?.value || "")
                      }
                    />
                  </div>

                  {errors.birthTime && (
                    <p className="text-sm text-red-500">{errors.birthTime}</p>
                  )}
                </div>

                <LocationSelector
                  placeholder="Your birth place"
                  onSelect={handleLocationSelect}
                  className="rounded-2xl bg-white/90 py-3 outline-none focus:ring-0 px-4"
                />

                {errors.birthplace && (
                  <p className="text-red-500 text-sm">{errors.birthplace}</p>
                )}

                <CustomButton
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 w-40 text-white px-4 py-2 self-center rounded-full shadow-lg"
                >
                  {t?.kform?.submit || "Submit"}
                </CustomButton>
              </form>
            </div>
          </div>

          <Kundlioth />
        </div>

        <div className="col-span-2">
          <Bestsell />
          <Sidebanner />
        </div>
      </div>

      <AlertLoading show={alert} title="Generating Kundli..." />

      <Freereport />
      <Recastro />
      <FAQue />
      <Callchatsec />
    </section>
  );
};

export default Kundlimain;
