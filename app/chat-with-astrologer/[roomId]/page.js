"use client";

import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import UserChat from "@/app/ChatComponent/UserChat";

export default function ChatPage() {
  const { roomId } = useParams();

  const { activeRequest } = useSelector((state) => state.send_request_chat);

  if (!activeRequest) {
    return ;
  }

  return (
    <div className="w-full h-[calc(100vh-120px)]">
      <UserChat
        room_Id={roomId}
        astroid={activeRequest?.astrologer?.id || 1233}
        user_Id={activeRequest?.userId}
        astro_Name={activeRequest?.astrologer?.full_name}
        astro_Image={activeRequest?.astrologer?.profile_image}
        astro_price={activeRequest?.astrologer?.price}
      />
    </div>
  );
}
