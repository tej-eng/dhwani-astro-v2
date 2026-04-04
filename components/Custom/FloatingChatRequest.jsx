"use client";

import Draggable from "react-draggable";
import { useRef } from "react";
import { useSelector } from "react-redux";

export default function FloatingChatRequest({ children }) {
  const nodeRef = useRef(null);

    const { activeRequest } = useSelector(
    (state) => state.send_request_chat
  );


  if (!activeRequest) return null;

  return (
    <Draggable nodeRef={nodeRef}>
      <div
        ref={nodeRef}
        className="fixed bottom-5 right-5 z-50 cursor-move"
      >
        <div className="bg-white shadow-xl rounded-full   w-[450px]">
          {children}
        </div>
      </div>
    </Draggable>
  );
}