"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLazyQuery } from "@apollo/client/react";
import { JOIN_LIVE_STREAM } from "@/app/graphql/gqlQuery";

import AgoraRTC from "agora-rtc-sdk-ng";

const client = AgoraRTC.createClient({
  mode: "live",
  codec: "vp8",
});

export default function WatchLive() {
  const params = useParams();

  const channelName =
    params?.channelName;

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [hostJoined, setHostJoined] =
    useState(false);

  const [joinLive] =
    useLazyQuery(JOIN_LIVE_STREAM);

  useEffect(() => {
    if (!channelName) return;

    initializeLive();

    return () => {
      cleanup();
    };
  }, [channelName]);

  const cleanup = async () => {
    try {
      client.removeAllListeners();

      await client.leave();
    } catch (err) {
      console.log(err);
    }
  };

  const initializeLive =
    async () => {
      try {
        setLoading(true);
        setError("");

        const { data } =
          await joinLive({
            variables: {
              channelName,
            },
          });

        if (!data?.joinLive) {
          throw new Error(
            "Live stream unavailable"
          );
        }

        const live =
          data.joinLive;

        await client.setClientRole(
          "audience"
        );

        await client.join(
          live.appId,
          live.channelName,
          live.token,
          live.uid
        );

        client.on(
          "user-published",
          async (
            user,
            mediaType
          ) => {
            try {
              await client.subscribe(
                user,
                mediaType
              );

              if (
                mediaType ===
                "video"
              ) {
                setHostJoined(true);

                user.videoTrack.play(
                  `remote-video-${user.uid}`
                );
              }

              if (
                mediaType ===
                "audio"
              ) {
                user.audioTrack.play();
              }
            } catch (err) {
              console.log(err);
            }
          }
        );

        client.on(
          "user-unpublished",
          () => {
            setHostJoined(false);
          }
        );

        setLoading(false);
      } catch (err) {
        console.log(err);

        setError(
          err.message ||
            "Unable to join live stream"
        );

        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-950 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-white text-2xl font-bold">
          🔴 Live Session
        </h1>

        <span className="bg-red-600 text-white px-4 py-2 rounded-full animate-pulse text-sm">
          LIVE
        </span>
      </div>

      <div className="p-6">
        {loading && (
          <div className="h-[80vh] flex items-center justify-center">
            <div className="text-white text-xl">
              Connecting to live stream...
            </div>
          </div>
        )}

        {error && (
          <div className="h-[80vh] flex items-center justify-center">
            <div className="bg-red-600 text-white px-6 py-4 rounded-xl">
              {error}
            </div>
          </div>
        )}

        {!loading &&
          !error && (
            <>
              {!hostJoined && (
                <div className="mb-4 bg-yellow-500 text-black p-3 rounded-lg text-center font-medium">
                  Waiting for astrologer
                  to start video...
                </div>
              )}

              <div
                id="remote-video"
                className="w-full h-[80vh] rounded-2xl overflow-hidden bg-gray-900"
              >
                <div
                  id="remote-video-0"
                  className="w-full h-full"
                />
              </div>
            </>
          )}
      </div>
    </div>
  );
}