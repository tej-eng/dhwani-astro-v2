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
  const timerRef = useRef(null);
  let activeSocket = socket;

    if (!activeSocket || !activeSocket.connected) {
      activeSocket = connectSocket();
    }
  useEffect(() => {
    if (!activeSocket) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);

          activeSocket.emit("autodisconnect", {
            room_id: room_Id,
            astroid: astro_id,
          });

          return 0; // timer hits 0
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [room_Id, astro_id, activeSocket]);

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
    if (!activeSocket) return;
    socket.on("chatAcceptedByAstrologer", (data) => {
      console.log("Chat started event received:1111111111111111111111111111111111111111111", data);
      if (data.roomid === room_Id) {
        setShowChat(true);
        setAstroConfirm(true);
        setIsChatStarted(true);
        setTimeLeft(60);
      }
    });
    // if(astroConfirm){
    //    activeSocket.emit("chat_accepted_user", { room_id: room_Id }, (response) => {
    //     console.log("Chat accepted response:-------------", response);
    // });
    // }
    // activeSocket.on("chat_rejected_astrologer", (data) => {
    //   stopTimer();
    //   if (data.roomid === room_Id) {
    //     toast.error("Your chat request rejected");
    //     setTimeout(() => {
    //       route.push("/homepage/chatAstro");
    //     }, 1000);
    //   }
    // });
    activeSocket.on("chat_reject_auto", (data) => {
      alert("Chat request rejected by astrologer due to timeout.", data);
      if (data.room_id === room_Id) {
        toast.error(
          "You didn’t accept the chat request in time. Please try again."
        );
        stopTimer();
        route.push("/homepage/chatAstro");
      }
    });

    activeSocket.on("chat_rejected", (data) => {
      if (data.roomid === room_Id) {
        stopTimer();

        toast.error("The astrologer has rejected your chat request.");
        setTimeout(() => {
          route.push("/homepage/chatAstro");
        }, 1000);
      }
    });

    activeSocket.on("user_conformation_chat", (data) => {
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
      activeSocket.off("chatAcceptedByAstrologer");
     // activeSocket.off("chat_rejected_astrologer");
      activeSocket.off("chat_reject_auto");
      activeSocket.off("chat_rejected");
      activeSocket.off("user_conformation_chat");
    };
  }, [activeSocket, room_Id, route]);

  // const handleAccept = () => {
  //   activeSocket.emit("chat_accepted_user", { room_id: room_Id }, (response) => {
  //     // console.log("Chat accepted response:", response);
  //   });
  // };

  // const handleReject = () => {
  //   activeSocket.emit(
  //     "chat_rejected_user",
  //     { room_id: room_Id, astroid: astro_id },
  //     (res) => console.log("Rejected response:", res)
  //   );
  // };

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
    </div>
  );
};

export default ChatRequestCard;
