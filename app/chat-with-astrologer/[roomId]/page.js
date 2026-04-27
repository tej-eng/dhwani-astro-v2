"use client";

import { useParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import UserChat from "@/app/ChatComponent/UserChat";
import { setActiveRequest } from "@/app/redux/reducer/chat/sendRequestSlice"; 

export default function ChatPage() {
  const { roomId } = useParams();
  const dispatch = useDispatch();

  const { activeRequest } = useSelector((state) => state.send_request_chat);

  const [restored, setRestored] = useState(false);

  useEffect(() => {
    if (activeRequest) {
      setRestored(true);
      return;
    }
    const saved = localStorage.getItem("activeChatSession");

    if (saved) {
      const parsed = JSON.parse(saved);

      //  rebuild activeRequest structure
      dispatch(
        setActiveRequest({
          room_Id: parsed.room_Id,
          userId: parsed.user_Id,
          astrologer: {
            id: parsed.astroid,
            full_name: parsed.astro_Name,
            profile_image: parsed.astro_Image,
            price: parsed.astro_price,
          },
        })
      );
    }

    setRestored(true);
  }, [activeRequest, dispatch]);

  //  prevent blank render during restore
  if (!activeRequest && !restored) {
    return <div className="text-center mt-10">Restoring chat...</div>;
  }

  if (!activeRequest) {
    return null;
  }

  return (
    <div className="w-full h-[calc(100vh-120px)]">
      <UserChat
        room_Id={roomId}
        astroid={activeRequest?.astrologer?.id}
        user_Id={activeRequest?.userId}
        astro_Name={activeRequest?.astrologer?.name}
        astro_Image={activeRequest?.astrologer?.profilePic}
        astro_price={activeRequest?.astrologer?.price}
        chattime={activeRequest?.chatTime}
      />
    </div>
  );
}