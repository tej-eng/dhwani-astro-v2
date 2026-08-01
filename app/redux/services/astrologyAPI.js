import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const encodedAuth = 'NjE4NzQyOjdjMjA1OTllYjIzYmUyNzZlOGM4YWNlOGJlZjg4MGMy';
const USER_ID = process.env.NEXT_PUBLIC_ASTROLOGY_USER_ID || "618742";
const API_KEY = process.env.NEXT_PUBLIC_ASTROLOGY_API_KEY || "7c20599eb23be276e8c8ace8bef880c2";
export const astrologyApi = createApi({
  reducerPath: 'astrologyApi',
  baseQuery: fetchBaseQuery({
    baseUrl: "https://json.astrologyapi.com/v1/",
    prepareHeaders: (headers) => {
      headers.set("Authorization", "Basic " + btoa(`${USER_ID}:${API_KEY}`));
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // kundali match apis  -------------------------------
    getMatchAsktP: builder.mutation({
      query: (body) => ({
        url: 'match_ashtakoot_points ',
        method: 'POST',
        body,
      }),
    }),
    getMatchObst: builder.mutation({
      query: (body) => ({
        url: 'match_obstructions',
        method: 'POST',
        body,
      }),
    }),
    getMatchAstro: builder.mutation({
      query: (body) => ({
        url: 'match_astro_details',
        method: 'POST',
        body,
      }),
    }),
    getMatchManglik: builder.mutation({
      query: (body) => ({
        url: 'match_manglik_report',
        method: 'POST',
        body,
      }),
    }),
    getMatchMrepo: builder.mutation({
      query: (body) => ({
        url: 'match_making_report',
        method: 'POST',
        body,
      }),
    }),
    // kundali match apis end  -------------------------------
    getAdvPanchang: builder.mutation({
      query: (body) => ({
        url: 'advanced_panchang',
        method: 'POST',
        body,
      }),
    }),
    getChaugadiya: builder.mutation({
      query: (body) => ({
        url: 'chaughadiya_muhurta',
        method: 'POST',
        body,
      }),
    }),
    getHoraChart: builder.mutation({
      query: (body) => ({
        url: 'hora_muhurta',
        method: 'POST',
        body,
      }),
    }),
    // horoscope apis -----------------------------------------------------------------------
    getSunSignPredToday: builder.mutation({
      query: ({ zodiacName, body }) => ({
        url: `sun_sign_prediction/daily/${encodeURIComponent(zodiacName)}`,
        method: 'POST',
        body,
      }),
    }),
    getSunSignPredNxt: builder.mutation({
      query: ({ zodiacName, body }) => ({
        url: `sun_sign_prediction/daily/next/${encodeURIComponent(zodiacName)}`,
        method: 'POST',
        body,
      }),
    }),
    getSunSignPredPrev: builder.mutation({
      query: ({ zodiacName, body }) => ({
        url: `sun_sign_prediction/daily/previous/${encodeURIComponent(zodiacName)}`,
        method: 'POST',
        body,
      }),
    }),
    getSunSignPredMonth: builder.mutation({
      query: ({ zodiacName, body }) => ({
        url: `horoscope_prediction/monthly/${encodeURIComponent(zodiacName)}`,
        method: 'POST',
        body,
      }),
    }),
    // ------------------------------------------------------------------------------------------------------------
    getChartKundli: builder.mutation({
      query: ({ chartType, body }) => {
        const finalType = chartType === 'chalit' ? ':chalit' : chartType;
        return {
          url: `horo_chart_image/${encodeURIComponent(finalType)}`,
          method: 'POST',
          body,
        };
      },
    }),
  }),
});

export const {
  useGetChartKundliMutation,
  useGetMatchAsktPMutation,
  useGetMatchObstMutation,
  useGetMatchAstroMutation,
  useGetMatchManglikMutation,
  useGetMatchMrepoMutation,
  useGetAdvPanchangMutation,
  useGetChaugadiyaMutation,
  useGetHoraChartMutation,
  useGetSunSignPredTodayMutation,
  useGetSunSignPredNxtMutation,
  useGetSunSignPredPrevMutation,
  useGetSunSignPredMonthMutation,
} = astrologyApi;