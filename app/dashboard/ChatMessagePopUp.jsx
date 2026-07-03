"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Image from "next/image";

const GET_CHAT_MESSAGES = gql`
  query GetChatMessagesBySessionId($sessionId: String!) {
    getChatMessagesBySessionId(sessionId: $sessionId) {
      msg_id
      room_id
      sender_id
      received_id
      sender
      message
      image
      time
    }
  }
`;

export default function ChatMessagePopUp({ open, onClose, sessionId }) {
  const { data, loading, error } = useQuery(GET_CHAT_MESSAGES, {
    variables: {
      sessionId,
    },
    skip: !sessionId || !open,
    fetchPolicy: "network-only",
  });

  const messages = data?.getChatMessagesBySessionId || [];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4">
      <div className="relative flex flex-col w-full max-w-3xl overflow-hidden bg-white shadow-2xl h-[85vh] rounded-3xl">
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 text-white bg-purple-900">
          <div>
            <h2 className="text-2xl font-bold">Chat Messages</h2>

            <p className="text-sm text-gray-300">Session ID: {sessionId}</p>
          </div>

          <button onClick={onClose} className="text-2xl">
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 p-5 overflow-y-auto bg-gray-100">
          {loading && (
            <div className="flex items-center justify-center h-full">
              Loading messages...
            </div>
          )}

          {error && (
            <div className="text-center text-red-500">
              Failed to load messages
            </div>
          )}

          <div className="space-y-4 text-black">
            {messages?.map((msg) => {
              const isUser = msg?.sender === "user";

              return (
                <div
                  key={msg?.msg_id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 shadow ${
                      isUser
                        ? "bg-white text-black"
                        : "bg-purple-900 text-white"
                    }`}
                  >
                    <p
                      className={`mb-1 text-xs font-semibold ${
                        isUser ? "text-purple-900" : "text-gray-300"
                      }`}
                    >
                      {msg?.sender}
                    </p>

                    {msg?.message && (
                      <>
                        <p className="break-words">{msg.message}</p>
                        <p className="text-[11px] text-gray-500 mt-1">
                          {msg.time}
                        </p>
                      </>
                    )}

                    {/* IMAGE */}
                    {msg?.image && (
                      <Image
                        src={msg?.image}
                        width={220}
                        height={220}
                        alt="Chat Image"
                        className="object-cover mt-3 rounded-2xl"
                      />
                    )}

                    {/* TIME */}
                    {msg?.createdAt && (
                      <p
                        className={`mt-2 text-[11px] ${
                          isUser ? "text-gray-500" : "text-gray-300"
                        }`}
                      >
                        {new Date(msg?.createdAt).toLocaleDateString()} •{" "}
                        {new Date(msg?.createdAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!loading && messages?.length === 0 && (
            <div className="mt-20 text-center text-gray-500">
              No messages found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
