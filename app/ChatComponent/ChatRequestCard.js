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
  const [isHydrated, setIsHydrated] = useState(false); // ✅ KEY FIX

  const timerRef = useRef(null);
  const timeoutHandledRef = useRef(false);

  // =========================================================
  // TIMER
  // =========================================================
  const startTimer = (seconds) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setTimeLeft(seconds);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;

          localStorage.removeItem("queue_state");

          socket?.emit("autodisconnect", {
            room_id: room_Id,
            astroid: astro_id,
          });

          setShowQueuePopup(false);
          setShowwaitingpopup(false);

          toast.success("Chat request timed out. Please try again.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // =========================================================
  // 🔥 RESTORE STATE (FIRST PRIORITY)
  // =========================================================
  useEffect(() => {
    const saved = localStorage.getItem("queue_state");

    if (!saved) {
      setIsHydrated(true);
      return;
    }

    const parsed = JSON.parse(saved);

    const now = Date.now();
    const remaining = Math.floor((parsed.expiresAt - now) / 1000);

    if (remaining <= 0) {
      localStorage.removeItem("queue_state");
      setIsHydrated(true);
      return;
    }

    console.log("Restoring queue state:", parsed);

    setQueueData(parsed.data);

    if (parsed.type === "waiting") {
      setShowwaitingpopup(true);
      setShowQueuePopup(false);
    } else {
      setShowQueuePopup(true);
      setShowwaitingpopup(false);
    }

    startTimer(remaining);

    setIsHydrated(true); // ✅ unlock other effects
  }, []);

  // =========================================================
  // INITIAL STATE (AFTER HYDRATION)
  // =========================================================
  useEffect(() => {
    if (!isHydrated) return;

    const activeChatRoom = localStorage.getItem("activeChatRoom");
    const isCompleted =
      localStorage.getItem(`chatCompleted_${room_Id}`) === "true";

    if (activeChatRoom || isCompleted) {
      setShowwaitingpopup(false);
    } else if (!localStorage.getItem("queue_state")) {
      if (!!room_Id) setShowwaitingpopup(true);
    }
  }, [room_Id, isHydrated]);

  // =========================================================
  // DEFAULT TIMER (ONLY IF NO SAVED STATE)
  // =========================================================
  useEffect(() => {
    if (!socket) return;
    if (!isHydrated) return;

    const saved = localStorage.getItem("queue_state");
    if (saved) return;

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

    const handleAccepted = (data) => {
      if (data.roomid !== room_Id) return;

      localStorage.setItem("activeChatRoom", room_Id);
      localStorage.removeItem(`chatCompleted_${room_Id}`);
      localStorage.removeItem("queue_state");

      setShowwaitingpopup(false);
      setShowQueuePopup(false);
      setQueueData(null);

      route.push(`/chat-with-astrologer/${room_Id}`);
    };

    const handleQueue = (data) => {
      const now = Date.now();
      let duration = data.position === 0 ? 60 : data.waitTime;

      const stateToStore = {
        data,
        type: data.position === 0 ? "waiting" : "queue",
        expiresAt: now + duration * 1000,
      };

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

    const handleReject = (data) => {
      if (data.roomid !== room_Id) return;

      localStorage.setItem(`chatCompleted_${room_Id}`, "true");
      localStorage.removeItem("queue_state");

      setShowQueuePopup(false);
      setShowwaitingpopup(false);

      if (timerRef.current) clearInterval(timerRef.current);

      toast.success("The astrologer has rejected your chat request.");

      setTimeout(() => {
        route.push("/chat-with-astrologer");
      }, 100);
    };

    socket.on("chatAcceptedByAstrologer", handleAccepted);
    socket.on("queue_position", handleQueue);
    socket.on("chat_rejected", handleReject);

    return () => {
      socket.off("chatAcceptedByAstrologer", handleAccepted);
      socket.off("queue_position", handleQueue);
      socket.off("chat_rejected", handleReject);
    };
  }, [socket, room_Id]);

  // =========================================================
  // CANCEL
  // =========================================================
  const handleRequestCancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    socket?.emit("cancel_chat_request", {
      room_id: room_Id,
      astroid: astro_id,
      user_id: user_Id,
    });

    localStorage.removeItem("queue_state");

    dispatch(clearActiveRequest());
  };

  // =========================================================
  // FORMAT TIME
  // =========================================================
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // =========================================================
  // UI
  // =========================================================
  return (
    <div className="flex items-center justify-center w-full">
      {/* WAITING */}
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
              Wait Time: {formatTime(timeLeft)}
            </p>
          </div>

          <button
            onClick={handleRequestCancel}
            className="absolute right-2 top-2 text-xs bg-red-500 text-white px-2 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* QUEUE */}
      {!showwaitingpopup && showQueuePopup && (
        <div className="bg-purple-200 px-4 py-2 rounded-full w-full text-black relative">
          <p className="text-sm font-medium">
            You are in line! ⏳ Position #{queueData?.position}
          </p>
          <p className="text-xs text-gray-600">
            Estimated wait time: {formatTime(timeLeft)}
          </p>
          <button
            onClick={handleRequestCancel}
            className="absolute right-2 top-2 text-xs bg-red-500 text-white px-2 rounded"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatRequestCard;