"use client";

import { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Image from "next/image";
import ChatMessagePopUp from "../ChatMessagePopUp";
import RemedyModal from "../RemedyModal";

const GET_USER_CHAT_HISTORY = gql`
  query GetUserChatHistory($filter: UserChatHistoryFilterInput) {
    getUserChatHistory(filter: $filter) {
      success

      summary {
        totalCoinsDeducted
        totalCoinsEarned
        totalCommission
        totalRecords
      }

      totalCount
      currentPage
      totalPages

      data {
        srNo
        roomId
        sessionId
        status
        source
        durationMinutes
        ratePerMin
        coinsDeducted
        coinsEarned
        commission
        createdAt

        astrologer {
          name
        }

        lastMessage {
          message
          image
        }
      }
    }
  }
`;

export default function ChatHistoryPage() {
  const [page, setPage] = useState(1);
  const [openChatModal, setOpenChatModal] = useState(false);
  const [openRemedyModal, setOpenRemedyModal] = useState(false);
  const [selectedRemedySession, setSelectedRemedySession] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "",
    astrologerName: "",
    startDate: "",
    endDate: "",
  });
  const cleanedFilter = Object.fromEntries(
    Object.entries(filters).filter(
      ([_, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );

  const { data, loading, error, refetch } = useQuery(GET_USER_CHAT_HISTORY, {
    variables: {
      filter: cleanedFilter,
    },
    fetchPolicy: "network-only",
  });

  const history = data?.getUserChatHistory;
  const handleSearch = () => {
    const cleanedFilter = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, value]) => value !== "" && value !== null && value !== undefined,
      ),
    );

    refetch({
      filter: {
        ...cleanedFilter,
        page: 1,
      },
    });
  };

  return (
    <div className="min-h-screen text-black p-4 bg-gray-100 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 mb-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-purple-900">Chat History</h1>

          <p className="text-gray-500">View all your user chat sessions</p>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
        <div className="p-4 bg-white shadow rounded-2xl">
          <p className="text-sm text-gray-500">Total Chats</p>

          <h2 className="mt-2 text-2xl font-bold">
            {history?.summary?.totalRecords || 0}
          </h2>
        </div>

        <div className="p-4 bg-white shadow rounded-2xl">
          <p className="text-sm text-gray-500">Amount Deducted</p>

          <h2 className="mt-2 text-2xl font-bold">
            {history?.summary?.totalCoinsDeducted || 0}
          </h2>
        </div>
        {/* 
        <div className="p-4 bg-white shadow rounded-2xl">
          <p className="text-sm text-gray-500">Coins Earned</p>

          <h2 className="mt-2 text-2xl font-bold">
            {history?.summary?.totalCoinsEarned || 0}
          </h2>
        </div> */}

        {/* <div className="p-4 bg-white shadow rounded-2xl">
          <p className="text-sm text-gray-500">Commission</p>

          <h2 className="mt-2 text-2xl font-bold">
            {history?.summary?.totalCommission || 0}
          </h2>
        </div> */}
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 gap-4 p-4 mb-6 bg-white shadow md:grid-cols-5 rounded-2xl">
        <input
          type="text"
          placeholder="Astrologer Name"
          className="px-4 py-2 border rounded-xl"
          value={filters.astrologerName}
          onChange={(e) =>
            setFilters({
              ...filters,
              astrologerName: e.target.value,
            })
          }
        />

        <select
          className="px-4 py-2 border rounded-xl"
          value={filters.status}
          onChange={(e) =>
            setFilters({
              ...filters,
              status: e.target.value,
            })
          }
        >
          <option value="">All Status</option>
          <option value="COMPLETED">Completed</option>
          <option value="ONGOING">Ongoing</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <input
          type="date"
          className="px-4 py-2 border rounded-xl"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({
              ...filters,
              startDate: e.target.value,
            })
          }
        />

        <input
          type="date"
          className="px-4 py-2 border rounded-xl"
          value={filters.endDate}
          onChange={(e) =>
            setFilters({
              ...filters,
              endDate: e.target.value,
            })
          }
        />

        <button
          onClick={handleSearch}
          className="px-4 py-2 text-white bg-purple-900 rounded-xl"
        >
          Search
        </button>
      </div>

      {/* LOADING */}
      {loading && <div className="p-10 text-center">Loading chats...</div>}

      {/* ERROR */}
      {error && (
        <div className="p-4 text-red-500 bg-white rounded-xl">
          Something went wrong
        </div>
      )}

      {/* CHAT LIST */}
      <div className="space-y-4 text-black">
        {history?.data?.map((chat, index) => (
          <div key={index} className="p-5 bg-white shadow rounded-2xl">
            <div className="flex flex-col justify-between gap-4 md:flex-row">
              {/* LEFT */}
              <div className="flex gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {chat?.astrologer?.name}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Session ID: {chat?.sessionId}
                  </p>

                  <div className="flex flex-wrap gap-3 mt-3">
                    <span className="px-3 py-1 text-sm bg-gray-100 rounded-full">
                      ⏱ {chat?.durationMinutes} mins
                    </span>

                    <span className="px-3 py-1 text-sm bg-gray-100 rounded-full">
                      🪙 {chat?.coinsDeducted} amount
                    </span>

                    <span className="px-3 py-1 text-sm bg-gray-100 rounded-full">
                      ₹ {chat?.ratePerMin}/min
                    </span>
                    <span className="px-3 py-1 text-sm bg-gray-100 rounded-full">
                      {chat?.source}
                    </span>

                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        chat?.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {chat?.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col justify-between">
                <div className="text-sm text-right text-gray-500">
                  <p>{new Date(chat?.createdAt).toLocaleDateString()}</p>

                  <p>{new Date(chat?.createdAt).toLocaleTimeString()}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedRemedySession(chat.sessionId);
                    setOpenRemedyModal(true);
                  }}
                  className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700"
                >
                  View Remedy
                </button>
                <span
                  className="flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                  onClick={() => {
                    setSelectedSessionId(chat?.sessionId);
                    setOpenChatModal(true);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height={20}
                    width={20}
                    viewBox="0 0 640 640"
                    className="fill-purple-900"
                  >
                    <path d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          disabled={page === 1}
          onClick={() => {
            const prev = page - 1;

            setPage(prev);

            setFilters({
              ...filters,
              page: prev,
            });
          }}
          className="px-4 py-2 bg-white shadow rounded-xl disabled:opacity-50"
        >
          Prev
        </button>

        <span>
          Page {history?.currentPage || 1} of {history?.totalPages || 1}
        </span>

        <button
          disabled={page === history?.totalPages}
          onClick={() => {
            const next = page + 1;

            setPage(next);

            setFilters({
              ...filters,
              page: next,
            });
          }}
          className="px-4 py-2 bg-white shadow rounded-xl disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <ChatMessagePopUp
        open={openChatModal}
        onClose={() => setOpenChatModal(false)}
        sessionId={selectedSessionId}
      />
      <RemedyModal
        open={openRemedyModal}
        onClose={() => setOpenRemedyModal(false)}
        sessionId={selectedRemedySession}
      />
    </div>
  );
}
