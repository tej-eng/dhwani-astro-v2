import { useState, useRef, useEffect, useContext } from "react";
import SocketContext from "../context/socketContext";
import toast from "react-hot-toast";
import Router, { useRouter } from "next/navigation";
import UserChat from "./UserChat";
import Image from "next/image";


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
  const route = useRouter();
  //const socket = useContext(SocketContext);
  const { socket, connectSocket } = useContext(SocketContext);
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showchat, setShowChat] = useState(false);
   const [astroConfirm, setAstroConfirm] = useState(false);
   const [queueData, setQueueData] = useState(null);
   const [showQueuePopup, setShowQueuePopup] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
  // Reset queue state when new chat starts
  setQueueData(null);
  setShowQueuePopup(false);
}, [room_Id]);
 
  useEffect(() => {
    if (!socket) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);

          socket.emit("autodisconnect", {
            room_id: room_Id,
            astroid: astro_id,
          });

          return 0; // timer hits 0
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [room_Id, astro_id, socket]);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
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
   socket.on("chatAcceptedByAstrologer", (data) => {
  if (data.roomid === room_Id) {
    setShowChat(true);
    setAstroConfirm(true);
    setIsChatStarted(true);

    //IMPORTANT RESET
    setShowQueuePopup(false);
    setQueueData(null);

    setTimeLeft(60);
  }
});

    
   
    socket.on("chat_reject_auto", (data) => {
      alert("Chat request rejected by astrologer due to timeout.", data);
      if (data.room_id === room_Id) {
        toast.error(
          "You didn’t accept the chat request in time. Please try again."
        );
        stopTimer();
        route.push("/homepage/chatAstro");
      }
    });

     socket.on("queue_position", (data) => {
       console.log("Queue Data:", data);
       setQueueData(data); // { position: 3, waitTime: 120 }
       setShowQueuePopup(true);
    });

    socket.on("chat_rejected", (data) => {
      if (data.roomid === room_Id) {
        stopTimer();

        toast.error("The astrologer has rejected your chat request.");
        setTimeout(() => {
          route.push("/homepage/chatAstro");
        }, 1000);
      }
    });

    socket.on("user_conformation_chat", (data) => {
      if (data.roomid === room_Id) {
        // console.log("Chat started received:", data);
        stopTimer();

        setTimeout(() => {
          setShowChat(true);
        }, 500);
      }
    });

    return () => {
      stopTimer();
      socket.off("chatAcceptedByAstrologer");
     // activeSocket.off("chat_rejected_astrologer");
      socket.off("chat_reject_auto");
      socket.off("chat_rejected");
      socket.off("user_conformation_chat");
    };
  }, [socket, room_Id, route]);

  

  const astrologerData = {
    name: astro_Name,
    subtitle: "Chat",
    WaitingTime: "1 min",
    message:
      "  Thank you! Kindly wait for the astrologer to accept the chat request.",
    avatar: astroimage,
  };

  return (
    <div className="flex items-center justify-center w-full px-10">
      {showchat ? (
        <UserChat
          room_Id={room_Id}
          astro_Name={astro_Name}
          astro_Image={astroimage}
          chattime={chat_time}
          user_Id={user_Id}
          astroid={astro_id}
          astro_price={experts_price}
        />
      ) : (
        <div className="h-[60vh] flex items-center justify-center">
          <div className="w-full max-w-[450px] border border-gray-200 bg-white rounded-xl shadow-lg p-6 space-y-6 transform transition-all duration-300 hover:shadow-xl">
            <div className="flex items-start space-x-4">
              <div className="relative">
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

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">
                  {astrologerData.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Type: {astrologerData.subtitle}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Wait Time: {formatTime(timeLeft)}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600">{astrologerData.message}</p>

           
          </div>
        </div>
      )}
      {showQueuePopup && queueData && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="w-full max-w-sm p-6 bg-white shadow-2xl rounded-2xl animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Queue Status
        </h2>
        <button
          onClick={() => setShowQueuePopup(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4 text-center">
        
        {/* Position */}
        <div>
          <p className="text-sm text-gray-500">Your Position</p>
          <h1 className="text-3xl font-bold text-indigo-600">
            {queueData.position}
          </h1>
        </div>

        {/* Wait Time */}
        <div>
          <p className="text-sm text-gray-500">Estimated Wait Time</p>
          <h2 className="text-xl font-semibold text-gray-700">
            {formatTime(queueData.waitTime)}
          </h2>
        </div>

        {/* Info */}
        <p className="text-sm text-gray-600">
          Please wait while we connect you to the astrologer.
        </p>

        {/* Loader */}
        <div className="flex justify-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

      </div>
    </div>
  </div>
)}
    </div>
    
    
  );
};

export default ChatRequestCard;
