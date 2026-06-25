"use client";

import { useSelector } from "react-redux";
import FloatingChatRequest from "./FloatingChatRequest";
import { ChatRequestCard } from "@/app/ChatComponent";

export default function GlobalChatPopup() {
  const { activeRequests } = useSelector(
    (state) => state.send_request_chat
  );

  if (!activeRequests?.length) return null;

  return (
    <>
      {activeRequests.map((request, index) => (
        <FloatingChatRequest
          key={request.roomId}
          index={index}
        >
          <ChatRequestCard
            room_Id={request.roomId}
            astro_Name={request.astrologer?.name || ""}
            astroimage={request.astrologer?.profilePic || ""}
            astro_id={request.astrologer?.id || ""}
            chat_time={request.chatTime}
            user_Id={request.userId}
            experts_price={request.astrologer?.price || 0}
            type={request.type}
          />
        </FloatingChatRequest>
      ))}
    </>
  );
}