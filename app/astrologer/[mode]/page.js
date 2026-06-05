"use client";

import { useParams } from "next/navigation";
import Astroskelton from "@/components/Smcompo/Astroskelton";
import AstrologerList from "../AstrologerList";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useAuth } from "@/app/context/authContext";

/* ---------------- AUTH ---------------- */



/* ---------------- GUEST ---------------- */

const GET_ASTROLOGERS_GUEST = gql`
  query GetAstrologers($searchInput: AstrologerSearchInput) {
    getAstrologerListBySearch(searchInput: $searchInput) {
      data {
        id
        profilePic
        name
        experience
        rating
        skills
        languages

        activeOffer {
          id
          offerName
          price
          description
        }

        pricing {
          type
          price
          offerPrice
          commissionPercent
          isActive
        }
      }

      totalPages
      currentPage
      totalCount
    }
  }
`;

/* ---------------- AUTH USER ---------------- */

const GET_ASTROLOGERS_USER = gql`
  query GetAstrologerListForUser(
    $searchInput: AstrologerSearchInput
  ) {
    getAstrologerListForUser(
      searchInput: $searchInput
    ) {
      totalCount
      currentPage
      totalPages

      data {
        id
        profilePic
        name
        experience
        rating
        skills
        languages

        activeOffer {
          id
          offerName
          price
          description
        }

        pricing {
          type
          price
          originalPrice
          offerPrice
          commissionPercent
          isActive
        }
      }
    }
  }
`;

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