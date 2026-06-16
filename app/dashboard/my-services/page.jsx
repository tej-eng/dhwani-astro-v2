"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_MY_SERVICE_BOOKINGS = gql`
  query GetMyServiceBookings($page: Int, $limit: Int) {
    getMyServiceBookings(page: $page, limit: $limit) {
      data {
        id
        bookingStatus
        paymentStatus
        amount
        createdAt

        service {
          id
          name
        }

        astrologer {
          id
          name
        }
      }

      totalCount
      currentPage
      totalPages
    }
  }
`;

export default function ServiceBookingHistory() {
  const { data, loading, error } = useQuery(
    GET_MY_SERVICE_BOOKINGS,
    {
      fetchPolicy: "network-only",
    }
  );

  const bookings = data?.getMyServiceBookings?.data || [];

  return (
    <div className="min-h-screen p-4 bg-gray-100 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-purple-900">
          Healing Service Bookings
        </h1>

        <p className="text-gray-500">
          View all your healing service bookings
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
        <div className="p-4 bg-white shadow rounded-2xl">
          <p className="text-sm text-gray-500">Total Bookings</p>

          <h2 className="mt-2 text-2xl font-bold">
            {bookings.length}
          </h2>
        </div>

        <div className="p-4 bg-white shadow rounded-2xl">
          <p className="text-sm text-gray-500">Assigned</p>

          <h2 className="mt-2 text-2xl font-bold">
            {
              bookings.filter(
                (b) => b.bookingStatus === "ASSIGNED"
              ).length
            }
          </h2>
        </div>

        <div className="p-4 bg-white shadow rounded-2xl">
          <p className="text-sm text-gray-500">Completed</p>

          <h2 className="mt-2 text-2xl font-bold">
            {
              bookings.filter(
                (b) => b.bookingStatus === "COMPLETED"
              ).length
            }
          </h2>
        </div>

        <div className="p-4 bg-white shadow rounded-2xl">
          <p className="text-sm text-gray-500">Total Amount</p>

          <h2 className="mt-2 text-2xl font-bold">
            ₹
            {bookings.reduce(
              (sum, booking) => sum + booking.amount,
              0
            )}
          </h2>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="p-10 text-center">
          Loading bookings...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 text-red-500 bg-white rounded-xl">
          Something went wrong
        </div>
      )}

      {/* Empty State */}
      {!loading && bookings.length === 0 && (
        <div className="p-10 text-center bg-white shadow rounded-2xl">
          No bookings found
        </div>
      )}

      {/* Booking Cards */}
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="p-5 bg-white shadow rounded-2xl"
          >
            <div className="flex flex-col justify-between gap-4 md:flex-row">
              <div>
                <h2 className="text-xl font-semibold text-black">
                  {booking?.service?.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Booking ID: {booking.id}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Astrologer:{" "}
                  {booking?.astrologer?.name || "Not Assigned"}
                </p>

                <div className="flex flex-wrap gap-3 mt-4">
                  <span className="px-3 py-1 text-sm bg-gray-100 rounded-full">
                    ₹ {booking.amount}
                  </span>

                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      booking.paymentStatus === "SUCCESS"
                        ? "bg-green-100 text-green-700"
                        : booking.paymentStatus === "FAILED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    Payment: {booking.paymentStatus}
                  </span>

                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      booking.bookingStatus === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : booking.bookingStatus === "ASSIGNED"
                        ? "bg-blue-100 text-blue-700"
                        : booking.bookingStatus === "CANCELLED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {booking.bookingStatus}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {new Date(
                    booking.createdAt
                  ).toLocaleDateString()}
                </p>

                <p className="text-sm text-gray-500">
                  {new Date(
                    booking.createdAt
                  ).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}