"use client";
import DOMPurify from "dompurify";

import {
  useGetKalsharpQuery,
  useGetPujaSuggestionQuery,
} from "@/app/redux/services/astrologyAPI";

export default function KalsharpClient({ formData }) {
  const skip = !formData;

  const {
    data: kalData,
    isLoading: kalLoading,
    error: kalError,
  } = useGetKalsharpQuery(formData, { skip });

  const {
    data: pujaData,
    isLoading: pujaLoading,
    error: pujaError,
  } = useGetPujaSuggestionQuery(formData, { skip });

  const loading = kalLoading || pujaLoading;
  const error = kalError || pujaError;

  if (loading) {
    return (
      <div className="flex justify-center flex-col gap-4 items-center h-32">
        <span className="loader-all"></span>
        <span className="text-purple-600 font-medium">
          Loading Kalsharp Report...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500">Failed to load Kalsharp Dosha.</p>
    );
  }

  if (!kalData) {
    return (
      <p className="text-center text-red-500">No Kalsharp data available.</p>
    );
  }

  const kalSarpaPuja =
    pujaData?.suggestions?.find((s) => s.puja_id === "KAL_SARPA") || null;
  return (
    <div className="basic-kundli-charts p-1 col-span-4 flex flex-col gap-2 items-center">
      <div className="flex flex-col gap-4 w-full max-w-7xl">
        <h5 className="text-sm md:text-2xl text-black text-center font-semibold">
          <span className="text-red-500">"Kalsharp Dosha </span> In Kundli"
        </h5>

        <div className="p-4 bg-purple-50 shadow-md rounded-2xl border ">
          <div className="flex text-xs sm:text-sm flex-col gap-2 text-black">
            <div>
              <b className="text-purple-700">Kalsharp Dosha Present:</b>{" "}
              {kalData.present ? "Yes" : "No"}
            </div>
            <div>
              <b className="text-purple-700">Type:</b> {kalData.type}
            </div>
            <div>
              <b className="text-purple-700">Name:</b> {kalData.name}
            </div>
            <div>
              <b className="text-purple-700">House Effected:</b>{" "}
              {kalData.report?.house_id}
            </div>
            <div>
              <b className="text-purple-700">One Line:</b> {kalData.one_line}
            </div>
            <div>
              <b className="text-purple-700">Main Report:</b>
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(kalData.report?.report || ""),
                }}
              />
            </div>
          </div>
        </div>

        {kalData.present && kalSarpaPuja && (
          <div className="flex flex-col mt-4 gap-3">
            <h1 className="text-[#2f1254] text-sm sm:text-2xl text-center font-semibold">
              • <strong>Kalsharp Remedies & Puja Suggestion</strong> •
            </h1>

            <div className="p-4 text-xs sm:text-sm bg-purple-50 shadow-md rounded-2xl text-base text-black">
              <h5 className="font-semibold text-purple-700 text-sm sm:text-md">
                {kalSarpaPuja.title}
              </h5>
              <div className="flex flex-col gap-1">
                <b>Description:</b>
                {kalSarpaPuja.summary}
              </div>
              <div>
                <b>One Line:</b> {kalSarpaPuja.one_line}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
