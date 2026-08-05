"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useScrollZoom from "@/Hooks/scrollZoom";

export default function HoroscopeClient({
  horoscopezod,
  selectedZodiac,
}) {
  const router = useRouter();

  useScrollZoom(".head-wrap");

  const handleZodiacClick = (zodiac) => {
router.push(`/freeservices/horoscope/${zodiac.toLowerCase()}`, {
  scroll: false,
});
  };

  return (
    <section className=" flex flex-col w-full gap-5">
      {/* Header */}
      <div className="text-black md:p-5 head-wrap bg-gradient-to-r from-pink-100 to-yellow-100 shadow-lg rounded-2xl p-5 text-center">
        <h1 className="text-[#2f1254] text-base sm:text-2xl font-semibold">
          About Horoscope
        </h1>

        <p className="text-black text-xs sm:text-sm mt-2">
          Horoscopes help you discover your strengths and challenges through the
          lens of Vedic Astrology.
        </p>
      </div>

      {/* Zodiac Grid */}
      <section className="relative w-full bg-[#000] mx-auto py-5 px-4 rounded-2xl overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{
            backgroundImage: "url('/ds-img/mnew.jpg')",
          }}
        />

        <div className="relative flex flex-col justify-center">
          <h2 className="text-base sm:text-2xl pb-4 text-white text-center font-bold">
            • Know Yourself Through Your Sign •
          </h2>

          <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-5">
            {horoscopezod.map((horo) => (
              <div
                key={horo.name}
                onClick={() => handleZodiacClick(horo.name)}
                className={`cursor-pointer flex flex-col items-center rounded-xl sm:rounded-4xl shadow-lg p-3 lg:p-5 transition-all ${
                  selectedZodiac === horo.name
                    ? "bg-purple-200 scale-105"
                    : "bg-white hover:scale-105"
                }`}
              >
                <Image
                  src={horo.img}
                  alt={horo.name}
                  width={100}
                  height={100}
                />

                <div className="mt-1 text-black flex flex-col items-center">
                  <p className="text-xs md:text-sm font-semibold">
                    {horo.name}
                  </p>

                  <p className="text-[10px] md:text-xs font-semibold">
                    {horo.indate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}