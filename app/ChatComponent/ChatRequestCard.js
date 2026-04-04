import { useState, useRef, useEffect, useContext } from "react";
import SocketContext from "../context/socketContext";
import toast from "react-hot-toast";
import Router, { useRouter } from "next/navigation";
import UserChat from "./UserChat";
import Image from "next/image";
import { clearActiveRequest } from "../redux/reducer/chat/sendRequestSlice";
import { useDispatch } from "react-redux";

// testing
const ChatRequestCard = ({
  room_Id,
  astro_Name,
  user_Id,
  astroimage,
  astro_id,
  chat_time,
  experts_price,
}) => {
  const dispatch = useDispatch();
  const route = useRouter();
  //const socket = useContext(SocketContext);
  const { socket, connectSocket } = useContext(SocketContext);
  // const [isChatStarted, setIsChatStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showchat, setShowChat] = useState(false);
  // const [astroConfirm, setAstroConfirm] = useState(false);
  const [queueData, setQueueData] = useState(null);
  const [showQueuePopup, setShowQueuePopup] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Reset queue state when new chat starts
    setQueueData(null);
    setShowQueuePopup(false);
  }, [room_Id]);

  useEffect(() => {
    if (!socket || timerRef.current) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;

          socket.emit("autodisconnect", {
            room_id: room_Id,
            astroid: astro_id,
          });

          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [room_Id, astro_id, socket]);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleRequestCancel = () => {
    socket?.emit("cancel_chat_request", {
      room_id: room_Id,
      astroid: astro_id,
      user_id: user_Id,
    });
    dispatch(clearActiveRequest());
    console.log("yyyyyyyyyyyyyyyyyy", showchat);
  };

  const handleQueueCancel = () => {
    socket?.emit("cancel_chat_request", {
      room_id: room_Id,
      astroid: astro_id,
      user_id: user_Id,
    });
    dispatch(clearActiveRequest());
    console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };
  useEffect(() => {
    if (!queueData) return;

    const interval = setInterval(() => {
      setQueueData((prev) => ({
        ...prev,
        waitTime: prev.waitTime > 0 ? prev.waitTime - 1 : 0,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [queueData]);

  useEffect(() => {
    if (!socket) return;

    const handleAccepted = (data) => {
      if (data.roomid === room_Id) {
        setShowChat(false);
        setShowQueuePopup(false);
        setQueueData(null);
        setTimeLeft(60);

        route.push(`/chat-with-astrologer/${room_Id}`);

        setTimeout(() => {
          dispatch(clearActiveRequest());
        }, 1000);
      }
    };

    const handleQueue = (data) => {
      setQueueData(data);
      setShowQueuePopup(true);
    };

    const handleReject = (data) => {
      if (data.roomid === room_Id) {
        stopTimer();
        toast.error("The astrologer has rejected your chat request.");
        setTimeout(() => {
          route.push("/homepage/chatAstro");
        }, 1000);
      }
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

  const astrologerData = {
    name: astro_Name,
    subtitle: "Chat",
    WaitingTime: "1 min",
    message:
      "  Thank you! Kindly wait for the astrologer to accept the chat request.",
    avatar: astroimage,
  };

  return (
    <div className="flex items-center justify-center rounded-full   w-full ">
      {!queueData ? (
        <div className="h-full flex items-center  rounded-full justify-center">
          <div className="w-full rounded-full    gap-3 bg-purple-200 relative px-3 py-2 flex duration-300 ">
            <div className="flex items-start space-x-4">
              <div className="relative flex">
                {astrologerData.avatar ? (
                  <Image
                    src={`/ds-img/${astroimage}`}
                    alt={astrologerData?.name || "Astrologer Image"}
                    width={64}
                    height={64}
                    className="object-cover rounded-full"
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full">
                    <svg width={18} height={18} viewBox="0 0 640 640">
                      <path d="M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z" />
                    </svg>
                  </div>
                )}
                <div className="absolute w-4 h-4 bg-green-500 border-2 border-white rounded-full -bottom-1 -right-1"></div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-gray-800">
                  {astrologerData.name}
                </h3>
                <div className="flex gap-3">
                  <p className="text-sm flex  text-gray-500">
                    Type: {astrologerData.subtitle}
                  </p>
                  <p className="mt-1 text-xs flex  text-gray-400">
                    Wait Time: {formatTime(timeLeft)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{astrologerData.message}</p>
            </div>

            <button
              onClick={handleRequestCancel}
              className=" absolute top-0 right-2 z-9999999 bg-gray-600 text-white shadow-lg rounded-full h-5 w-5 text-xs  hover:scale-102 hover:bg-red-400 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full">
          <div className="w-full relative  px-5 py-2  bg-purple-200 shadow-xl rounded-full  animate-fadeIn">
            <div className="flex items-center justify-between px-5">
              <h2 className="text-md font-semibold text-gray-800">
                Queue Status
              </h2>
            </div>

            <div className="flex flex-col gap-1 text-center">
              <div className="flex px-5 justify-between items-center">
                <div className="flex gap-3 items-center">
                  <p className="text-xs font-semibold text-gray-500">
                    Your Position
                  </p>
                  <h1 className="text-md font-bold text-indigo-600">
                    {queueData.position}
                  </h1>
                </div>
                <div className="flex gap-3 items-center">
                  <p className="text-xs font-semibold  text-gray-500">
                    Estimated Wait Time
                  </p>
                  <h2 className="text-xs  text-gray-700">
                    {formatTime(queueData.waitTime)}
                  </h2>
                </div>
              </div>
              <div className="flex items-center  justify-around">
                <p className="text-xs text-gray-600">
                  Please wait while we connect you to the{" "}
                  {astrologerData.astro_Name}.
                </p>

                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>

            <button
              onClick={handleQueueCancel}
              className=" absolute top-0 right-2 z-9999999 bg-gray-600 text-white shadow-lg rounded-full h-5 w-5 text-xs  hover:scale-102 hover:bg-red-400 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRequestCard;
