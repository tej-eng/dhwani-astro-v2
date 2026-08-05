"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import CustomInput from "@/components/Custom/CustomInput";

export const metadata = {
  title: "Zodiac & Rashi Finder | Free Astrology Tool",
  description:
    "Find your Zodiac sign or Rashi based on your birth date or name. Discover personality traits and Vedic meanings.",
  keywords:
    "zodiac sign finder, rashi finder, horoscope, astrology sign calculator, vedic astrology",
};

const ZODIAC_DATA = [
  {
    sign: "Aries",
    emoji: "♈",
    start: "03-21",
    end: "04-19",
    desc: "Bold, confident, full of energy 🔥",
  },
  {
    sign: "Taurus",
    emoji: "♉",
    start: "04-20",
    end: "05-20",
    desc: "Reliable, calm, loves comfort 🌿",
  },
  {
    sign: "Gemini",
    emoji: "♊",
    start: "05-21",
    end: "06-20",
    desc: "Curious, adaptable, talkative 💨",
  },
  {
    sign: "Cancer",
    emoji: "♋",
    start: "06-21",
    end: "07-22",
    desc: "Emotional, loyal, nurturing 🌊",
  },
  {
    sign: "Leo",
    emoji: "♌",
    start: "07-23",
    end: "08-22",
    desc: "Charismatic, creative, leader 🌞",
  },
  {
    sign: "Virgo",
    emoji: "♍",
    start: "08-23",
    end: "09-22",
    desc: "Analytical, practical, perfectionist 🌾",
  },
  {
    sign: "Libra",
    emoji: "♎",
    start: "09-23",
    end: "10-22",
    desc: "Balanced, charming, peacemaker ⚖️",
  },
  {
    sign: "Scorpio",
    emoji: "♏",
    start: "10-23",
    end: "11-21",
    desc: "Intense, mysterious, passionate 🦂",
  },
  {
    sign: "Sagittarius",
    emoji: "♐",
    start: "11-22",
    end: "12-21",
    desc: "Adventurous, honest, optimistic 🏹",
  },
  {
    sign: "Capricorn",
    emoji: "♑",
    start: "12-22",
    end: "01-19",
    desc: "Disciplined, ambitious, patient 🏔️",
  },
  {
    sign: "Aquarius",
    emoji: "♒",
    start: "01-20",
    end: "02-18",
    desc: "Independent, visionary, quirky 💧",
  },
  {
    sign: "Pisces",
    emoji: "♓",
    start: "02-19",
    end: "03-20",
    desc: "Dreamy, artistic, empathetic 🌊",
  },
];

const RASHI_DATA = [
  {
    sign: "Mesh (Aries)",
    emoji: "♈",
    letters: ["A", "L", "E"],
    desc: "Energetic and bold 🔥",
  },
  {
    sign: "Vrishabh (Taurus)",
    emoji: "♉",
    letters: ["B", "V", "U"],
    desc: "Patient and dependable 🌿",
  },
  {
    sign: "Mithun (Gemini)",
    emoji: "♊",
    letters: ["K", "C", "G"],
    desc: "Quick and curious 💨",
  },
  {
    sign: "Karka (Cancer)",
    emoji: "♋",
    letters: ["H", "D"],
    desc: "Emotional and caring 🌊",
  },
  {
    sign: "Simha (Leo)",
    emoji: "♌",
    letters: ["M", "T"],
    desc: "Confident and proud 🌞",
  },
  {
    sign: "Kanya (Virgo)",
    emoji: "♍",
    letters: ["P", "TH"],
    desc: "Intelligent and precise 🌾",
  },
  {
    sign: "Tula (Libra)",
    emoji: "♎",
    letters: ["R", "T"],
    desc: "Balanced and fair ⚖️",
  },
  {
    sign: "Vrishchik (Scorpio)",
    emoji: "♏",
    letters: ["N", "Y"],
    desc: "Intense and passionate 🦂",
  },
  {
    sign: "Dhanu (Sagittarius)",
    emoji: "♐",
    letters: ["BH", "F", "DH"],
    desc: "Adventurous and free 🏹",
  },
  {
    sign: "Makar (Capricorn)",
    emoji: "♑",
    letters: ["KH", "J"],
    desc: "Ambitious and practical 🏔️",
  },
  {
    sign: "Kumbh (Aquarius)",
    emoji: "♒",
    letters: ["G", "S", "SH"],
    desc: "Innovative and thoughtful 💧",
  },
  {
    sign: "Meen (Pisces)",
    emoji: "♓",
    letters: ["D", "CH", "Z"],
    desc: "Dreamy and artistic 🌊",
  },
];

export default function ZodiacServer() {
  const [birthDate, setBirthDate] = useState("");
  const [userName, setUserName] = useState("");
  const [result, setResult] = useState(null);

  const findZodiac = useCallback(() => {
    if (!birthDate) {
      toast.error("Please select your birth date.");
      return;
    }

    const [, month, day] = birthDate.split("-");
    const current = `${month}-${day}`;

    const zodiac = ZODIAC_DATA.find(({ start, end }) =>
      start <= end
        ? current >= start && current <= end
        : current >= start || current <= end,
    );

    setResult(zodiac ?? null);
  }, [birthDate]);

  const findRashi = useCallback(() => {
    if (!userName.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    const firstLetter = userName.trim().toUpperCase();

    const rashi = RASHI_DATA.find(({ letters }) =>
      letters.some((letter) => firstLetter.startsWith(letter)),
    );

    setResult(
      rashi ?? {
        sign: "Unknown",
        emoji: "❓",
        desc: "Couldn't determine your Rashi.",
      },
    );
  }, [userName]);

  return (
    <section className="unc-zod-sign w-full flex flex-col items-center bg-linear-to-r from-purple-400 to-purple-600 p-8 rounded-3xl text-white gap-4 mx-auto">
      <h2 className="text-md sm:text-2xl font-semibold">
        🔮 Uncover Your Zodiac or Rashi
      </h2>
      <p className="text-center text-xs sm:text-sm max-w-2xl text-white/90">
        Use your birth date or name to find your Zodiac sign and its traits
        instantly.
      </p>
      <div className="w-full sm:w-[80%] flex flex-wrap justify-between items-center gap-5 mt-5">
        <div className="flex items-center gap-4">
          <CustomInput
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="px-2 sm:py-2.5 py-1  text-gray-800 placeholder:text-xs placeholder:text-gray-400 bg-white/50 rounded-full outline-none"
          />
          <button
            aria-label="Find Zodiac Sign"
            onClick={findZodiac}
            className="bg-purple-800 hover:bg-purple-900 px-5 text-[10px] sm:text-sm   w-fit py-2 rounded-full"
          >
            Find Sign
          </button>
        </div>

        <div className="flex items-center gap-4">
          <CustomInput
            type="text"
            placeholder="Enter Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="px-2 sm:py-2.5 py-1  text-gray-800 bg-white/50 rounded-full outline-none text-start placeholder:text-xs placeholder:text-gray-400"
          />
          <button
            aria-label="Find Rashi"
            onClick={findRashi}
            className="bg-purple-800 hover:bg-purple-900 text-[10px] sm:text-sm px-5 w-fit py-2 rounded-full"
          >
            Find Rashi
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-6 text-center border-gray-300 shadow-xl border bg-purple-400 p-4 rounded-2xl">
          <h3 className="text-xl font-bold">
            {result.emoji} {result.sign}
          </h3>
          <p className="text-sm mt-2">{result.desc}</p>
        </div>
      )}
    </section>
  );
}
