"use client";
import { useSelector, useDispatch } from "react-redux";
import FloatingChatRequest from "./FloatingChatRequest";
import { ChatRequestCard } from "@/app/ChatComponent";
import { useEffect } from "react";
import { setActiveRequest } from "../redux/reducer/chat/sendRequestSlice";

export default function GlobalChatPopup() {
  const dispatch = useDispatch();

  const { activeRequest } = useSelector(
    (state) => state.send_request_chat
  );

  // 🔥 RESTORE AFTER REFRESH
  useEffect(() => {
    if (activeRequest) return;

    const saved = localStorage.getItem("activeChatSession");

    console.log("🔁 Restoring activeRequest:", saved);

    if (saved) {
      const parsed = JSON.parse(saved);
      dispatch(setActiveRequest(parsed));
    }
  }, []);

  // 🚨 IMPORTANT: don't block immediately
  if (!activeRequest) {
    console.log("❌ activeRequest missing, waiting...");
    return null;
  }

  console.log("✅ Rendering ChatRequestCard");

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