"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Image from "next/image";
import { useMemo, useState } from "react";

const GET_USER_CALL_HISTORY = gql`
  query GetUserCallHistory(
    $filter: UserCallHistoryFilterInput
  ) {
    getUserCallHistory(filter: $filter) {
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
        sessionId
        startedAt
        endedAt
        createdAt
        status
        durationSec
        durationMinutes
        ratePerMin
        coinsDeducted
        coinsEarned
        commission

        user {
          id
          name
          mobile
          countryCode
        }

        astrologer {
          id
          name
          profilePic
          experience
          rating
          skills
          languages
        }
      }
    }
  }
`;

export default function UserCallHistory() {
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    status: "",
    astrologerName: "",
    startDate: "",
    endDate: "",
    search: "",
  });

  const queryFilter = useMemo(() => {
    return {
      page,
      limit: 10,

      ...(filters?.status && {
        status: filters.status,
      }),

      ...(filters?.astrologerName && {
        astrologerName:
          filters.astrologerName,
      }),

      ...(filters?.startDate && {
        startDate: filters.startDate,
      }),

      ...(filters?.endDate && {
        endDate: filters.endDate,
      }),
    };
  }, [filters, page]);

  const { data, loading, error, refetch } =
    useQuery(GET_USER_CALL_HISTORY, {
      variables: {
        filter: queryFilter,
      },
      fetchPolicy: "network-only",
    });

  const response =
    data?.getUserCallHistory;

  const callHistory =
    response?.data || [];

  const summary =
    response?.summary || {};

  const filteredData =
    callHistory?.filter((item) => {
      if (!filters?.search) return true;

      const search =
        filters.search.toLowerCase();

      return (
        item?.astrologer?.name
          ?.toLowerCase()
          ?.includes(search) ||
        item?.user?.name
          ?.toLowerCase()
          ?.includes(search) ||
        item?.status
          ?.toLowerCase()
          ?.includes(search) ||
        item?.sessionId
          ?.toLowerCase()
          ?.includes(search)
      );
    });

const formatDate = (dateValue) => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  if (isNaN(date.getTime()))
    return "-";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

  return (
    <div className="min-h-screen p-5 bg-gray-100">

      <div className="p-5 bg-white shadow-xl rounded-3xl">

        {/* HEADER */}
        <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">

        
            <h2 className="text-2xl font-bold text-black">
              Call History
            </h2>
        </div>

        {/* SUMMARY */}
        <div className="grid gap-4 mb-4 md:grid-cols-4">

          <div className="p-4 bg-violet-200 shadow flex items-center justify-between  rounded-2xl">
            <p className="text-sm text-gray-600">
              Total Calls
            </p>

            <h3 className="mt-2 text-2xl font-bold text-black">
              {summary?.totalRecords || 0}
            </h3>
          </div>

          <div className="p-4 bg-purple-200 shadow flex items-center justify-between  rounded-2xl">
            <p className="text-sm text-gray-600">
              Coins Deducted
            </p>

            <h3 className="mt-2 text-2xl font-bold text-black">
              {summary?.totalCoinsDeducted ||
                0}
            </h3>
          </div>

     
        </div>

        {/* FILTERS */}
        <div className="grid gap-4 mb-6 md:grid-cols-5">

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) =>
              setFilters({
                ...filters,
                search: e.target.value,
              })
            }
            className="px-4 py-2 border border-gray-300 placeholder:text-gray-300 placeholder:text-xs rounded-full"
          />

          {/* STATUS */}
          <select
            value={filters.status}
            onChange={(e) => {
              setPage(1);

              setFilters({
                ...filters,
                status: e.target.value,
              });
            }}
            className="px-4 py-2 border border-gray-300 placeholder:text-gray-300 placeholder:text-xs rounded-full"
          >
            <option value="">
              All Status
            </option>

            <option value="COMPLETED">
              COMPLETED
            </option>

            <option value="MISSED">
              MISSED
            </option>

            <option value="REJECTED">
              REJECTED
            </option>

            <option value="ONGOING">
              ONGOING
            </option>
          </select>

          {/* ASTROLOGER */}
          <input
            type="text"
            placeholder="Astrologer name"
            value={filters.astrologerName}
            onChange={(e) => {
              setPage(1);

              setFilters({
                ...filters,
                astrologerName:
                  e.target.value,
              });
            }}
            className="px-4 py-2 border border-gray-300 placeholder:text-gray-300 placeholder:text-xs rounded-full"
          />

          {/* START DATE */}
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => {
              setPage(1);

              setFilters({
                ...filters,
                startDate: e.target.value,
              });
            }}
            className="px-4 py-2 border border-gray-300 placeholder:text-gray-300 placeholder:text-xs rounded-full"
          />

          {/* END DATE */}
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => {
              setPage(1);

              setFilters({
                ...filters,
                endDate: e.target.value,
              });
            }}
            className="px-4 py-2 border border-gray-300 placeholder:text-gray-300 placeholder:text-xs rounded-full"
          />
        </div>

      {/* CALL LIST */}
