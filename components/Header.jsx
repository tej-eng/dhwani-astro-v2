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
import CustomButton from "./Custom/CustomButton";
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
    const result = await logoutMutation();

    if (result?.data?.logout) {
      localStorage.removeItem("user");
      setUser(null);

      await client.clearStore();
      await persistor.purge();

      toast.success("Logged out successfully");
      router.refresh();
      router.push("/");
    } else {
      toast.error("Logout failed");
    }
  } catch (err) {
    console.error("Logout error:", err);
    toast.error("Logout failed");
  }
};

  // ==============================
  // CLICK OUTSIDE DROPDOWN
  // ==============================

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector(".user-container");
      if (dropdown && !dropdown.contains(event.target)) setIsUserOpen(false);
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
        
       <Link href="/blogs"   className="flex items-center gap-2 px-3 py-1 bg-[#f5f5a8] cursor-pointer text-sm text-black rounded-full transition-all hover:bg-[#f5e78a]">Blog</Link>

        {!isLoggedIn && (
          <button
            onClick={openSignInModal}
            className="px-3 py-1 cursor-pointer text-sm font-medium rounded-full bg-[#b92c3a] text-[#FFD70a]"
          >
            {t?.header?.signIn || "Sign In"}
          </button>
        )}

        {isLoggedIn && (
          <button
            onClick={LogOut}
            disabled={logoutLoading}
            className="px-3 py-1 cursor-pointer text-sm font-medium rounded-full bg-[#b92c3a] text-[#FFD70a]"
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
              <div className="absolute right-0 z-50 w-72 mt-3 overflow-hidden text-black bg-white shadow-2xl rounded-2xl">
                {/* TOP USER INFO */}
                <div className="flex items-center gap-3 p-4 bg-purple-900">
                  <Image
                    src="/ds-img/user2.webp"
                    width={45}
                    height={45}
                    alt="User"
                    className="rounded-full"
                  />

                  <div>
                    <h3 className="font-semibold text-white">
                      {user?.name || "User"}
                    </h3>

                    <p className="text-sm text-gray-300">
                      {user?.mobile || "User Account"}
                    </p>
                  </div>
                </div>

                {/* MENU */}
                <div className="p-2">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100"
                  >
                    👤 Profile
                  </Link>

                  <Link
                    href="/dashboard/account"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100"
                  >
                    🪪 Account
                  </Link>

                  <hr className="my-2" />

                  <Link
                    href="/dashboard/chat-history"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100"
                  >
                    💬 Chat History
                  </Link>

                  <Link
                    href="/dashboard/call-history"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100"
                  >
                    📞 Call History
                  </Link>

                  <Link
                    href="/dashboard/transaction"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100"
                  >
                    🛒 Transaction
                  </Link>
                  <Link
                    href="/dashboard/my-services"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100"
                  >
                    🛒 My Services
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
