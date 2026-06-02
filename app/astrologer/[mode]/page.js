"use client";

import { useParams } from "next/navigation";
import Astroskelton from "@/components/Smcompo/Astroskelton";
import AstrologerList from "../AstrologerList";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_ASTROLOGERS = gql`
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
  }
}
`;

export default function Page() {
  const params = useParams();
  const mode = params?.mode;

 const { data, loading, error, fetchMore } = useQuery(
  GET_ASTROLOGERS,
  {
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
  }
);

  if (loading) return <Astroskelton />;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <AstrologerList
      serverdata={data?.getAstrologerListBySearch}
      fetchMore={fetchMore}
      mode={mode}
    />
  );
}