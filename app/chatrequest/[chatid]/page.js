"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import SocketContext from "../context/socketContext";
import toast from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";

const UserChat = ({
  room_Id,
  astro_Name,
  astro_Image,
  chatTime,
  user_Id,
  astroid,
}) => {
  const router = useRouter();
  const { socket } = useContext(SocketContext);

  /* ================= STATE ================= */

  const [messages, setMessages] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [message, setMessage] = useState("");
  const [typingStatus, setTypingStatus] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [hoveredMsgIndex, setHoveredMsgIndex] = useState(null);

  /* ================= INIT MESSAGE (ONLY ONCE) ================= */

  useEffect(() => {
    if (!initialized) {
      setMessages([
        {
          msg_id: "welcome-msg",
          sender: "Astrologer",
          message:
            "Hey there! Welcome to Dhwani Astro 😊 Our consultant is checking your details...",
          time: new Date().toISOString(),
        },
      ]);
      setInitialized(true);
    }
  }, [initialized]);

  /* ================= SOCKET ================= */

  useEffect(() => {
    if (!socket) return;

    socket.emit("joinChat", {
      username: "customer",
      room_id: room_Id,
      joinpersonid: user_Id,
    });

    const receiveHandler = (data) => {
      const normalizedMessage =
        typeof data.message === "object"
          ? data.message.text
          : data.message;

      const messageTime =
        typeof data.message === "object"
          ? data.message.time
          : data.time;

      const newMsg = {
        msg_id: data.msg_id,
        sender: data.sender,
        message: normalizedMessage,
        time: messageTime,
        replyTo: data.replyTo || null,
      };

      setMessages((prev) => {
        const exists = prev.some((m) => m.msg_id === newMsg.msg_id);
        if (exists) return prev;
        return [...prev, newMsg];
      });
    };

    const typingHandler = (data) => {
      setTypingStatus(data.typing ? `${data.user_name} typing...` : "");
    };

    /* CLEAN OLD LISTENERS */
    socket.off("receive_message");
    socket.off("typing");

    socket.on("receive_message", receiveHandler);
    socket.on("typing", typingHandler);

    return () => {
      socket.off("receive_message", receiveHandler);
      socket.off("typing", typingHandler);
    };
  }, [socket, room_Id, user_Id]);

  /* ================= SEND MESSAGE ================= */

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      msg_id: crypto.randomUUID(),
      sender_id: user_Id,
      received_id: astroid,
      sender: "user",
      message: message.trim(),
      replyTo: replyTo
        ? {
            msg_id: replyTo.msg_id,
            sender: replyTo.sender,
            message: replyTo.message,
          }
        : null,
      time: new Date().toISOString(),
    };

    socket.emit("send_message", {
      ...newMessage,
      room_id: room_Id,
    });

    /* ADD LOCALLY (WITHOUT DUPLICATE) */
    setMessages((prev) => {
      const exists = prev.some((m) => m.msg_id === newMessage.msg_id);
      if (exists) return prev;
      return [...prev, newMessage];
    });

    setMessage("");
    setReplyTo(null);
  };

  /* ================= UI ================= */

  return (
    <div className="flex flex-col h-[80vh] max-w-2xl mx-auto border rounded-xl shadow-lg overflow-hidden bg-white">

      {/* HEADER */}
      <div className="bg-purple-800 text-white px-4 py-3 flex justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={`/ds-img/${astro_Image}`}
            width={40}
            height={40}
            alt="astro"
            className="rounded-full"
          />
          <div>
            <div className="text-sm font-semibold">{astro_Name}</div>
            <div className="text-xs text-green-300">
              {typingStatus || "Online"}
            </div>
          </div>
        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {messages.map((msg, i) => (
          <div
            key={msg.msg_id || i}
            onMouseEnter={() => setHoveredMsgIndex(i)}
            onMouseLeave={() => setHoveredMsgIndex(null)}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="relative px-4 py-2 rounded-2xl max-w-[70%] text-sm shadow bg-white">

              {/* REPLY PREVIEW */}
              {msg.replyTo && (
                <div className="text-xs bg-gray-100 p-2 mb-1 rounded border-l-4 border-blue-400">
                  <b>{msg.replyTo.sender}:</b>{" "}
                  {msg.replyTo.message?.slice(0, 30)}
                </div>
              )}

              {msg.message}

              {/* REPLY BUTTON (ONLY FOR ASTRO MESSAGES) */}
              {hoveredMsgIndex === i && msg.sender !== "user" && (
                <button
                  onClick={() =>
                    setReplyTo({
                      msg_id: msg.msg_id,
                      sender: msg.sender,
                      message: msg.message,
                    })
                  }
                  className="absolute -left-8 top-1 text-blue-500 text-xs"
                >
                  ↩
                </button>
              )}

              {msg.time && (
                <div className="text-[10px] text-gray-400 mt-1 text-right">
                  {new Date(msg.time).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* REPLY BAR */}
      {replyTo && (
        <div className="px-3 py-2 bg-blue-100 flex justify-between">
          <span>
            Reply to <b>{replyTo.sender}</b>:{" "}
            {replyTo.message.slice(0, 30)}
          </span>
          <button onClick={() => setReplyTo(null)}>✖</button>
        </div>
      )}

      {/* INPUT */}
      <div className="flex gap-2 p-3 border-t">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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
    </div>
  );
};

export default UserChat;