"use client";

import Image from "next/image";
import dynamic from "next/dynamic";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { GET_BANNERS } from "@/app/graphql/gqlQuery";
import { useQuery } from "@apollo/client/react";


const SwiperStyles = dynamic(
  () => import("./Custom/SwiperStyles"),
  { ssr: false }
);

export default function Banner() {
const { data } = useQuery(GET_BANNERS, {
  variables: { language: "en" },
  fetchPolicy: "cache-first",
});

  const banners = data?.getBanners?.data || [];

 if (!banners.length) {
  return (
    <div className="w-full h-[230px] sm:h-[215px] lg:h-[450px] bg-gray-100 animate-pulse" />
  );
}

  return (
    <div className="slider-banner-home w-full overflow-hidden">
      <SwiperStyles />

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        slidesPerView={1}
        spaceBetween={0}
        loop={true}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        updateOnWindowResize={true}
        resizeObserver={false}
        observer={false}
        observeParents={false}
        watchOverflow={false}
        autoHeight={false}
        className="mySwiper w-full"
      >
     {banners.map((banner, index) => (
  <SwiperSlide key={banner.id}>
    <div className="relative w-full h-[230px] sm:h-[215px] lg:h-[450px]">
      <Image
        src={`https://dhwaniastro.com${banner.imageUrl}`}
        alt={banner.title || "Banner"}
        fill
        priority={index === 0}
        loading={index === 0 ? "eager" : "lazy"}
        className="object-cover"
        sizes="100vw"
      />
    </div>
  </SwiperSlide>
))}
      </Swiper>
    </div>
  );
}