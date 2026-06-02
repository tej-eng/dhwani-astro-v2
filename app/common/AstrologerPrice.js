"use client";

import React from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useLanguage } from "../context/LangContext";

const ME_QUERY = gql`
  query Me {
    me {
      id
    }
  }
`;

function AstrologerPrice({ mode, astro }) {
  const { messages: t } = useLanguage();

  const { data, loading } = useQuery(ME_QUERY, {
    fetchPolicy: "cache-first",
  });

  const isAuth = !!data?.me;

  if (loading) return null;

  // pick correct pricing based on mode (CHAT/CALL/etc)
  const pricing = astro?.pricing?.find(
    (p) => p.type === (mode || "CHAT").toUpperCase()
  );

  const oprice = astro?.activeOffer?.price;

  const price = pricing?.price ?? 0;
  const offerPrice = pricing?.offerPrice ?? price;

  return (
    <>
      {/* 🔹 NOT LOGGED IN */}
      {!isAuth && (
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center gap-3 text-base font-semibold text-red-500 sm:text-[16px]">
            {t?.astrocard?.free || "Free"}
          </span>

          <span className="text-sm font-semibold text-black line-through">
            ₹{price} /{t?.astrocard?.min || "min"}
          </span>
        </div>
      )}

      {/* 🔹 LOGGED IN */}
      {isAuth && (
        <>
          <span className="flex items-center justify-center gap-3 text-sm font-semibold text-red-500 sm:text-lg">
            ₹{oprice ? oprice : offerPrice}
          </span>

          <span className="text-sm font-semibold text-black line-through">
            ₹{price} /min
          </span>
        </>
      )}
    </>
  );
}

export default React.memo(AstrologerPrice);