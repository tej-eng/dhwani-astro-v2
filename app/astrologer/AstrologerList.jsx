"use client";

import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "../context/LangContext";
import FilterBar from "@/components/Smcompo/Filter";
import AstroCCard from "@/components/navbarcomp/AstroCCard";

export default function AstrologerList({ serverdata, fetchMore, mode }) {
  const { messages: t } = useLanguage();

  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("ratingHigh");
  const [astroSkill, setAstroSkill] = useState("All");

  const [page, setPage] = useState(1);

  const allAstrologers = useMemo(() => serverdata?.data || [], [serverdata?.data]);
  const totalPages = serverdata?.totalPages || 1;

  const filteredAstrologers = useMemo(() => {
    let filtered = allAstrologers;

    //  MODE FILTER
    // filtered = filtered.filter((astro) => {
    //   if (mode === "chat") return astro.is_chat_online;
    //   if (mode === "call") return astro.is_call_online;
    //   return true;
    // });

    // 🔍 SEARCH
    filtered = filtered.filter((astro) =>
      astro.name?.toLowerCase().includes(search.toLowerCase())
    );

        // 🎯 SKILL FILTER
    if (astroSkill !== "All") {
      filtered = filtered.filter((astro) =>
        astro.skills?.some((skill) =>
          skill.toLowerCase().includes(astroSkill.toLowerCase())
        )
      );
    }

    //  SORT
    const sortMap = {
      expHigh: (a, b) => b.experience - a.experience,
      expLow: (a, b) => a.experience - b.experience,
      priceHigh: (a, b) => b.price - a.price,
      priceLow: (a, b) => a.price - b.price,
      ratingHigh: (a, b) => b.rating - a.rating,
      ratingLow: (a, b) => a.rating - b.rating,
    };

    if (sortMap[sortType]) {
      filtered = [...filtered].sort(sortMap[sortType]);
    }





    return filtered;
  }, [allAstrologers, search, sortType, mode, astroSkill]);

  useEffect(() => {
    if (!fetchMore) return;

    const handleScroll = async () => {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100;

      if (nearBottom && page < totalPages) {
        const nextPage = page + 1;

        await fetchMore({
          variables: {
            searchInput: {
              limit: 8,
              page: nextPage,
              sortField: "RATING",
              sortOrder: "DESC",
            },
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;

            return {
              getAstrologerListBySearch: {
                ...fetchMoreResult.getAstrologerListBySearch,
                data: [
                  ...prev.getAstrologerListBySearch.data,
                  ...fetchMoreResult.getAstrologerListBySearch.data,
                ],
              },
            };
          },
        });

        setPage(nextPage);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, totalPages, fetchMore]);

  return (
    <section className="flex flex-col items-center w-full sm:p-5">
      <FilterBar
        title={
          mode === "chat"
            ? t?.astrocard?.headchat || "Chat With Astrologer"
            : t?.astrocard?.headcall || "Talk To Astrologer"
        }
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        onSortChnage={(id) => setSortType(id)}
        onSelectCategory={(name) => setAstroSkill(name)}
        mode={mode}
      />

      <AstroCCard
        mode={mode}
        data={filteredAstrologers}
        loading={false}
      />
    </section>
  );
}