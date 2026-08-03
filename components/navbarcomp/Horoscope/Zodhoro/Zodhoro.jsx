"use client";

import { useState } from "react";
import useScrollZoom from "@/Hooks/scrollZoom";
import HoroscopeContent from "./HoroscopeContent";

export default function Zodhoro({
  zodiac,
  today,
  tomorrow,
  yesterday,
}) {
  useScrollZoom(".head-wrap");

  const [activeTab, setActiveTab] = useState("today");

  const tabs = [
    {
      id: "yesterday",
      label: "Yesterday",
      data: yesterday,
    },
    {
      id: "today",
      label: "Today",
      data: today,
    },
    {
      id: "tomorrow",
      label: "Tomorrow",
      data: tomorrow,
    },
  ];

  const currentData =
    tabs.find((tab) => tab.id === activeTab)?.data || today;

  return (
    <section className="zodiac-main-box flex flex-col items-center justify-center head-wrap">
      <h5 className="text-center md:text-2xl text-base text-black font-semibold capitalize">
        {zodiac}
      </h5>

      <section className="zod-days w-[90%] m-5 justify-self-center">
        <ul className="flex justify-center bg-linear-to-r from-[#8d5c9cec] to-[#5b35b3f9] rounded-2xl w-full p-3 flex-wrap gap-5">
          {tabs.map((tab) => (
            <li
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer text-sm lg:text-base px-4 py-1.5 rounded-xl transition ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
            >
              {tab.label}
            </li>
          ))}
        </ul>

        <div className="mt-5">
          <HoroscopeContent data={currentData} />
        </div>
      </section>
    </section>
  );
}