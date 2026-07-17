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

  const channelName = params?.channelName;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hostJoined, setHostJoined] = useState(false);

  const [joinLive] = useLazyQuery(JOIN_LIVE_STREAM);

  useEffect(() => {
    if (!channelName) return;

    initializeLive();

    return () => {
      cleanup();
    };
  }, [channelName]);

  const cleanup = async () => {
    try {
      console.log("Leaving channel...");

      client.removeAllListeners();

      await client.leave();

      console.log("Channel left");
    } catch (err) {
      console.error(err);
    }
  };

  const subscribeToUser = async (user, mediaType) => {
    try {
      console.log("================================");
      console.log("Subscribing User:", user.uid);
      console.log("Media Type:", mediaType);

      await client.subscribe(user, mediaType);

      console.log("Subscribed Successfully");

      if (mediaType === "video") {
        setHostJoined(true);

        console.log("Video Track:", user.videoTrack);
        console.log(
          "Container:",
          document.getElementById("remote-video")
        );

        // Play inside this container
        user.videoTrack.play("remote-video");

        console.log("Video Playing...");
      }

      if (mediaType === "audio") {
        user.audioTrack.play();

        console.log("Audio Playing...");
      }

      console.log("================================");
    } catch (err) {
      console.error("Subscribe Error:", err);
    }
  };

  const initializeLive = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await joinLive({
        variables: {
          channelName,
        },
      });

      if (!data?.joinLive) {
        throw new Error("Live stream unavailable");
      }

      const live = data.joinLive;

      console.log("Live Data:", live);

      // Register listeners BEFORE join
      client.on("user-published", async (user, mediaType) => {
        console.log(
          "EVENT -> user-published",
          user.uid,
          mediaType
        );

        await subscribeToUser(user, mediaType);
      });

      client.on("user-unpublished", (user) => {
        console.log("User Unpublished:", user.uid);

        setHostJoined(false);
      });

      client.on("user-left", (user) => {
        console.log("User Left:", user.uid);

        setHostJoined(false);
      });

      await client.setClientRole("audience");

      console.log("Joining Agora...");

      await client.join(
        live.appId,
        live.channelName,
        live.token,
        live.uid
      );

      console.log("Joined Agora Successfully");

      console.log("Remote Users:", client.remoteUsers);

      // Handle users already in channel
      for (const user of client.remoteUsers) {
        console.log("Existing User:", user.uid);

        if (user.hasVideo) {
          await subscribeToUser(user, "video");
        }

        if (user.hasAudio) {
          await subscribeToUser(user, "audio");
        }
      }

      setLoading(false);
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Unable to join live stream"
      );

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gray-950 border-b border-gray-800 px-6 py-4 flex justify-between">
        <h1 className="text-white text-2xl font-bold">
          🔴 Live Session
        </h1>

        <span className="bg-red-600 text-white px-4 py-2 rounded-full animate-pulse">
          LIVE
        </span>
      </div>

      <div className="p-6">
        {loading && (
          <div className="h-[80vh] flex items-center justify-center">
            <div className="text-white text-xl">
              Connecting...
            </div>
          </div>
        )}

        {error && (
          <div className="h-[80vh] flex items-center justify-center">
            <div className="bg-red-600 text-white p-4 rounded-lg">
              {error}
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {!hostJoined && (
              <div className="mb-4 bg-yellow-500 text-black p-3 rounded-lg text-center">
                Waiting for astrologer to start video...
              </div>
            )}

            <div
              id="remote-video"
              className="w-full h-[80vh] bg-gray-900 rounded-xl overflow-hidden"
            />
          </>
        )}
      </div>
    </div>
  );
}