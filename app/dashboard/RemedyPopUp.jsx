"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Image from "next/image";

const GET_SESSION_REMEDIES = gql`
  query GetSessionRemedies($sessionId: String!) {
    getSessionRemedies(sessionId: $sessionId) {
      id
      sessionId
      remedyText
      createdAt
    }
  }
`;

export default function RemedyPopUp({ open, onClose, sessionId }) {
  const { data, loading, error } = useQuery(GET_SESSION_REMEDIES, {
    variables: {
      sessionId,
    },
    skip: !sessionId || !open,
    fetchPolicy: "network-only",
  });
  console.log("testing");
  const remedies = data?.getSessionRemedies || [];

  if (!open) return null;

  const formatDate = (value) => {
    const date = new Date(Number(value));

    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    return date.toLocaleDateString() + " • " + date.toLocaleTimeString();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60">
      <div className="relative flex flex-col w-full max-w-3xl overflow-hidden bg-white shadow-2xl h-[85vh] rounded-3xl">
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 text-white bg-green-700">
          <div>
            <h2 className="text-2xl font-bold">Session Remedies</h2>
            <p className="text-sm text-green-100">Session ID: {sessionId}</p>
          </div>

          <button
            onClick={onClose}
            className="text-2xl font-bold hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 p-5 overflow-y-auto bg-gray-100">
          {loading && (
            <div className="flex items-center justify-center h-full">
              Loading remedies...
            </div>
          )}

          {error && (
            <div className="text-center text-red-500">
              Failed to load remedies
            </div>
          )}

          <div className="space-y-5">
            {remedies.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-white border rounded-2xl shadow"
              >
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="whitespace-pre-wrap text-gray-700">
                    {item.remedyText}
                  </p>
                </div>

                <p className="mt-4 text-xs text-gray-500"></p>

                {item.createdAt && (
                  <p className="mt-4 text-xs text-gray-500">
                    {formatDate(item.createdAt)}
                  </p>
                )}
              </div>
            ))}
          </div>

          {!loading && remedies.length === 0 && (
            <div className="mt-20 text-center text-gray-500">
              No remedies found for this session.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
