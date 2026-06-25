"use client";

import Draggable from "react-draggable";
import { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";

export default function FloatingChatRequest({ children, index = 0 }) {
  const nodeRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  const { activeRequests } = useSelector(
    (state) => state.send_request_chat
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent SSR hydration mismatch
  if (!mounted) return null;

  // Don't render if there are no active requests
  if (!activeRequests?.length) return null;

  return (
    <Draggable nodeRef={nodeRef}>
      <div
        ref={nodeRef}
        style={{
          bottom: `${20 + index * 120}px`,
          right: "20px",
        }}
        className="fixed z-50 cursor-move"
      >
        <div className="bg-white shadow-xl rounded-full w-[450px]">
          {children}
        </div>
      </div>
    </Draggable>
  );
}