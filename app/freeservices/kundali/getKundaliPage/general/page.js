export const revalidate = 3600;

import { Suspense } from "react";
import GeneralUI from "./GeneralUI";
import { decodeKundliHash } from "@/utils/kundliHash";
import { astrologySeo } from "@/app/api/astrologySeo";
import { SEO_ENDPOINTS } from "@/app/api/seoEndpoints";

export default async function Page({ searchParams }) {
  const hash = searchParams.hash;

  if (!hash) {
    return (
      <p className="text-center text-gray-400">
        Missing Kundli data
      </p>
    );
  }

  const formData = decodeKundliHash(hash);

  if (!formData) {
    return (
      <p className="text-center text-gray-400">
        Invalid or expired link
      </p>
    );
  }

  let gendata = null;

  try {
    gendata = await astrologySeo(
      SEO_ENDPOINTS.GENERAL_NAKSHATRA,
      formData
    );
  } catch (err) {
    console.error(err);
  }

  if (!gendata || typeof gendata !== "object") {
    return (
      <p className="text-center text-red-500">
        Failed to fetch General Prediction data...
      </p>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex justify-center flex-col gap-4 items-center h-32">
          <span className="loader-all"></span>
          <span className="ml-3 text-purple-600 font-medium">
            Loading Reports...
          </span>
        </div>
      }
    >
      <GeneralUI gendata={gendata} />
    </Suspense>
  );
}