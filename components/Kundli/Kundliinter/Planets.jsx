"use client";

import { useSelector } from "react-redux";

import {
  useGetPlanetPositionsQuery,
  useGetVimAllQuery,
} from "@/app/redux/services/astrologyAPI";

export default function Planets() {
  const formData = useSelector((state) => state.daUserForm);

  const isFormEmpty =
    !formData?.day ||
    !formData?.month ||
    !formData?.year ||
    !formData?.hour ||
    !formData?.min ||
    !formData?.lat ||
    !formData?.lon ||
    !formData?.tzone;

  const {
    data: planetsData,
    isLoading: planetsLoading,
    error: planetsError,
  } = useGetPlanetPositionsQuery(formData, {
    skip: isFormEmpty,
  });

  const {
    data: vimData,
    isLoading: vimLoading,
    error: vimError,
  } = useGetVimAllQuery(formData, {
    skip: isFormEmpty,
  });

  if (isFormEmpty) {
    return (
      <p className="text-center text-gray-400">Waiting for user data...</p>
    );
  }

  if (planetsLoading || vimLoading) {
    return (
      <div className="flex justify-center flex-col gap-4 items-center h-32">
        <span className="loader-all"></span>
        <span className="ml-3 text-purple-600 font-medium">
          Loading Reports...
        </span>
      </div>
    );
  }

  if (planetsError || vimError) {
    return <Message text="Failed to load planetary data." color="red" />;
  }
  if (!planetsData || !vimData)
    return <Message text="No data received." color="red" />;

  const roundUp = (num, decimalPlaces) => {
    if (typeof num !== "number") return "—";
    const factor = Math.pow(10, decimalPlaces);
    return Math.ceil(num * factor) / factor;
  };

  return (
    <div className="basic-kundli-charts flex flex-col gap-4 items-center px-2 sm:px-4 pb-10">
      <h2 className="text-sm md:text-xl font-bold text-purple-700">
        Planet Positions
      </h2>

      <div className="basic-det w-full flex flex-col border rounded-lg shadow-lg p-2 border-purple-100">
        <div className="overflow-x-auto sm:w-88 w-80 md:w-full text-black text-xs md:text-sm">
          <div className="basic-box flex flex-col gap-1 w-180 md:w-full">
            <div className="pl-ul grid grid-cols-9 bg-purple-400 rounded-lg px-5 py-2 text-nowrap">
              {[
                "Planet",
                "Sign",
                "Sign Lord",
                "Nakshatra",
                "Naksh Lord",
                "Degree",
                "Retro(R)",
                "Awastha",
                "House",
              ].map((head, i) => (
                <h5 key={i} className="text-xs sm:text-sm font-semibold">
                  {head}
                </h5>
              ))}
            </div>

            {planetsData.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-9 text-xs sm:text-sm bg-purple-200 rounded-lg px-4 py-2 mb-2"
              >
                <span>{item.name || "—"}</span>
                <span>{item.sign || "—"}</span>
                <span>{item.signLord || "—"}</span>
                <span>{item.nakshatra || "—"}</span>
                <span>{item.nakshatraLord || "—"}</span>
                <span>{roundUp(item.normDegree, 3)}</span>
                <span>{item.isRetro ? "Yes" : "No"}</span>
                <span>{item.planet_awastha || "—"}</span>
                <span>{item.house || "—"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="vimh-det mt-6 w-full">
          <h5 className="text-sm md:text-xl text-center  mb-2 font-bold text-purple-700">
            Vimshottari Dasha
          </h5>
          <div className="basic-box flex flex-col gap-3 text-black">
            <div className="pl-ul grid grid-cols-4 bg-purple-400 rounded-lg px-5 py-2">
              {["Planet", "Start Date", "End Date", "Next"].map((head, i) => (
                <h5 key={i} className="text-xs sm:text-sm font-semibold">
                  {head}
                </h5>
              ))}
            </div>

            {vimData.map((item, index) => (
              <div
                key={index}
                className="basic-card grid grid-cols-4 gap-4 bg-purple-200 rounded-lg px-5 text-xs sm:text-sm py-2"
              >
                <span>{item.planet || "—"}</span>
                <span>{item.start || "—"}</span>
                <span>{item.end || "—"}</span>
                <span>{item.nxt || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Message({ text, color }) {
  return <p className={`text-center text-${color}-500`}>{text}</p>;
}
