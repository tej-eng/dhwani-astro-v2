"use client";

import MessageBubble from "./MessageBubble";
import OptionsButtons from "./OptionsButtons";
import { useState, useEffect, useRef } from "react";
import { useChatFlow } from "@/Hooks/useChatFlow";
import { useAIStore } from "@/src/store/aiStore";

export default function ChatWindow() {
    const {
        isOpen,
        messages,
        toggleChat,
        initialized,
        setInitialized,
    } = useAIStore();
    const { startChat, handleUserInput } = useChatFlow();
    const [input, setInput] = useState("");
    const bottomRef = useRef(null);

    useEffect(() => {
        if (isOpen && !initialized) {
            startChat();
            setInitialized(true);
        }
    }, [isOpen, initialized]);

    useEffect(() => {
        if (!isOpen) {
            setInitialized(false);
        }
    }, [isOpen]);

    // ✅ Auto scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add("modal-open");
        } else {
            document.body.classList.remove("modal-open");
        }

        return () => {
            document.body.classList.remove("modal-open");
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* 🔥 BACKDROP */}
            <div
                onClick={toggleChat}
                className="fixed inset-0 text-black bg-black/50 backdrop-blur-sm z-40"
            />

            {/* 💬 CHAT BOX */}
            <div className="fixed bottom-2 text-[13px] text-black right-5 w-95 h-138 bg-white shadow-2xl overflow-hidden rounded-2xl flex flex-col z-50">

                {/* Header */}
                <div className="p-3 border-b font-semibold text-white flex bg-linear-to-r from-purple-900 via-purple-800 to-purple-900 justify-between items-center">
                    <span >Dhwani AI</span>
                    <button
  onClick={() => {
    useAIStore.getState().clearMessages();
    startChat();
  }}
  className="text-xs text-red-500"
>
  Restart Chat
</button>
                    <button onClick={toggleChat}>✖</button>
                </div>

                {/* Messages */}
                <div
                    className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-2"
                    onWheel={(e) => e.stopPropagation()}
                >
                    {messages.map((msg, i) =>
                        msg.type === "options" ? (
                            <OptionsButtons key={i} options={msg.options} handleUserInput={handleUserInput} />
                        ) : (
                            <MessageBubble key={i} msg={msg} handleUserInput={handleUserInput}  />
                        )
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="p-2 flex items-center ">
                    <input
                        className="flex-1 border border-gray-300 px-2 py-2 text-[13px] rounded-full outline-none"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type here..."
                    />
                    <button
                        onClick={() => {
                            if (!input.trim()) return;
                            handleUserInput(input);
                            setInput("");
                        }}
                        className="ml-2 bg-purple-600 hover:bg-purple-700 text-white px-3 text-sm py-2 rounded-full"
                    >
                        Send
                    </button>
                </div>
            </div>
        </>
    );
}