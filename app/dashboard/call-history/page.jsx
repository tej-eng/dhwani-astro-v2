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
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="text-3xl font-bold text-black">
              Call History
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              User call session reports
            </p>
          </div>

          <button
            onClick={() => refetch()}
            className="px-5 py-2 font-semibold text-white bg-purple-900 rounded-xl"
          >
            Refresh
          </button>
        </div>

        {/* SUMMARY */}
        <div className="grid gap-4 mb-6 md:grid-cols-4">

          <div className="p-5 bg-purple-100 rounded-2xl">
            <p className="text-sm text-gray-600">
              Total Calls
            </p>

            <h3 className="mt-2 text-2xl font-bold text-black">
              {summary?.totalRecords || 0}
            </h3>
          </div>

          <div className="p-5 bg-green-100 rounded-2xl">
            <p className="text-sm text-gray-600">
              Coins Deducted
            </p>

            <h3 className="mt-2 text-2xl font-bold text-black">
              {summary?.totalCoinsDeducted ||
                0}
            </h3>
          </div>

          <div className="p-5 bg-blue-100 rounded-2xl">
            <p className="text-sm text-gray-600">
              Coins Earned
            </p>

            <h3 className="mt-2 text-2xl font-bold text-black">
              {summary?.totalCoinsEarned ||
                0}
            </h3>
          </div>

          <div className="p-5 bg-red-100 rounded-2xl">
            <p className="text-sm text-gray-600">
              Commission
            </p>

            <h3 className="mt-2 text-2xl font-bold text-black">
              {summary?.totalCommission ||
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
            className="px-4 py-3 text-black border outline-none rounded-2xl"
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
            className="px-4 py-3 text-black border outline-none rounded-2xl"
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
            className="px-4 py-3 text-black border outline-none rounded-2xl"
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
            className="px-4 py-3 text-black border outline-none rounded-2xl"
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
            className="px-4 py-3 text-black border outline-none rounded-2xl"
          />
        </div>

        {/* TABLE */}
        <div className="overflow-auto border rounded-3xl">

          <table className="w-full min-w-[1400px]">

            <thead className="text-white bg-purple-900">

              <tr>
                <th className="px-4 py-4 text-left">
                  Astrologer
                </th>

             

                <th className="px-4 py-4 text-left">
                  Status
                </th>

                <th className="px-4 py-4 text-left">
                  Duration
                </th>

                <th className="px-4 py-4 text-left">
                  Rate/Min
                </th>

                <th className="px-4 py-4 text-left">
                  Coins Deducted
                </th>

         

                <th className="px-4 py-4 text-left">
                  Session ID
                </th>

            <th className="px-4 py-4 text-left">
    Created Date
  </th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-black"
                  >
                    Loading call history...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-red-500"
                  >
                    Failed to load data
                  </td>
                </tr>
              ) : filteredData?.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-gray-500"
                  >
                    No call history found
                  </td>
                </tr>
              ) : (
                filteredData?.map((item) => {
                  const statusColor =
                    item?.status ===
                    "COMPLETED"
                      ? "bg-green-100 text-green-600"
                      : item?.status ===
                        "MISSED"
                      ? "bg-yellow-100 text-yellow-700"
                      : item?.status ===
                        "REJECTED"
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-600";

                  return (
                    <tr
                      key={item?.sessionId}
                      className="border-b hover:bg-gray-50"
                    >

                      {/* ASTROLOGER */}
                      <td className="px-4 py-4">

                        <div className="flex items-center gap-3">

                 
                          <div>
                            <p className="font-semibold text-black">
                              {
                                item
                                  ?.astrologer
                                  ?.name
                              }
                            </p>

                      
                          </div>
                        </div>
                      </td>


                      {/* STATUS */}
                      <td className="px-4 py-4">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}
                        >
                          {item?.status}
                        </span>
                      </td>

                      {/* DURATION */}
                      <td className="px-4 py-4 font-medium text-black">

                        {
                          item?.durationMinutes
                        }{" "}
                        min
                      </td>

                      {/* RATE */}
                      <td className="px-4 py-4 text-black">

                        ₹{" "}
                        {item?.ratePerMin}
                      </td>

                      {/* COINS DEDUCTED */}
                      <td className="px-4 py-4 font-semibold text-red-600">

                        {
                          item?.coinsDeducted
                        }
                      </td>

                

                      {/* SESSION */}
                      <td className="px-4 py-4 text-sm text-black">

                        {
                          item?.sessionId
                        }
                      </td>

               {/* CREATED DATE */}
<td className="px-4 py-4 text-sm text-black whitespace-nowrap">

  {formatDate(
    item?.createdAt
  )}
</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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