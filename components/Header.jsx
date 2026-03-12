"use client";

import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { persistor } from "../app/redux/store";
import { resetPaymentStatus } from "../app/redux/reducer/auth/userSlice";
import toast from "react-hot-toast";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import client from "@/utils/apolloClient";
import LanguageSwitcher from "../components/Custom/LangSwitcher";
import { useLanguage } from "../app/context/LangContext";
import { AuthContext } from "@/app/context/authContext";
const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export default function Header({ openSignInModal }) {
  const { user, setUser, isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const { messages: t } = useLanguage();
  const [isUserOpen, setIsUserOpen] = useState(false);
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

console.log("isssssssssssssssssss",isLoggedIn);

// useEffect(() => {
//   const storedUser = localStorage.getItem("user");

//   if (storedUser) {
//     setUser(JSON.parse(storedUser));
//   }

// }, [isLoggedIn]);

  // ==============================
  // LOGOUT MUTATION
  // ==============================

  const [logoutMutation, { loading: logoutLoading }] =
    useMutation(LOGOUT_MUTATION);
  const LogOut = async () => {
    try {
      const result = await logoutMutation().catch(() => {});
      console.log("Logout result:", result.data.logout);
      if(result.data.logout){
         localStorage.removeItem("user");
         setUser(null);
          setIsLoggedIn(false);
         await client.clearStore();
         await persistor.purge();
        //  setIsLoggedIn(false);
         toast.success("Logged out successfully");
        router.refresh();
         router.push("/");
      }else{        
        toast.error("Logout failed");
      }
      
    } catch (err) {
      console.error("Logout error:", err);
     
    }
  };

  // ==============================
  // CLICK OUTSIDE DROPDOWN
  // ==============================

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector(".user-container");
      if (dropdown && !dropdown.contains(event.target))
        setIsUserOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ==============================
  // UI
  // ==============================

  return (
    <header className="z-50 flex items-center justify-between w-full p-1 px-2 shadow-lg head-top bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 md:px-18">

      <div className="w-1/3 ml-8 dslogo sm:w-1/2 sm:ml-0">
        <Link href="/">
          <Image
            src="/ds-img/logo.webp"
            width={160}
            height={40}
            alt="Logo"
            className="w-28 sm:w-37"
            priority
          />
        </Link>
      </div>

      <div className="items-center justify-end hidden w-1/3 gap-4 sm:flex sm:gap-2 sm:w-1/2">
        <LanguageSwitcher />

        {!isLoggedIn && (
          <button
            onClick={openSignInModal}
            className="px-3 py-1 cursor-pointer text-sm font-medium rounded-md bg-[#b92c3a] text-[#FFD70a]"
          >
            {t?.header?.signIn || "Sign In"}
          </button>
        )}

        {isLoggedIn && (
          <button
            onClick={LogOut}
            disabled={logoutLoading}
            className="px-3 py-1 cursor-pointer text-sm font-medium rounded-md bg-[#b92c3a] text-[#FFD70a]"
          >
            {logoutLoading
              ? "Signing Out..."
              : t?.header?.signOut || "Sign Out"}
          </button>
        )}

        {isLoggedIn && (
          <div className="relative inline-block user-container">
            <div
              className="cursor-pointer"
              onClick={() => setIsUserOpen((prev) => !prev)}
            >
              <Image
                src="/ds-img/user2.webp"
                width={35}
                height={35}
                alt="User"
                loading="lazy"
              />
            </div>

            {isUserOpen && (
              <div className="absolute -left-36 z-30 w-50 p-3 mt-2 space-y-3 bg-purple-900 rounded-lg shadow-lg">
                <p className="text-white text-sm"> 
                  {user?.name || "User"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}