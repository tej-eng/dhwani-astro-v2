"use client";
import { useSelector } from "react-redux";
import FloatingChatRequest from "./FloatingChatRequest";
import { ChatRequestCard } from "@/app/ChatComponent";

export default function GlobalChatPopup() {
  const { activeRequest } = useSelector(
    (state) => state.send_request_chat
  );

  //  single source of truth
  if (!activeRequest) return null;

  return (
    <FloatingChatRequest>
      <ChatRequestCard
        room_Id={activeRequest.roomId}
        astro_Name={activeRequest.astrologer?.full_name || ""}
        astroimage={activeRequest.astrologer?.profile_image || ""}
        astro_id={activeRequest.astrologer?.id || ""}
        chat_time={activeRequest.chatTime}
        user_Id={activeRequest.userId}
        experts_price={activeRequest.astrologer?.price || 0}
      />
    </FloatingChatRequest>
  );
}