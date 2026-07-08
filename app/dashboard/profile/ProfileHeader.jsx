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
    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-600 p-[1px] shadow-2xl">

      <div className="rounded-[32px] bg-white">

        <div className="relative overflow-hidden">

          {/* Background Blur */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#d8b4fe55,transparent_35%),radial-gradient(circle_at_bottom_left,#c4b5fd55,transparent_35%)]" />

          <div className="relative flex flex-col gap-8 p-8 lg:flex-row lg:items-center lg:justify-between">

            {/* LEFT */}

            <div className="flex items-center gap-6">

              {/* Avatar */}

              <div className="relative">

                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-violet-100 shadow-xl">

                  <Image
                    src="/ds-img/user2.webp"
                    alt="Profile"
                    width={110}
                    height={110}
                    className="object-cover"
                  />
                </div>

                <button className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg hover:bg-violet-700 transition">

                  <FaCamera size={14} />

                </button>
              </div>

              {/* User */}

              <div>

                <div className="flex items-center gap-2">

                  <h1 className="text-3xl font-bold text-slate-900">
                    {user?.name || "User"}
                  </h1>

                  <MdVerified
                    className="text-sky-500"
                    size={24}
                  />

                </div>

                <div className="mt-3 flex items-center gap-2 text-slate-600">

                  <FaPhoneAlt size={13} />

                  <span>
                    {user?.countryCode} {user?.mobile}
                  </span>

                </div>

                <p className="mt-2 text-sm text-slate-500">

                  Member since {joinedDate}

                </p>

              </div>

            </div>

            {/* RIGHT */}

            <div className="flex flex-wrap items-center gap-4">

              <div className="rounded-2xl bg-violet-200 px-6 py-4">

                <p className="text-xs uppercase tracking-widest text-slate-500">

                  Wallet Balance

                </p>

                <h2 className="mt-1 text-3xl font-bold text-violet-700">

                  {user?.stats?.walletBalance || 0}

                </h2>

                <p className="text-xs text-slate-500">

                  Coins Available

                </p>

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