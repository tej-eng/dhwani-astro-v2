import { decodeKundliHash } from "@/utils/kundliHash";
import NumerokundliClient from "./NumerokundliClient";

export const revalidate = 3600;

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
        Kundli session expired
      </p>
    );
  }

  return (
    <NumerokundliClient
      formData={formData}
    />
  );
}