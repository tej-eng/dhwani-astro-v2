"use client";
import React, { useEffect, useState, useContext, useMemo, useRef } from "react"; //  useRef added
import CustomInput from "@/components/Custom/CustomInput";
import CustomSelect from "@/components/Custom/CustomSelect";
import { useDispatch, useSelector } from "react-redux";
import { CustomerRequest, AlertLoading, LocationSelector } from "@/app/common";
import toast from "react-hot-toast";
import SocketContext from "@/app/context/socketContext";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import metadata from "libphonenumber-js/metadata.min.json";

//  RHF + ZOD
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestFormSchema } from "@/lib/userZodIntake";
import Image from "next/image";
import { StarIcon } from "flowbite-react";
import { addActiveRequest } from "../redux/reducer/chat/sendRequestSlice";
import { createRequestAndEmit } from "@/utils/createRequestAndEmit";

// import { createRequestAndEmit } from "@/utils/createRequestAndEmit";

const CREATE_INTAKE = gql`
  mutation CreateIntake($input: IntakeInput!) {
    createIntake(input: $input) {
      intakeId
      roomId
      chatTime
      message
      pricePerMin
      pricingType
    }
  }
`;

const GET_USER_BY_ID = gql`
  query GetUserById($id: String!) {
    getUserById(id: $id) {
      id
      name
      countryCode
      mobile
      gender
      birthDate
      birthTime
      occupation
    }
  }
`;

const GET_ASTROLOGER_BY_ID = gql`
  query GetAstrologerById($id: String!) {
    getAstrologerById(id: $id) {
      id
      name
      profilePic
      rating
      about
      experience
      skills
      languages

      pricing {
        type
        price
        offerPrice
        commissionPercent
        isActive
      }
    }
  }
`;

