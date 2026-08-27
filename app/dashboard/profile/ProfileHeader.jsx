"use client";

import Image from "next/image";
import { FaCamera, FaEdit, FaPhoneAlt } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

export default function ProfileHeader({ user }) {
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-violet-700 via-purple-700 to-fuchsia-600 p-px shadow-2xl">
      <div className="rounded-3xl bg-white/60">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#d8b4fe55,transparent_35%),radial-gradient(circle_at_bottom_left,#c4b5fd55,transparent_35%)]" />

          <div className="relative flex flex-col gap-4 sm:gap-8 p-4 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="flex h-18 w-18 sm:h-28 sm:w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-violet-100 shadow-xl">
                  <Image
                    src="/ds-img/user2.webp"
                    alt="Profile"
                    width={110}
                    height={110}
                    className="object-cover "
                  />
                </div>

                <button className="absolute bottom-1 right-1 flex h-5 w-5 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg hover:bg-violet-700 transition">
                  <FaCamera size={14} />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className=" text-xl sm:text-3xl font-bold text-slate-900">
                    {user?.name || "User"}
                  </h1>

                  <MdVerified className="text-sky-500" size={24} />
                </div>

                <div className="mt-3 flex items-center gap-2 text-slate-600">
                  <FaPhoneAlt size={13} />

                  <span className="text-sm">
                    {user?.countryCode} {user?.mobile}
                  </span>
                </div>

<p className="mt-2 text-xs text-slate-800">
  Member since:{" "}
  {user?.createdAt
    ? new Date(Number(user.createdAt)).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-"}
</p>
              </div>
            </div>

            <div className="flex w-full flex-wrap items-center gap-4">
              <div className="rounded-full w-full sm:rounded-2xl flex items-center justify-between  gap-5  bg-violet-200 px-6 py-2 sm:py-4">
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Wallet Balance
                </p>

                <h2 className="mt-1 text-xl sm:text-3xl font-bold text-violet-700">
                  {user?.stats?.walletBalance || 0}
                </h2>

                {/* <p className="text-xs text-slate-500">Coins Available</p> */}
              </div>

              {/* <button className="flex items-center gap-2 rounded-2xl bg-violet-700 px-6 py-4 font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-violet-800">

                <FaEdit />

                Edit Profile

              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
