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
import { GET_ASTROLOGER_CATEGORIES } from "@/app/graphql/gqlQuery";

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
    {
      id: "expHigh",
      label: `${t?.astrocard?.sort1 || "Experience : High to Low"}`,
    },
    {
      id: "expLow",
      label: `${t?.astrocard?.sort2 || "Experience : Low to High"}`,
    },
    {
      id: "priceHigh",
      label: `${t?.astrocard?.sort3 || "Price : High to Low"}`,
    },
    {
      id: "priceLow",
      label: `${t?.astrocard?.sort4 || "Price : Low to High"}`,
    },
    {
      id: "ratingHigh",
      label: `${t?.astrocard?.sort5 || "Rating : High to Low"}`,
    },
    {
      id: "ratingLow",
      label: `${t?.astrocard?.sort6 || "Rating : Low to High"}`,
    },
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
  const [active, setActive] = useState("all");

  const { data: categoryData } = useQuery(GET_ASTROLOGER_CATEGORIES);
  const categories = [
    {
      id: "all",
      name: "All",
      type: "ALL",
    },

    ...(categoryData?.getAstrologerCategories || []),
  ];
  const getChipColor = (type) => {
    if (type === "SKILL") return "bg-purple-100 text-purple-700";

    return "bg-orange-100 text-orange-700";
  };

  return (
    <div className=" flex flex-col items-center sm:w-[93%] w-full gap-3 ">
      <div className="flex flex-row sm:flex-col  shadow-xl rounded-2xl  bg-violet-100 px-3 sm:px-5 py-2 sm:py-4 lg:flex-row justify-between sm:items-center w-full gap-2 sm:gap-1">
        <div className="flex flex-col items-start justify-start">
          <h1 className="text-[#2f1254] text-md sm:text-xl py-1 text-start sm:text-center font-bold">
            {title}
          </h1>
          <div className="h-[1.9rem] sm:[2.1rem]  w-50 sm:hidden flex gap-2 sm:w-68  items-center  px-3 rounded-full bg-white border border-purple-300">
            <svg width={25} height={25} viewBox="0 0 640 640">
              <path
                fill="rgba(102, 81, 167, 1.00)"
                d="M463 448.2C440.9 409.8 399.4 384 352 384L288 384C240.6 384 199.1 409.8 177 448.2C212.2 487.4 263.2 512 320 512C376.8 512 427.8 487.3 463 448.2zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320zM320 336C359.8 336 392 303.8 392 264C392 224.2 359.8 192 320 192C280.2 192 248 224.2 248 264C248 303.8 280.2 336 320 336z"
              />
            </svg>{" "}
            <CustomInput
              type="text"
              placeholder={t?.astrocard?.search || "Search by name.."}
              className="w-full text-black text-sm placeholder:text-xs outline-none border-none"
              value={searchValue}
              onChange={onSearchChange}
            />
          </div>
        </div>

        <div className="flex items-center justify-end w-full  pb-2 sm:gap-5  sm:py-0">
          {/* ✅ WALLET UI */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-5 border-purple-500 rounded-lg">
            <div>
              {user && (
                <div className="text-black flex items-center gap-1 sm:gap-2 bg-black/10 border border-violet-300 rounded-lg px-1 sm:px-2 sm:py-1 text-sm">
                  <svg width={25} height={25} viewBox="0 0 640 640">
                    <path
                      fill="rgb(102, 81, 167)"
                      d="M128 96C92.7 96 64 124.7 64 160L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 256C576 220.7 547.3 192 512 192L136 192C122.7 192 112 181.3 112 168C112 154.7 122.7 144 136 144L520 144C533.3 144 544 133.3 544 120C544 106.7 533.3 96 520 96L128 96zM480 320C497.7 320 512 334.3 512 352C512 369.7 497.7 384 480 384C462.3 384 448 369.7 448 352C448 334.3 462.3 320 480 320z"
                    />
                  </svg>
                  <span className="font-semibold text-xs sm:text-base ">
                    {" "}
                    ₹{loading ? "..." : userbalance}.00
                  </span>
                </div>
              )}
            </div>

            <button
              className="cursor-pointer text-[10px] sm:text-sm py-1 sm:py-2 px-2 sm:px-4 rounded-full border bg-green-600 text-white"
              onClick={onRecharge}
            >
              {t?.astrocard?.recharge || "Recharge"}
            </button>
          </div>

          {/* SORT */}
          <div className="sm:flex hidden items-center gap-5">
            <button
              className="cursor-pointer text-black text-xs sm:text-sm py-2 px-6 bg-yellow-300 rounded-full"
              onClick={() => setIsSortOpen((prev) => !prev)}
            >
              {t?.astrocard?.sort || "Sort"}
            </button>

            {isSortOpen && (
              <div
                className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[92%] max-w-sm sm:absolute sm:w-72 sm:left-auto sm:right-0 sm:bottom-auto sm:translate-x-0 bg-white
      rounded-2xl shadow-xl p-4 z-[60] "
              >
                {sortOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center gap-3 py-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      checked={selected === option.id}
                      onChange={() => handleSortSelect(option.id)}
                    />

                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            )}

            <button
              className="cursor-pointer text-black text-xs sm:text-sm py-2 px-6 bg-yellow-300 rounded-full"
              onClick={handleReset}
            >
              {t?.astrocard?.reset || "Reset"}
            </button>
          </div>
          <div className="sm:hidden fixed bottom-0 left-0 w-full z-50 bg-linear-to-r from-purple-900 via-purple-800 to-purple-900 border-t shadow-lg px-4 py-3">
            <div className="flex  text-black items-center justify-around  gap-3">
              <button
                className=" py-1 sm:py-3 bg-yellow-500 rounded-full px-7  text-xs sm:text-sm font-medium"
                onClick={() => setIsSortOpen((prev) => !prev)}
              >
                {t?.astrocard?.sort || "Sort"}
              </button>

              <button
                className=" py-1 sm:py-3 bg-yellow-500 rounded-full px-7  text-xs sm:text-sm font-medium"
                onClick={handleReset}
              >
                {t?.astrocard?.reset || "Reset"}
              </button>
            </div>
            {isSortOpen && (
              <div className="sm:hidden fixed inset-0 z-[60] bg-black/40">
                <div className="absolute bottom-16 left-4 right-4 bg-white rounded-2xl p-4 shadow-xl">
                  {sortOptions.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-3 py-3"
                    >
                      <input
                        type="radio"
                        checked={selected === option.id}
                        onChange={() => handleSortSelect(option.id)}
                      />

                      <span className="text-xs sm:text-sm text-black">{option.label}</span>
                    </label>
                  ))}

                  <button
                    className="mt-3 w-full py-2 rounded-full text-black bg-gray-200"
                    onClick={() => setIsSortOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SEARCH */}
          <div className="h-[2.1rem] hidden w-50 sm:flex gap-2 sm:w-68  items-center  px-3 rounded-full border border-green-600">
            <svg width={25} height={25} viewBox="0 0 640 640">
              <path
                fill="rgba(102, 81, 167, 1.00)"
                d="M463 448.2C440.9 409.8 399.4 384 352 384L288 384C240.6 384 199.1 409.8 177 448.2C212.2 487.4 263.2 512 320 512C376.8 512 427.8 487.3 463 448.2zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320zM320 336C359.8 336 392 303.8 392 264C392 224.2 359.8 192 320 192C280.2 192 248 224.2 248 264C248 303.8 280.2 336 320 336z"
              />
            </svg>{" "}
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

      <div className="w-full overflow-scroll  hide-scrollbar ">
        <div className="flex gap-3 overflow-x-auto  px-2 py-1 hide-scrollbar">
          {categories.map((cat) => {
            const isActive = active === cat.id;

            return (
              <button
                key={cat.name}
                onClick={() => {
                  setActive(cat.id);

                  onFilter?.(cat);
                }}
                className={`flex items-center gap-2 px-4 py-1 rounded-full text-[10px] sm:text-sm whitespace-nowrap transition              
            ${isActive ? "bg-yellow-400" : getChipColor(cat.type)}`}
              >
                {/* {cat.icon} */}
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default React.memo(FilterBar);