export default function RequestForm({ mode, astroId }) {
  const debounceRef = useRef(null); //  debounce added

  const [createIntake] = useMutation(CREATE_INTAKE);
  const astro_id = astroId;

  const router = useRouter();
  const { socket, connectSocket } = useContext(SocketContext);
  const dispatch = useDispatch();

  const [astrologer, setAstrologer] = useState(null);
  const [country, setCountry] = useState(null);
  const [id, setId] = useState(null);
  const [chatTime, setChatTime] = useState(0);
  const countries = useMemo(() => getCountries(), []);
  const [roomId, setRoomId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (!socket) return;

    const originalEmit = socket.emit;

    socket.emit = function (...args) {
      return originalEmit.apply(this, args);
    };

    return () => {
      socket.emit = originalEmit;
    };
  }, [socket]);

  //  RHF
  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(requestFormSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      phone: "",
      countryCode: "",
      usergender: "",
      dob: "",
      time: "",
      occupation: "Private Job",
      place: "",
      latitude: "",
      longitude: "",
      source: "WEB",
    },
  });

  //  DEBOUNCE WRAPPER (NO LOGIC CHANGE)
  const handleDebouncedSubmit = (data) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      onSubmit(data);
    }, 400);
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setId(parsed?.id);
    }
  }, []);

  const { data: userInfo } = useQuery(GET_USER_BY_ID, {
    variables: { id },
    skip: !id,
  });

  const { data: astrologerInfo, loading } = useQuery(GET_ASTROLOGER_BY_ID, {
    variables: { id: astro_id },
    skip: !astro_id,
  });

  useEffect(() => {
    if (astrologerInfo?.getAstrologerById) {
      const astroData = astrologerInfo.getAstrologerById;

      // Find active pricing according to mode
      const selectedPricing = astroData?.pricing?.find(
        (item) =>
          item?.type?.toUpperCase() === mode?.toUpperCase() && item?.isActive,
      );

      setAstrologer({
        ...astroData,

        // Backward compatibility
        price: selectedPricing?.offerPrice || selectedPricing?.price || 0,

        // Extra fields
        pricePerMin: selectedPricing?.offerPrice || selectedPricing?.price || 0,

        pricingType: selectedPricing?.type || mode,

        activePricing: selectedPricing || null,
      });
    }
  }, [astrologerInfo, mode]);

  useEffect(() => {
    if (userInfo?.getUserById) {
      const user = userInfo.getUserById;

      setValue("name", user?.name || "");
      setValue("phone", user?.mobile || "");
      setValue("countryCode", user?.countryCode || "");
      setValue("usergender", user?.gender || "");
      setValue("dob", user?.birthDate ? user.birthDate.split("T")[0] : "");
      setValue("time", user?.birthTime || "");
      setValue("occupation", user?.occupation || "");
      setValue("source", "WEB");

      if (user?.countryCode && countries.length > 0) {
        const matched = countries.find((c) => c.dialCode === user.countryCode);
        if (matched) setCountry(matched);
      }
    }
  }, [userInfo, countries, setValue]);

  const onSubmit = async (data) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await createRequestAndEmit({
        createIntake,
        mode,
        astro_id,
        profileData: data,
        socket,
        connectSocket,
        astrologer,
        pricePerMin: astrologer?.pricePerMin || 0,
        dispatch,
        router,
        userId: id,
        source: "WEB",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const occupation_list = [
    "Student",
    "Engineer",
    "Doctor",
    "Business",
    "Teacher",
    "Government Job",
    "Private Job",
    "Self Employed",
    "Unemployed",
    "Other",
  ];

  function getCountries() {
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
    const codes = Object.keys(metadata.countries);

    return codes.map((iso) => ({
      iso,
      name: displayNames.of(iso),
      dialCode: `+${metadata.countries[iso][0]}`,
    }));
  }

  const users = [
    { id: 1, img: "/ds-img/a.jpg" },
    { id: 2, img: "/ds-img/ak.jpg" },
    { id: 3, img: "/ds-img/anvi.svg" },
    { id: 4, img: "/ds-img/neel.jpg" },
    { id: 5, img: "/ds-img/sachin.svg" },
    { id: 6, img: "/ds-img/ser1.webp" },
    { id: 7, img: "/ds-img/s7.png" },
    { id: 8, img: "/ds-img/anvi.svg" },
  ];

  return (
    <div className="w-full">
      {/*  IMPORTANT CHANGE HERE */}
      <form onSubmit={handleSubmit(handleDebouncedSubmit)}>
        <div className="flex items-start justify-center gap-5 px-10 my-10 text-black">
          <div className="w-full max-w-5xl bg-white shadow-lg rounded-2xl">
            <div className="bg-linear-to-r from-purple-900 via-purple-800 to-purple-900 gap-2 items-center justify-center py-3 rounded-full flex flex-col text-white">
              <h1 className="text-2xl font-semibold">Consultation Form</h1>
              <div className="flex items-center justify-between gap-15 text-xs font-extralight">
                <span className="border border-purple-700 bg-black/20 shadow-2xl px-4 py-1 rounded-full">
                  ✨ Get answers in 2 minutes
                </span>
                <span className="border border-purple-700 bg-black/20 shadow-2xl px-4 py-1 rounded-full">
                  🔒 “Your data is secure”
                </span>
                <span className="border border-purple-700 bg-black/20 shadow-2xl px-4 py-1 rounded-full">
                  👨‍🔬 “Verified astrologers only”
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
              {/* NAME */}
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <CustomInput
                    {...field}
                    label="Name"
                    placeholder="Enter your name here"
                    className="rounded-full text-sm border-gray-200 border focus:ring-purple-100  focus:ring-1 focus:outline-0 px-4 py-2"
                    error={errors.name?.message}
                    maxLength={150}
                    onChange={(e) => {
                      if (e.target.value.length <= 150) {
                        field.onChange(e);
                      }
                    }}
                  />
                )}
              />

              <div className="flex flex-col space-y-1">
                <label className="text-sm font-semibold">Contact Number</label>
                <div className="flex items-center gap-2">
                  <Controller
                    name="countryCode"
                    control={control}
                    render={({ field }) => <input type="hidden" {...field} />}
                  />

                  <select
                    className=" border-gray-200 border text-xs rounded-lg focus:ring-purple-100  focus:ring-1 focus:outline-0 px-2 py-2"
                    value={country?.iso || ""}
                    onChange={(e) => {
                      const selected = countries.find(
                        (c) => c.iso === e.target.value,
                      );
                      setCountry(selected);

                      setValue("countryCode", selected?.dialCode, {
                        shouldValidate: true,
                      });
                    }}
                  >
                    {countries.map((c) => (
                      <option className="text-xs" key={c.iso} value={c.iso}>
                        {c.dialCode}
                      </option>
                    ))}
                  </select>

                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <CustomInput
                        {...field}
                        type="tel"
                        placeholder="Enter your contact number here"
                        className="rounded-full text-sm border-gray-200 border focus:ring-purple-100  focus:ring-1 focus:outline-0 px-4 py-2"
                        error={errors.phone?.message}
                        maxLength={15}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 15);
                          field.onChange(value);
                        }}
                      />
                    )}
                  />
                </div>
              </div>

              {/* GENDER */}
              <Controller
                name="usergender"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    {...field}
                    className="rounded-full text-sm border-gray-200 border focus:ring-purple-100  focus:ring-1 focus:outline-0 px-4 py-2"
                    label="Gender"
                    options={["MALE", "FEMALE", "OTHER"]}
                    error={errors.usergender?.message}
                  />
                )}
              />

              {/* DOB */}
              <Controller
                name="dob"
                control={control}
                render={({ field }) => (
                  <CustomInput
                    {...field}
                    type="date"
                    label="Date of Birth"
                    className="rounded-full text-sm border-gray-200 border focus:ring-purple-100  focus:ring-1 focus:outline-0 px-4 py-2"
                    max={new Date().toISOString().split("T")[0]}
                    error={errors.dob?.message}
                  />
                )}
              />

              {/* TIME */}
              <Controller
                name="time"
                control={control}
                render={({ field }) => (
                  <CustomInput
                    {...field}
                    type="time"
                    label="Time of Birth"
                    className="rounded-full text-sm border-gray-200 border focus:ring-purple-100  focus:ring-1 focus:outline-0 px-4 py-2"
                    error={errors.time?.message}
                  />
                )}
              />

              {/* OCCUPATION */}
              <Controller
                name="occupation"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    {...field}
                    label="Your Occupation"
                    className="rounded-full text-sm border-gray-200 border focus:ring-purple-100  focus:ring-1 focus:outline-0 px-4 py-2"
                    options={occupation_list}
                    error={errors.occupation?.message}
                    maxLength={150}
                  />
                )}
              />

              <div className="md:col-span-2 ">
                <Controller
                  name="place"
                  control={control}
                  render={({ field }) => <input type="hidden" {...field} />}
                />

                <LocationSelector
                  onSelect={(loc) => {
                    setValue("place", loc?.city || "", {
                      shouldValidate: true,
                    });

                    setValue("latitude", loc?.latitude || "");
                    setValue("longitude", loc?.longitude || "");
                  }}
                />
                <Controller
                  name="latitude"
                  control={control}
                  render={({ field }) => <input type="hidden" {...field} />}
                />

                <Controller
                  name="longitude"
                  control={control}
                  render={({ field }) => <input type="hidden" {...field} />}
                />

                {errors.place && (
                  <p className="text-red-500 text-[10px]">
                    {errors.place.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-3 text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-yellow-400 rounded-full disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Please wait..."
                    : mode === "call"
                      ? "Start Call Now"
                      : "Start Chat Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="bg-linear-to-r from-purple-300 via-violet-400 to-purple-200 gap-2 items-center justify-center py-3 flex flex-col text-white">
        <div className="flex items-center text-black justify-between gap-15 text-sm font-semibold">
          <div className="flex items-center gap-3">
            {/* Avatar Stack */}
            <div className="flex items-center">
              {users.map((user, index) => (
                <div
                  key={user.id}
                  className={`w-10 h-10 rounded-full border-2 border-white overflow-hidden 
            ${index !== 0 ? "-ml-3" : ""}`}
                >
                  <Image
                    src={user.img}
                    width={100}
                    height={100}
                    alt="user"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}

              {/* Extra count */}
              <div className="-ml-3 w-10 h-10 flex items-center justify-center text-white rounded-full bg-gray-800 text-sm font-medium border-2 border-white">
                +500
              </div>
            </div>
          </div>
          <span className="  px-4 py-1 ">⭐⭐⭐⭐⭐ 4.9 (50k+ reviews)</span>
        </div>
      </div>

      <AlertLoading show={loading} title="Fetch Astrologer..." />
    </div>
  );
}
