"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

const GET_USER_WALLET_TRANSACTIONS = gql`
  query GetUserWalletTransactions(
    $filter: WalletTransactionFilter
  ) {
    getUserWalletTransactions(
      filter: $filter
    ) {
      totalCount
      currentPage
      totalPages

      data {
        id
        userWalletId
        astrologerWalletId
        rechargePackId
        sessionId
        type
        coins
        amount
        description
        astrologerName
        createdAt
      }
    }
  }
`;

export default function UserWalletTransactions() {
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    type: "",
    fromDate: "",
    toDate: "",
    search: "",
  });

  const queryFilter = useMemo(() => {
    return {
      page,
      limit: 10,

      ...(filters?.type && {
        type: [filters.type],
      }),

      ...(filters?.fromDate && {
        fromDate: filters.fromDate,
      }),

      ...(filters?.toDate && {
        toDate: filters.toDate,
      }),
    };
  }, [filters, page]);

  const { data, loading, error, refetch } =
    useQuery(
      GET_USER_WALLET_TRANSACTIONS,
      {
        variables: {
          filter: queryFilter,
        },
        fetchPolicy: "network-only",
      }
    );

  const response =
    data?.getUserWalletTransactions;

  const transactions =
    response?.data || [];

  const filteredTransactions =
    transactions?.filter((item) => {
      if (!filters?.search) return true;

      const search =
        filters.search.toLowerCase();

      return (
        item?.description
          ?.toLowerCase()
          ?.includes(search) ||
        item?.astrologerName
          ?.toLowerCase()
          ?.includes(search) ||
        item?.type
          ?.toLowerCase()
          ?.includes(search) ||
        item?.sessionId
          ?.toLowerCase()
          ?.includes(search)
      );
    });

  // FIX INVALID DATE
  const formatDate = (timestamp) => {
    if (!timestamp) return "-";

    const date = new Date(
      Number(timestamp)
    );

    if (isNaN(date.getTime()))
      return "Invalid Date";

    return `${date.toLocaleDateString(
      "en-IN"
    )} • ${date.toLocaleTimeString(
      "en-IN"
    )}`;
  };

  return (
    <div className="min-h-screen p-5 bg-gray-100">

      <div className="p-5 bg-white shadow-xl rounded-3xl">

        {/* HEADER */}
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="text-3xl font-bold text-black">
              Wallet Transactions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage user wallet history
            </p>
          </div>

          <button
            onClick={() => refetch()}
            className="px-5 py-2 font-semibold text-white bg-purple-900 rounded-xl"
          >
            Refresh
          </button>
        </div>

        {/* FILTERS */}
        <div className="grid gap-4 mb-6 md:grid-cols-4">

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search astrologer, type..."
            value={filters.search}
            onChange={(e) =>
              setFilters({
                ...filters,
                search: e.target.value,
              })
            }
            className="px-4 py-3 text-black border outline-none rounded-2xl"
          />

          {/* TYPE DROPDOWN */}
          <select
            value={filters.type}
            onChange={(e) => {
              setPage(1);

              setFilters({
                ...filters,
                type: e.target.value,
              });
            }}
            className="px-4 py-3 text-black border outline-none rounded-2xl"
          >
            <option value="">
              All Types
            </option>

            <option value="DEBIT">
              Debit
            </option>

            <option value="CREDIT">
              Credit
            </option>
          </select>

          {/* FROM DATE */}
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => {
              setPage(1);

              setFilters({
                ...filters,
                fromDate: e.target.value,
              });
            }}
            className="px-4 py-3 text-black border outline-none rounded-2xl"
          />

          {/* TO DATE */}
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => {
              setPage(1);

              setFilters({
                ...filters,
                toDate: e.target.value,
              });
            }}
            className="px-4 py-3 text-black border outline-none rounded-2xl"
          />
        </div>

        {/* TABLE */}
        <div className="overflow-auto border rounded-3xl">

          <table className="w-full min-w-[1000px]">

            <thead className="text-white bg-purple-900">

              <tr>

                {/* ASTROLOGER FIRST */}
                <th className="px-4 py-4 text-left">
                  Astrologer
                </th>

                <th className="px-4 py-4 text-left">
                  Amount
                </th>

                <th className="px-4 py-4 text-left">
                  Coins
                </th>

                <th className="px-4 py-4 text-left">
                  Type
                </th>

                <th className="px-4 py-4 text-left">
                  Session ID
                </th>

                <th className="px-4 py-4 text-left">
                  Description
                </th>

                <th className="px-4 py-4 text-left">
                  Date
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
                    Loading transactions...
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
              ) : filteredTransactions
                  ?.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-gray-500"
                  >
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions?.map(
                  (item) => {
                    const isDebit =
                      item?.type === "DEBIT";

                    return (
                      <tr
                        key={item?.id}
                        className="border-b hover:bg-gray-50"
                      >

                        {/* ASTROLOGER */}
                        <td className="px-4 py-4">

                          <div>
                            <p className="font-semibold text-black">
                              {item?.astrologerName ||
                                "N/A"}
                            </p>

                            <p className="text-xs text-gray-500">
                              {item?.sessionId?.slice(
                                0,
                                18
                              ) || "-"}
                              ...
                            </p>
                          </div>
                        </td>

                        {/* AMOUNT */}
                        <td className="px-4 py-4 font-semibold text-black">

                          {item?.amount
                            ? `₹ ${item?.amount}`
                            : "-"}
                        </td>

                        {/* COINS */}
                        <td className="px-4 py-4 font-bold text-black">

                          {item?.coins}
                        </td>

                        {/* TYPE */}
                        <td className="px-4 py-4">

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              isDebit
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-600"
                            }`}
                          >
                            {item?.type}
                          </span>
                        </td>

                        {/* SESSION */}
                        <td className="px-4 py-4 text-sm text-black">

                          {item?.sessionId ||
                            "-"}
                        </td>

                        {/* DESCRIPTION */}
                        <td className="max-w-xs px-4 py-4 text-black">

                          <p className="line-clamp-2">
                            {item?.description}
                          </p>
                        </td>

                        {/* DATE */}
                        <td className="px-4 py-4 text-sm text-black whitespace-nowrap">

                          {formatDate(
                            item?.createdAt
                          )}
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between mt-6">

          <div className="text-sm text-gray-600">

            Total Transactions:{" "}
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