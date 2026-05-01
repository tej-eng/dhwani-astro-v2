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

  const timerRef = useRef(null);

  //  Prevent repeated timeout firing
  const timeoutHandledRef = useRef(false);

  // =========================================================
  //  LOCAL STORAGE FLAGS
  // =========================================================
  const isChatActive =
    typeof window !== "undefined" &&
    localStorage.getItem("activeChatRoom") === room_Id;

  const isCompleted =
    typeof window !== "undefined" &&
    localStorage.getItem(`chatCompleted_${room_Id}`) === "true";

  // =========================================================
  //  INITIAL UI STATE
  // =========================================================
  useEffect(() => {
    const activeChatRoom = localStorage.getItem("activeChatRoom");

    if (activeChatRoom || isCompleted) {
      setShowwaitingpopup(false);
    } else {
      if (!!room_Id) {
        setShowwaitingpopup(true);
      }
    }
  }, [room_Id]);

  // =========================================================
  // TIMER START (BLOCK WHEN NOT NEEDED)
  // =========================================================
  useEffect(() => {
    if (!socket) return;

    if (isChatActive || isCompleted) return;

    startTimer(60);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [room_Id, socket]);

  const startTimer = (seconds) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const expiry = Date.now() + seconds * 1000;

    localStorage.setItem(`timer_${room_Id}`, expiry); // ✅ STORE

    setTimeLeft(seconds);

    timerRef.current = setInterval(() => {
      const remaining = Math.floor(
        (expiry - Date.now()) / 1000
      );

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;

        localStorage.removeItem(`timer_${room_Id}`); // cleanup

        socket.emit("autodisconnect", {
          room_id: room_Id,
          astroid: astro_id,
        });

        setShowQueuePopup(false);
        setShowwaitingpopup(false);

        toast.success("Chat request timed out.");
        return;
      }

      setTimeLeft(remaining);
    }, 1000);
  };


  useEffect(() => {
  const expiry = localStorage.getItem(`timer_${room_Id}`);

  if (!expiry) return;

  const remaining = Math.floor(
    (expiry - Date.now()) / 1000
  );

  if (remaining > 0) {
    startTimer(remaining);
  } else {
    localStorage.removeItem(`timer_${room_Id}`);
  }
}, [room_Id]);

  // =========================================================
  //  TIMEOUT HANDLER (ONLY ONCE)
  // =========================================================
  useEffect(() => {
    if (timeLeft !== 0) return;
    if (!socket) return;

    //  BLOCK CONDITIONS
    if (timeoutHandledRef.current) return;
    if (isChatActive) return;
    if (isCompleted) return;
    if (!showwaitingpopup) return;

    timeoutHandledRef.current = true; //  VERY IMPORTANT

    // mark completed BEFORE doing anything
    localStorage.setItem(`chatCompleted_${room_Id}`, "true");

    socket.emit("autodisconnect", {
      room_id: room_Id,
      astroid: astro_id,
    });

    localStorage.removeItem(`chatJoined_${room_Id}`);
    ["chatActive", "activeChatRoom", "activeChatSession"].forEach((key) => {
      localStorage.removeItem(key);
    });

    toast.success("Chat request timed out. Please try again.");

    setTimeout(() => {
      dispatch(clearActiveRequest());
    }, 0);
  }, [timeLeft]);

  // =========================================================
  // RESET QUEUE
  // =========================================================
  useEffect(() => {
    setQueueData(null);
    setShowQueuePopup(false);
  }, [room_Id]);

  // =========================================================
  // SOCKET EVENTS
  // =========================================================
  useEffect(() => {
    if (!socket) return;

    const handleAccepted = (data) => {
      if (data.roomid !== room_Id) return;

      console.log("Chat accepted:", data);

      ["chatActive", "chat_request", "activeChatSession"].forEach((key) =>
        localStorage.removeItem(key),
      );

      localStorage.setItem("activeChatRoom", room_Id);
      localStorage.removeItem(`chatCompleted_${room_Id}`);

      setShowwaitingpopup(false);
      setShowQueuePopup(false);
      setQueueData(null);
      localStorage.removeItem("activeRequest");

      route.push(`/chat-with-astrologer/${room_Id}`);
    };

const handleQueue = (data) => {
  setQueueData(data);

  // ✅ STORE QUEUE
  localStorage.setItem(
    `queue_${room_Id}`,
    JSON.stringify(data)
  );

  if (data.position === 0) {
    localStorage.setItem("activeChatRoom", room_Id);

    setShowQueuePopup(false);
    setShowwaitingpopup(true);

    startTimer(60);
  } else {
    setShowQueuePopup(true);
    setShowwaitingpopup(false);

    startTimer(data.waitTime);
  }
};



    const handleReject = (data) => {
      if (data.roomid !== room_Id) return;

      localStorage.setItem(`chatCompleted_${room_Id}`, "true");

      ["chatActive", "activeChatRoom", "activeChatSession"].forEach((key) =>
        localStorage.removeItem(key),
      );

      setShowQueuePopup(false);
      setShowwaitingpopup(false);
      localStorage.removeItem("activeRequest");

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

  useEffect(() => {
  const savedQueue = localStorage.getItem(`queue_${room_Id}`);

  if (!savedQueue) return;

  const parsed = JSON.parse(savedQueue);

  setQueueData(parsed);

  if (parsed.position > 0) {
    setShowQueuePopup(true);
    setShowwaitingpopup(false);
  } else {
    setShowQueuePopup(false);
    setShowwaitingpopup(true);
  }
}, [room_Id]); 

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
    localStorage.removeItem(`chatJoined_${room_Id}`);
    ["chatActive", "activeChatRoom", "activeChatSession"].forEach((key) => {
      localStorage.removeItem(key);
    });

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
        <div className="bg-purple-200 px-4 py-2 rounded-full w-full text-black">
          <p className="text-sm font-medium">
            {" "}
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