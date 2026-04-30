"use client";

import { useState, useRef, useEffect, useContext } from "react";
import SocketContext from "../context/socketContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { clearActiveRequest } from "../redux/reducer/chat/sendRequestSlice";
import { useDispatch } from "react-redux";

const ChatRequestCard = ({
  room_Id,
  astro_Name,
  user_Id,
  astroimage,
  astro_id,
  chat_time,
}) => {
  const dispatch = useDispatch();
  const route = useRouter();
  const { socket } = useContext(SocketContext);

  const [timeLeft, setTimeLeft] = useState(60);
  const [queueData, setQueueData] = useState(null);
  const [showQueuePopup, setShowQueuePopup] = useState(false);
  const [showwaitingpopup, setShowwaitingpopup] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const timerRef = useRef(null);
  const timeoutHandledRef = useRef(false);

  // =========================================================
  // 🔍 GLOBAL RENDER DEBUG
  // =========================================================
  console.log("🔄 RENDER", {
    room_Id,
    showwaitingpopup,
    showQueuePopup,
    queueData,
    timeLeft,
  });

  // =========================================================
  // TIMER
  // =========================================================
  const startTimer = (seconds) => {
    console.log("⏱️ startTimer called with:", seconds);

    if (timerRef.current) {
      console.log("🧹 clearing existing timer");
      clearInterval(timerRef.current);
    }

    setTimeLeft(seconds);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        console.log("⏳ timer tick:", prev);

        if (prev <= 1) {
          console.log("⛔ timer ended");

          clearInterval(timerRef.current);
          timerRef.current = null;

          localStorage.removeItem("queue_state");

          socket?.emit("autodisconnect", {
            room_id: room_Id,
            astroid: astro_id,
          });

          setShowQueuePopup(false);
          setShowwaitingpopup(false);

          toast.success("Chat request timed out.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // =========================================================
  // 🔥 RESTORE STATE
  // =========================================================
  useEffect(() => {
    console.log("🟡 RESTORE EFFECT START");

    const saved = localStorage.getItem("queue_state");
    console.log("📦 queue_state from storage:", saved);

    if (!saved) {
      console.log("❌ No saved state");
      setIsHydrated(true);
      return;
    }

    const parsed = JSON.parse(saved);
    console.log("✅ Parsed state:", parsed);

    const now = Date.now();
    const remaining = Math.floor((parsed.expiresAt - now) / 1000);

    console.log("⏳ Remaining time:", remaining);

    if (remaining <= 0) {
      console.log("⚠️ State expired");
      localStorage.removeItem("queue_state");
      setIsHydrated(true);
      return;
    }

    console.log("🎯 Applying restored UI:", parsed.type);

    setQueueData(parsed.data);

    if (parsed.type === "waiting") {
      setShowwaitingpopup(true);
      setShowQueuePopup(false);
    } else {
      setShowQueuePopup(true);
      setShowwaitingpopup(false);
    }

    startTimer(remaining);

    setIsHydrated(true);
  }, []);

  // =========================================================
  // INITIAL STATE
  // =========================================================
  useEffect(() => {
    if (!isHydrated) return;

    console.log("🟢 INITIAL STATE EFFECT");

    const saved = localStorage.getItem("queue_state");
    if (saved) {
      console.log("⛔ Skipping initial state (queue exists)");
      return;
    }

    const activeChatRoom = localStorage.getItem("activeChatRoom");
    const isCompleted =
      localStorage.getItem(`chatCompleted_${room_Id}`) === "true";

    console.log("📊 initial conditions:", {
      activeChatRoom,
      isCompleted,
    });

    if (activeChatRoom || isCompleted) {
      setShowwaitingpopup(false);
    } else {
      if (!!room_Id) setShowwaitingpopup(true);
    }
  }, [room_Id, isHydrated]);

  // =========================================================
  // DEFAULT TIMER
  // =========================================================
  useEffect(() => {
    if (!socket) return;
    if (!isHydrated) return;

    const saved = localStorage.getItem("queue_state");
    if (saved) {
      console.log("⛔ Skipping default timer (queue exists)");
      return;
    }

    console.log("🟣 DEFAULT TIMER START");

    startTimer(60);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [room_Id, socket, isHydrated]);

  // =========================================================
  // SOCKET EVENTS
  // =========================================================
  useEffect(() => {
    if (!socket) return;

    console.log("🔌 Socket listeners attached");

    socket.on("connect", () => {
      console.log("🟢 SOCKET CONNECTED");
    });

    const handleQueue = (data) => {
      console.log("📡 QUEUE EVENT RECEIVED:", data);

      const now = Date.now();
      let duration = data.position === 0 ? 60 : data.waitTime;

      const stateToStore = {
        data,
        type: data.position === 0 ? "waiting" : "queue",
        expiresAt: now + duration * 1000,
      };

      console.log("💾 Saving queue_state:", stateToStore);

      localStorage.setItem("queue_state", JSON.stringify(stateToStore));

      setQueueData(data);

      if (data.position === 0) {
        setShowwaitingpopup(true);
        setShowQueuePopup(false);
      } else {
        setShowQueuePopup(true);
        setShowwaitingpopup(false);
      }

      startTimer(duration);
    };

    socket.on("queue_position", handleQueue);

    return () => {
      socket.off("queue_position", handleQueue);
    };
  }, [socket, room_Id]);

  // =========================================================
  // UI
  // =========================================================
  return (
    <div className="flex items-center justify-center w-full">
      {showwaitingpopup && (
        <div className="w-full bg-purple-200 px-3 py-2 rounded-full flex relative">
          <Image
            src={`/ds-img/${astroimage}`}
            width={50}
            height={50}
            className="rounded-full"
            alt="astro"
          />
          <div className="ml-3">
            <h3 className="font-semibold">{astro_Name}</h3>
            <p className="text-xs text-gray-500">
              Wait Time: {timeLeft}s
            </p>
          </div>
        </div>
      )}

      {!showwaitingpopup && showQueuePopup && (
        <div className="bg-purple-200 px-4 py-2 rounded-full w-full text-black">
          <p>Position #{queueData?.position}</p>
          <p>Wait: {timeLeft}s</p>
        </div>
      )}
    </div>
  );
};

export default ChatRequestCard;