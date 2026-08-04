"use client";

import { useGetManglikQuery } from "@/app/redux/services/astrologyAPI";


export default function ManglikClient({ formData }) {
  const skip = !formData;

  const {
    data: manglik,
    isLoading,
    error,
  } = useGetManglikQuery(formData, { skip });

  if (isLoading) {
    return (
      <div className="flex justify-center flex-col gap-4 items-center h-32">
        <span className="loader-all" />
        <span className="text-purple-600 font-medium">
          Loading Manglik Report...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500">
        Failed to load Manglik Dosha report.
      </p>
    );
  }

  if (!manglik) {
    return (
      <p className="text-center text-red-500">
        No Manglik data available.
      </p>
    );
  }
  return (
    <div className="basic-kundli-charts col-span-4 p-1 flex flex-col gap-4 items-center">
      <div className="flex flex-col gap-3 w-full max-w-7xl">
        <h5 className="text-sm md:text-xl text-black text-center font-semibold">
          <span className="text-red-500">"Manglik Dosha </span> In Kundli"
        </h5>

  
        <div className="rounded-2xl border-2 border-violet-100 p-4 bg-purple-100 shadow-sm flex flex-col gap-2">
          <div className="text-xs sm:text-sm text-black">
            <strong>Effectiveness of Manglik Dosha: </strong>
            {manglik.manglik_status}
          </div>
          <div className="text-xs sm:text-sm text-black">
            <strong>Percentage of Manglik Dosha: </strong>
            {manglik.percentage_manglik_present}%
          </div>
          <div className="text-xs sm:text-sm text-black">
            <strong>Percentage After Cancellation: </strong>
            {manglik.percentage_manglik_after_cancellation}%
          </div>
          <div className="text-xs sm:text-sm text-black flex flex-col gap-1">
            <strong>Manglik Report: </strong>
            <span>{manglik.manglik_report}</span>
          </div>
        </div>

        {/* Cancel Rules */}
        {manglik.manglik_cancel_rule?.length > 0 && (
          <div className="bg-purple-100 rounded-2xl p-4 text-sm text-black">
            <strong className="text-purple-600">Manglik Cancel Rule:</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              {manglik.manglik_cancel_rule.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Aspect / House Rules */}
        {manglik.manglik_present_rule && (
          <div className="bg-purple-100 rounded-2xl p-4 flex flex-col gap-3 text-sm text-black">
            {manglik.manglik_present_rule.based_on_aspect?.length > 0 && (
              <div>
                <strong className="text-xs sm:text-sm text-purple-600">Based On Aspects:</strong>
                <ul className="list-disc text-xs sm:text-sm list-inside ml-4 mt-1">
                  {manglik.manglik_present_rule.based_on_aspect.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            {manglik.manglik_present_rule.based_on_house?.length > 0 && (
              <div>
                <strong className="text-xs sm:text-sm text-purple-600">Based On Houses:</strong>
                <ul className="list-disc text-xs sm:text-sm list-inside ml-4 mt-1">
                  {manglik.manglik_present_rule.based_on_house.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
