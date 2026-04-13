"use client";

import { useAIStore } from "@/src/store/aiStore";

export default function ChatButton() {
  const { toggleChat } = useAIStore();

  return (
    <div className="fixed bottom-2 right-5 z-50">
      {/* 🔥 Glow Ring */}
      <div className="relative p-0.5 rounded-full gradient-button">
        
        {/* 💬 Button */}
        <button
          onClick={toggleChat}
          className="bg-purple-600 gradient-text text-white px-5 py-3 rounded-full shadow-lg relative z-10"
        >
          ✨ Dhwani AI
        </button>
      </div>
    </div>
  );
}