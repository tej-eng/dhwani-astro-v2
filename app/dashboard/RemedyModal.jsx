"use client";

import { useQuery } from "@apollo/client/react";
import { GET_SESSION_REMEDY } from "../graphql/gqlQuery";



export default function RemedyModal({
  open,
  onClose,
  sessionId,
}) {
  const { data, loading } = useQuery(GET_SESSION_REMEDY, {
    variables: {
      sessionId,
    },
    skip: !open || !sessionId,
  });

  if (!open) return null;

  const remedy = data?.getSessionRemedy;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl w-[600px] p-6">

        <h2 className="text-2xl font-bold">
          Remedy
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : remedy ? (
          <>
            <div className="mt-4">
              <p className="font-semibold">
                Astrologer
              </p>

              <p>{remedy.astrologerName}</p>
            </div>

            <div className="mt-4">
              <p className="font-semibold">
                Sent On
              </p>

              <p>
                {new Date(remedy.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="mt-5">
              <p className="font-semibold mb-2">
                Remedy
              </p>

              <div className="bg-gray-100 rounded-lg p-4 whitespace-pre-wrap">
                {remedy.remedyText}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <h3 className="text-xl font-semibold">
              No Remedy Found
            </h3>

            <p className="text-gray-500 mt-2">
              This astrologer hasn't shared any remedy for this session.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 px-5 py-2 bg-purple-700 text-white rounded-lg"
        >
          Close
        </button>

      </div>
    </div>
  );
}