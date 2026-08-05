"use client";

import Draggable from "react-draggable";
import { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";

export default function FloatingChatRequest({ children, index = 0 }) {
  const nodeRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [bounds, setBounds] = useState();

  const LIMIT = 40;

  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleDrag = (e, data) => {
    const rect = nodeRef.current.getBoundingClientRect();

    let x = data.x;
    let y = data.y;

    if (rect.left < -LIMIT) {
      x += -LIMIT - rect.left;
    }

    if (rect.right > window.innerWidth + LIMIT) {
      x -= rect.right - (window.innerWidth + LIMIT);
    }

    if (rect.top < -LIMIT) {
      y += -LIMIT - rect.top;
    }

    if (rect.bottom > window.innerHeight + LIMIT) {
      y -= rect.bottom - (window.innerHeight + LIMIT);
    }

    setPosition({ x, y });
  };
  const { activeRequests } = useSelector((state) => state.send_request_chat);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!activeRequests?.length) return null;

  return (
    <Draggable nodeRef={nodeRef} position={position} onDrag={handleDrag}>
      <div
        ref={nodeRef}
        style={{
          bottom: `${20 + index * 120}px`,
          right: "20px",
        }}
        className="fixed z-50 cursor-move"
      >
        <div className="bg-white shadow-xl rounded-full w-70 sm:w-110">
          {children}
        </div>
      </div>
    </Draggable>
  );
}
