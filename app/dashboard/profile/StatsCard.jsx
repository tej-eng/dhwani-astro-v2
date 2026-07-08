"use client";

import {
  FaWallet,
  FaRupeeSign,
  FaComments,
  FaPhoneAlt,
  FaStar,
  FaHeart,
  FaCalendarCheck,
} from "react-icons/fa";

const statsConfig = [

  {
    title: "Recharge",
    key: "totalRecharge",
    prefix: "₹",
    icon: FaRupeeSign,
    bg: "from-blue-500 to-cyan-500",
  },
  {
    title: "Chats",
    key: "totalChats",
    icon: FaComments,
    bg: "from-green-500 to-emerald-500",
  },
  {
    title: "Calls",
    key: "totalCalls",
    icon: FaPhoneAlt,
    bg: "from-orange-500 to-red-500",
  },
  {
    title: "Reviews",
    key: "totalReviews",
    icon: FaStar,
    bg: "from-yellow-400 to-amber-500",
  },
  {
    title: "Following",
    key: "totalFollowing",
    icon: FaHeart,
    bg: "from-pink-500 to-rose-500",
  },
  {
  title: "Bookings",
  key: "totalBookings",
  icon: FaCalendarCheck,
  bg: "from-indigo-500 to-violet-500",
},
];

export default function StatsCards({ stats }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {statsConfig.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            {/* Background Glow */}
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-100 opacity-30 transition-all duration-300 group-hover:scale-125" />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {item.title}
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                  {item.prefix}
                  {stats?.[item.key] ?? 0}
                </h2>

                {item.suffix && (
                  <p className="mt-1 text-xs text-slate-400">
                    {item.suffix}
                  </p>
                )}
              </div>

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.bg} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon size={22} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}