"use client";

import Image from "next/image";
import Link from "next/link";
import Searchtop from "../Smcompo/Searchtop";
import { useLanguage } from "@/app/context/LangContext";
import useScrollZoom from "@/Hooks/scrollZoom";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_CATEGORIES, GET_SERVICES } from "@/app/graphql/gqlQuery";

export default function Dhservices() {
  const { messages: t } = useLanguage();

  const [search, setSearch] = useState("");

  const {
    data: servicesData,
    loading: servicesLoading,
    error: servicesError,
  } = useQuery(GET_SERVICES);

  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useQuery(GET_CATEGORIES);

  const categories = categoriesData?.getCategories || [];

  const nullCategoryServices =
    servicesData?.getServices?.filter(
      (service) => service.category === null
    ) || [];

  const cards = [
    ...categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      image: cat.image,
      slug: cat.slug,
      href: `/dhwani-services/${cat.slug}`,
      type: "category",
    })),

    ...nullCategoryServices.map((service) => ({
      id: service.id,
      name: service.name,
      image: service.image,
      href: service.slug,
      type: "service",
    })),
  ].filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  useScrollZoom(".head-wrap");

  if (servicesLoading || categoriesLoading) {
    return (
      <section className="relative p-2 sm:p-5 flex w-full flex-col items-center">
        {/* Search Skeleton */}
        <div className="w-full xl:w-[90%] mb-5">
          <div className="h-12 w-full rounded-full bg-gray-200 animate-pulse" />
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 w-full xl:w-[90%]">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="rounded-3xl overflow-hidden shadow bg-white"
            >
              <div className="h-35 sm:h-50 bg-gray-200 animate-pulse" />

              <div className="p-3">
                <div className="h-5 w-3/4 mx-auto rounded bg-gray-200 animate-pulse mb-4" />

                <div className="h-9 w-[60%] mx-auto rounded-full bg-gray-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (servicesError || categoriesError) {
    return <p>Error loading data</p>;
  }

  return (
    <section
      aria-label="Healing Services List"
      className="relative p-2 sm:p-5 flex w-full flex-col items-center self-center"
    >
      <Searchtop
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
      />

      <div className="healing-card-main grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 py-5 xl:p-5 w-full xl:w-[90%]">
        {cards.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className="element-item head-wrap cat-Service rounded-4xl overflow-hidden bg-[#892be226] shadow-xl text-center"
          >
            <div className="block">
              <div className="relative w-full sm:h-50 h-35 overflow-hidden">
                <Image
                  src={
                    `https://www.dhwaniastro.com${item.image}` ||
                    "/placeholder.webp"
                  }
                  alt={item.name}
                  width={300}
                  height={160}
                  className="w-full h-full object-cover"
                  style={{
                    WebkitMaskImage:
                      "linear-gradient(to bottom, black 90%, transparent 100%)",
                    maskImage:
                      "linear-gradient(to bottom, black 90%, transparent 100%)",
                  }}
                />
              </div>

              <div className="sm:p-2 p-1">
                <h3 className="text-[#8a2be2] font-bold text-base sm:text-lg mb-1">
                  {item.name}
                </h3>

                <div className="mt-1 mb-1 flex flex-col lg:flex-row w-full items-center justify-around gap-2 sm:gap-3">
                  <Link
                    href={item.href}
                    className="bg-[#8a2be2] w-[60%] text-white px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-base hover:bg-[#7325c0] transition"
                  >
                    {t?.healing?.exp || "Explore Now"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}