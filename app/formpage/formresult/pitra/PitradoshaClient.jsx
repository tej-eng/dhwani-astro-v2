"use client";

import { useGetPitraDoshaQuery } from "@/app/redux/services/astrologyAPI";


export default function PitradoshaClient({ formData }) {
  const skip = !formData;

  const {
    data: pitraData,
    isLoading,
    error,
  } = useGetPitraDoshaQuery(formData, { skip });

  if (isLoading) {
    return (
      <div className="flex justify-center flex-col gap-4 items-center h-32">
        <span className="loader-all" />
        <span className="text-purple-600 font-medium">
          Loading Pitra Dosha Report...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500">
        Failed to load Pitra Dosha report.
      </p>
    );
  }

  if (!pitraData) {
    return (
      <p className="text-center text-red-500">
        No Pitra Dosha report available.
      </p>
    );
  }

  return (
    <div className="basic-kundli-charts col-span-4 flex flex-col gap-2 items-center">
      <div className="container w-full max-w-7xl">
        <h5 className="text-sm md:text-2xl text-black text-center font-semibold">
          <span className="text-red-500">"Pitra Dosha </span> In Kundli"
        </h5>

        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <div className="rounded-2xl bg-purple-100 p-4 w-full">
            <div className="flex flex-col gap-3 text-sm text-black">

              <div>
                <span className="font-semibold text-purple-600">
                  What is Pitra Dosha:
                </span>
                <p>{pitraData.what_is_pitri_dosha || "N/A"}</p>
              </div>

              <div>
                <span className="font-semibold text-purple-600">
                  Pitra Dosha Causes:
                </span>
                <p>{pitraData.rules_matched || "N/A"}</p>
              </div>

              <div>
                <span className="font-semibold text-purple-600">
                  Effects:
                </span>
                <p>{pitraData.effects || "N/A"}</p>
              </div>

              <div>
                <span className="font-semibold text-purple-600">
                  Remedies:
                </span>
                <p>{pitraData.remedies || "N/A"}</p>
              </div>

              <div>
                <span className="font-semibold text-purple-600">
                  Conclusion:
                </span>
                <p>{pitraData.conclusion || "N/A"}</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
