"use client";

import { useParams } from "next/navigation";
import Astroskelton from "@/components/Smcompo/Astroskelton";
import AstrologerList from "../AstrologerList";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useAuth } from "@/app/context/authContext";
import { GET_ASTROLOGERS_GUEST, GET_ASTROLOGERS_USER } from "@/app/graphql/gqlQuery";

/* ---------------- AUTH ---------------- */



/* ---------------- GUEST ---------------- */



/* ---------------- AUTH USER ---------------- */



export default function Page() {
  const params = useParams();
  const mode = params?.mode;

  /* ---------- CHECK LOGIN ---------- */

  

const { isLoggedIn, authLoading  } = useAuth();

const selectedQuery = isLoggedIn
  ? GET_ASTROLOGERS_USER
  : GET_ASTROLOGERS_GUEST;

console.log("isLoggedIn", isLoggedIn);
console.log(
  "Selected Query",
  isLoggedIn
    ? "GET_ASTROLOGERS_USER"
    : "GET_ASTROLOGERS_GUEST"
);




console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxx",selectedQuery?.definitions?.[0]?.name?.value);

  /* ---------- ASTRO LIST ---------- */

const { data, loading, error, fetchMore } =
  useQuery(selectedQuery, {
    skip: authLoading,
    variables: {
      searchInput: {
        limit: 12,
        page: 1,
        sortField: "RATING",
        sortOrder: "DESC",
        type: mode?.toUpperCase() || "CHAT",
      },
    },
    fetchPolicy: "network-only",
  });

  if (loading || authLoading) {
    return <Astroskelton />;
  }

  if (error) {
    return (
      <p className="text-red-500">
        Error: {error.message}
      </p>
    );
  }

  const astrologerData = isLoggedIn
    ? data?.getAstrologerListForUser
    : data?.getAstrologerListBySearch;

  return (
    <AstrologerList
      serverdata={astrologerData}
      fetchMore={fetchMore}
      mode={mode}
    />
  );
}