<div className="space-y-4 text-black">
  {loading ? (
    <div className="p-10 text-center">Loading call history...</div>
  ) : error ? (
    <div className="p-4 text-red-500 bg-white rounded-xl">
      Failed to load data
    </div>
  ) : filteredData?.length === 0 ? (
    <div className="p-10 text-center bg-white rounded-xl text-gray-500">
      No call history found
    </div>
  ) : (
    filteredData.map((call, index) => (
      <div
        key={call.sessionId || index}
        className="p-4 bg-purple-50 shadow rounded-2xl"
      >
        <div className="flex flex-col justify-between gap-4 md:flex-row">
          {/* LEFT */}
          <div>
            <h2 className="text-xl font-semibold">
              {call?.astrologer?.name}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Session ID: {call?.sessionId?.slice(0, 8)}
            </p>

            <div className="flex flex-wrap gap-3 mt-3">
              <span className="px-3 py-1 text-xs bg-purple-200 rounded-full">
                📞 {call?.durationMinutes} mins
              </span>

              <span className="px-3 py-1 text-xs bg-violet-200 rounded-full">
                🪙 {call?.coinsDeducted}
              </span>

              <span className="px-3 py-1 text-xs bg-purple-300 rounded-full">
                ₹ {call?.ratePerMin}/min
              </span>

              <span
                className={`px-3 py-1 text-xs rounded-full ${
                  call?.status === "COMPLETED"
                    ? "bg-green-100 text-green-700"
                    : call?.status === "MISSED"
                    ? "bg-yellow-100 text-yellow-700"
                    : call?.status === "REJECTED"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {call?.status}
              </span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col justify-between">
            <div className="text-sm text-right text-gray-500">
              <p>{new Date(call?.createdAt).toLocaleDateString()}</p>
              <p>{new Date(call?.createdAt).toLocaleTimeString()}</p>
            </div>

            <div className="flex justify-end mt-4">
              <span
                className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-full"
              >
                Call Session
              </span>
            </div>
          </div>
        </div>
      </div>
    ))
  )}
</div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between mt-6">

          <div className="text-sm text-gray-600">

            Total Records:{" "}
            <span className="font-bold text-black">
              {response?.totalCount || 0}
            </span>
          </div>

          <div className="flex items-center gap-3">

            <button
              disabled={page === 1}
              onClick={() =>
                setPage((prev) => prev - 1)
              }
              className="px-4 py-2 text-black border rounded-xl disabled:opacity-50"
            >
              Prev
            </button>

            <span className="font-semibold text-black">
              Page {page} /{" "}
              {response?.totalPages || 1}
            </span>

            <button
              disabled={
                page ===
                response?.totalPages
              }
              onClick={() =>
                setPage((prev) => prev + 1)
              }
              className="px-4 py-2 text-black border rounded-xl disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}