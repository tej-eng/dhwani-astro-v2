"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLazyQuery } from "@apollo/client/react";
import { JOIN_LIVE_STREAM } from "@/app/graphql/gqlQuery";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useContext } from "react";
import SocketContext from "../../context/socketContext";

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
  const [messages, setMessages] = useState([]);
const [message, setMessage] = useState("");
const { socket, connectSocket } = useContext(SocketContext);
const chatRef = useRef(null);
useEffect(() => {

    if(chatRef.current){

        chatRef.current.scrollTop =
            chatRef.current.scrollHeight;

    }

}, [messages]);

  useEffect(() => {
    if (!channelName) return;

    initializeLive();

    return () => {
      cleanup();
    };
  }, [channelName]);

  useEffect(() => {
    if (!socket) {
        connectSocket();
    }
}, []);

  useEffect(() => {
  if (!socket) return;

  const handleMessage = (data) => {
    console.log("Live Chat:", data);

    setMessages((prev) => [...prev, data]);
  };

  socket.on("live_message", handleMessage);

  return () => {
    socket.off("live_message", handleMessage);
  };
}, [socket]);

const sendMessage = () => {
  if (!socket) return;

  if (!message.trim()) return;

  socket.emit("live_message", {
    channelName,
    message,
    senderName: "User", // replace with logged in user name
    createdAt: new Date().toISOString(),
  });

  setMessage("");
};


  const cleanup = async () => {
    try {

        if (socket) {
            socket.emit("leave_live", {
                channelName,
            });
        }

        client.removeAllListeners();

        await client.leave();

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

      if (socket) {
  socket.emit("join_live", {
    channelName: live.channelName,
  });

  console.log("Joined live room:", live.channelName);
}

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
  <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black">
    {/* Header */}
    <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur border-b border-gray-800">
      <div className="flex items-center gap-3">
        <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
          🔴 LIVE
        </div>

        <div>
          <h2 className="text-white font-semibold text-lg">
            Live Session
          </h2>
          <p className="text-gray-400 text-xs">
            Watch astrologer live
          </p>
        </div>
      </div>

      <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
        👁 128
      </div>
    </div>

    <div className="max-w-md mx-auto p-4">
      {loading && (
        <div className="h-[75vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">
              Connecting to live stream...
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="h-[75vh] flex items-center justify-center">
          <div className="bg-red-600 text-white px-6 py-4 rounded-xl shadow-lg">
            {error}
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {!hostJoined && (
            <div className="mb-4 bg-yellow-500 text-black rounded-xl p-3 text-center font-medium shadow">
              Waiting for astrologer to start live...
            </div>
          )}

          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-800 bg-black">

            {/* Agora Video */}
            <div
              id="remote-video"
              className="w-full h-[75vh] bg-black"
            />

            {/* Top Overlay */}
            <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-gradient-to-b from-black/70 to-transparent">

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gray-700 flex items-center justify-center text-white text-lg">
                  👳
                </div>

                <div>
                  <h3 className="text-white font-semibold">
                    Astrologer
                  </h3>

                  <p className="text-gray-300 text-xs">
                    Live Consultation
                  </p>
                </div>
              </div>

              <div className="bg-red-600 px-3 py-1 rounded-full text-white text-sm font-medium animate-pulse">
                LIVE
              </div>
            </div>

            {/* Bottom Overlay */}
            <div className="absolute bottom-0 left-0 right-0">

  {/* Live Chat */}

  <div className="h-56 overflow-y-auto px-3 py-2 space-y-2" ref={chatRef}>

    {messages.map((item, index) => (
      <div
        key={index}
        className="bg-black/60 rounded-full px-3 py-2 inline-flex max-w-[90%]"
      >
        <span className="text-yellow-400 font-semibold mr-2">
          {item.senderName}
        </span>

        <span className="text-white break-words">
          {item.message}
        </span>
      </div>
    ))}

  </div>

  {/* Message Box */}

  <div className="flex items-center gap-2 p-3 bg-black/80">

    <input
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      placeholder="Write a message..."
      className="flex-1 rounded-full bg-gray-900 text-white px-4 py-3 outline-none"
    />

    <button
      onClick={sendMessage}
      className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-full"
    >
      Send
    </button>

  </div>

  {/* Actions */}

  <div className="flex justify-around bg-black/80 py-3">

    <button className="flex flex-col items-center text-white">
      ❤️
      <span className="text-xs">Like</span>
    </button>

    <button className="flex flex-col items-center text-white">
      🎁
      <span className="text-xs">Gift</span>
    </button>

    <button className="flex flex-col items-center text-green-400">
      📞
      <span className="text-xs">Call</span>
    </button>

    <button
      onClick={cleanup}
      className="flex flex-col items-center text-red-500"
    >
      ❌
      <span className="text-xs">Leave</span>
    </button>

  </div>

</div>

          </div>
        </>
      )}
    </div>
  </div>
);
}