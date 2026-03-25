"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useContext,
} from "react";
import SocketContext from "../context/socketContext";
import { AlertLoading } from "../common";
import Script from "next/script";
import { useDispatch } from "react-redux";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import toast from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createReviewRequest } from "../redux/reducer/auth/reviewSlice";

// ================= GRAPHQL =================

const GET_USER_BY_ID = gql`
  query GetUserById($id: String!) {
    getUserById(id: $id) {
      id
      name
      gender
      user_status
    }
  }
`;

const GET_INTAKE_BY_ID = gql`
  query GetIntakeById($id: String!) {
    getIntakeById(id: $id) {
      id
      name
      gender
      dob
      btime
      birth_place
      occupation
    }
  }
`;

// ================= COMPONENT =================

const UserChat = ({
  room_Id,
  astro_Name,
  astro_Image,
  chattime,
  user_Id,
  astroid,
  astro_price,
  userIntakeId,
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { socket, connectSocket } = useContext(SocketContext);

  const { data: userRes, loading: userLoading } = useQuery(GET_USER_BY_ID, {
    variables: { id: user_Id },
    skip: !user_Id,
  });

  const { data: intakeRes, loading: intakeLoading } = useQuery(
    GET_INTAKE_BY_ID,
    {
      variables: { id: userIntakeId },
      skip: !userIntakeId,
    }
  );

  const getintake = intakeRes?.getIntakeById;

  // ================= STATES =================

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "Astrologer",
      message:
        "Hey there! Welcome to Dhwani Astro 😊 Our consultant is checking your details...",
      time: "",
    },
  ]);

  const [typingStatus, setTypingStatus] = useState("");
  const [timeLeft, setTimeLeft] = useState((chattime || 0) * 60);
  const [showPopup, setShowPopup] = useState(false);
  const [leaveMessage, setLeaveMessage] = useState("");
  const [completedChat, setCompletedChat] = useState(false);

  const intervalRef = useRef(null);
   const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // ================= SOCKET =================

  useEffect(() => {
    let activeSocket = socket;

    if (!activeSocket || !activeSocket.connected) {
      activeSocket = connectSocket();
    }

    if (!activeSocket) return;

    activeSocket.emit("joinChat", {
      username: "customer",
      room_id: room_Id,
      joinpersonid: user_Id,
    });

    activeSocket.on("receive_message", (data) => {
      const normalizedMessage =
        typeof data.message === "object"
          ? data.message.message
          : data.message;

      const messageTime =
        typeof data.message === "object" ? data.message.time : "";

      setMessages((prev) => [
        ...prev,
        {
          sender: data.sender || "Astrologer",
          message: normalizedMessage,
          time: messageTime,
        },
      ]);
    });

    activeSocket.on("typing", (data) => {
      setTypingStatus(data.typing ? `${data.user_name} typing...` : "");
    });

    // ✅ Leave Chat
    activeSocket.on("leave_chat", (data) => {
      if (data.roomId === room_Id) {
        setLeaveMessage("Chat ended by astrologer");
        setShowPopup(true);

        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    });

    // ✅ Completed Chat
    activeSocket.on("complted_chat", (data) => {
      if (data.roomId === room_Id) {
        setLeaveMessage("Chat completed successfully");
        setCompletedChat(true);

        setTimeout(() => {
          router.push("/user/chat-history");
        }, 4000);
      }
    });

    // ✅ User Disconnected
    activeSocket.on("user_disconnected", () => {
      setLeaveMessage("User disconnected");
      setShowPopup(true);

      setTimeout(() => {
        router.push("/user/chat-history");
      }, 3000);
    });

    return () => {
      activeSocket.off("receive_message");
      activeSocket.off("typing");
      activeSocket.off("leave_chat");
      activeSocket.off("complted_chat");
      activeSocket.off("user_disconnected");
    };
  }, [socket, room_Id, user_Id]);

  // ================= TIMER =================

 useEffect(() => {
  let activeSocket = socket;

  if (!activeSocket || !activeSocket.connected) {
    activeSocket = connectSocket();
  }

  if (!activeSocket) return;

  if (intervalRef.current) return;

  intervalRef.current = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;

        activeSocket.emit("complted_chat", {
          room_id: room_Id,
          astroId: astroid,
          userId: user_Id,
        });

        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
}, [socket]);

  // ================= SEND MESSAGE =================

  const sendMessage = () => {
    let activeSocket = socket;

    if (!activeSocket || !activeSocket.connected) {
      activeSocket = connectSocket();
    }

    if (!message.trim()) return;

    const newMessage = {
      sender: "user",
      message: message.trim(),
      time: new Date().toLocaleTimeString(),
    };

    activeSocket.emit("send_message", {
      room_id: room_Id,
      message: message.trim(),
      sender: "user",
    });

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
  };

  // ================= REVIEW =================

  const handleSubmitReview = () => {
    dispatch(
      createReviewRequest({
        astro_id: parseInt(astroid),
        review_id: String(room_Id),
        star: 5,
        comment: "",
        user_name: getintake?.name || "",
        astro_name: astro_Name,
      })
    );
  };

  const isLoading = userLoading || intakeLoading;

  // ================= UI =================

  return (
    <div className="flex flex-col h-[80vh] max-w-2xl mx-auto border rounded-xl shadow-lg overflow-hidden bg-white">

      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 text-white px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image
            src={`/ds-img/${astro_Image}`}
            width={45}
            height={45}
            alt="astro"
            className="rounded-full object-cover border"
          />
          <div>
            <div className="font-semibold text-sm">{astro_Name}</div>
            <div className="text-xs text-green-300">
              {typingStatus || "Online"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm bg-black/30 px-3 py-1 rounded-full">
            ⏱ {formatTime(timeLeft)}s
          </div>

          <button
  onClick={() => {
    let activeSocket = socket;

    if (!activeSocket || !activeSocket.connected) {
      console.log("Connecting to socket...");
      activeSocket = connectSocket();
      console
    }

    if (!activeSocket) return;
    console.log("Emitting complted_chat event with room_Id:"); 
    activeSocket.emit(
      "complted_chat",
      {
        room_id: room_Id,
        astroId: astroid,
        userId: user_Id,
      },
      (response) => {
        console.log("End chat response:", response);
      }
    );
  }}
  className="bg-red-500 px-3 py-1 rounded text-sm"
>
  End
</button>
        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 bg-gray-50">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="px-4 py-2 rounded-2xl max-w-[70%] text-sm shadow bg-white">
              {msg.message}
              {msg.time && (
                <div className="text-[10px] text-gray-400 mt-1 text-right">
                  {msg.time}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="flex gap-2 p-3 border-t">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
          className="flex-1 border px-3 py-2 rounded-full"
          placeholder="Type message..."
        />
        <button
          onClick={sendMessage}
          className="bg-purple-700 text-white px-4 rounded-full"
        >
          Send
        </button>
      </div>

      {/* POPUPS */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-5 rounded">
            <h2 className="text-red-500">Chat Ended</h2>
            <p>{leaveMessage}</p>
          </div>
        </div>
      )}

      {completedChat && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-5 rounded">
            <h2 className="text-green-500">Chat Completed</h2>
            <p>Session ended successfully</p>
          </div>
        </div>
      )}

      <AlertLoading show={isLoading} title="Loading..." />
    </div>
  );
};

export default UserChat;