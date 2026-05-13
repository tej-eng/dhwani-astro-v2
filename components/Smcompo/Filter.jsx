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
  onSelectCategory,

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
    if (onSelectCategory) {
      onSelectCategory("All");
    }
  };


  const [active, setActive] = useState("All");

  const selectCategory = (name) => {
    setActive(name);
    if (onSelectCategory) onSelectCategory(name);

  }


  const categories = [
    {

      name: "All",
      // icon: <Sparkles size={16} />,
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      name: "Tarot Reading",
      // icon: <Star size={16} />,
      color: "bg-purple-100 text-purple-700",
    },
    {
      name: "Palmistry",
      // icon: <Hand size={16} />,
      color: "bg-pink-100 text-pink-700",
    },
    {
      name: "Numerology",
      // icon: <Calculator size={16} />,
      color: "bg-blue-100 text-blue-700",
    },
    {
      name: "Face Reading",
      // icon: <Eye size={16} />,
      color: "bg-green-100 text-green-700",
    },
    {
      name: "Vedic",
      // icon: <Sparkles size={16} />,
      color: "bg-indigo-100 text-indigo-700",
    },
    {
      name: "Love",
      // icon: <Heart size={16} />,
      color: "bg-red-100 text-red-700",
    },
    {
      name: "Education",
      // icon: <BookOpen size={16} />,
      color: "bg-orange-100 text-orange-700",
    },
    {
      name: "N1",
      // icon: <Calculator size={16} />,
      color: "bg-blue-100 text-blue-700",
    },
    {
      name: "Face 1 ",
      // icon: <Eye size={16} />,
      color: "bg-green-100 text-green-700",
    },
    {
      name: "Vedic 1",
      // icon: <Sparkles size={16} />,
      color: "bg-indigo-100 text-indigo-700",
    },
    {
      name: "Love 1",
      // icon: <Heart size={16} />,
      color: "bg-red-100 text-red-700",
    },
    {
      name: "Education 1",
      // icon: <BookOpen size={16} />,
      color: "bg-orange-100 text-orange-700",
    },
    {
      name: "Numerology 2",
      // icon: <Calculator size={16} />,
      color: "bg-blue-100 text-blue-700",
    },
    {
      name: "Face Reading 2",
      // icon: <Eye size={16} />,
      color: "bg-green-100 text-green-700",
    },
    {
      name: "Vedic 2",
      // icon: <Sparkles size={16} />,
      color: "bg-indigo-100 text-indigo-700",
    },
    {
      name: "Love 2",
      // icon: <Heart size={16} />,
      color: "bg-red-100 text-red-700",
    },
    {
      name: "Education 2",
      // icon: <BookOpen size={16} />,
      color: "bg-orange-100 text-orange-700",
    },

  ];

  return (
    <div className=" flex flex-col items-center sm:w-[93%] w-full gap-3 ">
      <div className="flex flex-col sm:flex-col  shadow-xl rounded-2xl  bg-violet-100 px-5 py-4 lg:flex-row justify-between items-center w-full gap-2 sm:gap-1">
        <h1
          className="text-[#2f1254] text-md sm:text-xl py-1 text-center font-bold"
        >
          {title}
        </h1>

        <div className="flex items-center justify-between w-full gap-10 pb-2 sm:gap-4 sm:w-auto sm:py-0">

          {/* ✅ WALLET UI */}
          <div className="flex items-center gap-5 border-purple-500 rounded-lg">
            <div>
              {user && (
                <div className="text-black flex items-center gap-2 bg-black/10 border border-violet-300 rounded-lg px-2 py-1 text-sm">
                  <svg width={30} height={30} viewBox="0 0 640 640"><path fill="rgb(102, 81, 167)" d="M128 96C92.7 96 64 124.7 64 160L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 256C576 220.7 547.3 192 512 192L136 192C122.7 192 112 181.3 112 168C112 154.7 122.7 144 136 144L520 144C533.3 144 544 133.3 544 120C544 106.7 533.3 96 520 96L128 96zM480 320C497.7 320 512 334.3 512 352C512 369.7 497.7 384 480 384C462.3 384 448 369.7 448 352C448 334.3 462.3 320 480 320z" /></svg>
                  <span className="font-semibold"> ₹{loading ? "..." : userbalance}.00</span>
                </div>
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
              className="cursor-pointer text-black text-xs sm:text-sm py-2 px-6 bg-yellow-300 rounded-full"
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
              className="cursor-pointer text-black text-xs sm:text-sm py-2 px-6 bg-yellow-300 rounded-full"
              onClick={handleReset}
            >
              {t?.astrocard?.reset || "Reset"}
            </button>
          </div>

          {/* SEARCH */}
          <div className="h-[2.1rem] w-50 flex gap-2 sm:w-68  items-center  px-3 rounded-full border border-green-600">
            <svg width={25} height={25} viewBox="0 0 640 640"><path fill="rgba(102, 81, 167, 1.00)" d="M463 448.2C440.9 409.8 399.4 384 352 384L288 384C240.6 384 199.1 409.8 177 448.2C212.2 487.4 263.2 512 320 512C376.8 512 427.8 487.3 463 448.2zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320zM320 336C359.8 336 392 303.8 392 264C392 224.2 359.8 192 320 192C280.2 192 248 224.2 248 264C248 303.8 280.2 336 320 336z" /></svg>            <CustomInput
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
            const isActive = active === cat.name;

            return (
              <button
                key={cat.name}
                onClick={() => selectCategory(cat.name)}
                className={`flex items-center gap-2 px-4 py-1 rounded-full text-xs whitespace-nowrap transition
              
              ${isActive
                    ? "bg-yellow-400 shadow-2xl text-black border border-yellow-500 rounded-full py-1 scale-107"
                    : `${cat.color} hover:scale-105`
                  }
              
              `}
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