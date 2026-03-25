"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { callAstroData, chatAstroData } from "../navbarcomp/ccastrodata";
export const astroData = [...chatAstroData, ...callAstroData];

import CustomInput from "../Custom/CustomInput";
import { useLanguage } from "@/app/context/LangContext";
import { useAuth } from "@/app/context/authContext";

import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";

const GET_USER_WALLET = gql`
  query GetUserWallet {
    getUserWallet {
      balanceCoins
      lockedCoins
    }
  }
`;

function FilterBar({
  title,
  onFilter,
  onSort,
  searchValue,
  onSearchChange,
  mode,
  onSortChnage,
}) {
  const { messages: t } = useLanguage();
  const router = useRouter();
  //const { isAuth, setShowLogin, setPendingRoute } = useAuth();
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
 // const isAuth = true; // For testing, replace with actual auth logic

  const [user, setUser] = useState(false);

  // ✅ GraphQL Query
  const { data, loading, error, refetch } = useQuery(GET_USER_WALLET, {
    skip: !userData.id,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.name) {
      setUser(true);
    }
  }, []);

  const onRecharge = () => {
    router.push("/add-wallet-money/price-list");
  };

  // ✅ Wallet Balance from GraphQL
  const userbalance = useMemo(() => {
    return data?.getUserWallet?.balanceCoins || 0;
  }, [data]);

  // ---------------- FILTER STATE ----------------
  const [selectedFilters, setSelectedFilters] = useState({
    Skills: [],
    Languages: [],
    Rating: [],
    Experience: [],
    Price: [],
  });

  const dataFilters = {
    Skills: [
      "Vedic",
      "Tarot",
      "KP & Horary Astrology",
      "Lal Kitab",
      "Numerology",
      "Vastu",
      "Prashna",
      "Palmistry",
      "Naadi",
      "Pendulum Dowsing",
      "Fengshui",
      "Psychic Reading & Healing",
      "Love & Relationship",
      "Career in Education",
    ],
    Languages: ["English", "Hindi", "Tamil", "Bengali", "Gujarati", "Telugu"],
    Rating: ["1 Star", "2 Star", "3 Star", "4 Star", "5 Star"],
    Experience: [
      "0-5 Year",
      "5-10 Years",
      "10-15 Years",
      "15-20 Years",
      "20-25 Years",
    ],
    Price: ["0-20", "21-40", "41-60", "61-80"],
  };

  // ---------------- SORT ----------------
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selected, setSelected] = useState("popularity");

  const sortOptions = [
    { id: "expHigh", label: `${t?.astrocard?.sort1 || "Experience : High to Low"}` },
    { id: "expLow", label: `${t?.astrocard?.sort2 || "Experience : Low to High"}` },
    { id: "priceHigh", label: `${t?.astrocard?.sort3 || "Price : High to Low"}` },
    { id: "priceLow", label: `${t?.astrocard?.sort4 || "Price : Low to High"}` },
    { id: "ratingHigh", label: `${t?.astrocard?.sort5 || "Rating : High to Low"}` },
    { id: "ratingLow", label: `${t?.astrocard?.sort6 || "Rating : Low to High"}` },
  ];

  const handleSortSelect = (id) => {
    setSelected(id);
    setIsSortOpen(false);
    if (onSortChnage) onSortChnage(id);
  };

  const handleReset = () => {
    setSelected("popularity");
    setIsSortOpen(false);
    if (onSortChnage) onSortChnage("popularity");
  };

  return (
    <div className="flex flex-col sm:flex-col lg:flex-row justify-between items-center sm:w-[95%] w-full gap-2 sm:gap-1">
      
      <button
        className="text-[#2f1254] text-md sm:text-xl py-1 text-center font-bold"
      >
        {title}
      </button>

      <div className="flex items-center justify-between w-full gap-10 pb-2 sm:gap-2 sm:w-auto sm:py-0">
        
        {/* ✅ WALLET UI */}
        <div className="flex items-center gap-5 border-purple-500 rounded-lg">
          <div>
            {user && (
              <h5 className="text-black flex items-center text-sm">
                💰 ₹{loading ? "..." : userbalance}.00
              </h5>
            )}
          </div>

          <button
            className="cursor-pointer text-xs sm:text-sm py-2 px-4 rounded-full border border-green-600 text-green-600"
            onClick={onRecharge}
          >
            {t?.astrocard?.recharge || "Recharge"}
          </button>
        </div>

        {/* SORT */}
        <div className="flex items-center gap-5">
          <button
            className="cursor-pointer text-xs sm:text-sm py-2 px-6 bg-yellow-300 rounded-full"
            onClick={() => setIsSortOpen((prev) => !prev)}
          >
            {t?.astrocard?.sort || "Sort"}
          </button>

          {isSortOpen && (
            <div className="absolute bg-white p-4 shadow rounded">
              {sortOptions.map((option) => (
                <div key={option.id}>
                  <input
                    type="radio"
                    checked={selected === option.id}
                    onChange={() => handleSortSelect(option.id)}
                  />
                  {option.label}
                </div>
              ))}
            </div>
          )}

          <button
            className="cursor-pointer text-xs sm:text-sm py-2 px-6 bg-yellow-300 rounded-full"
            onClick={handleReset}
          >
            {t?.astrocard?.reset || "Reset"}
          </button>
        </div>

        {/* SEARCH */}
        <div className="h-[2.1rem] w-50 sm:w-68 flex items-center gap-1 px-5 rounded-full border border-green-600">
          <CustomInput
            type="text"
            placeholder={t?.astrocard?.search || "Search by name.."}
            className="w-full text-black text-sm outline-none border-none"
            value={searchValue}
            onChange={onSearchChange}
          />
        </div>

      </div>
    </div>
  );
}

export default React.memo(FilterBar);