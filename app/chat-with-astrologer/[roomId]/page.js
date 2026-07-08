"use client";

import ChatPage from '@/app/astrologer/ChatPage';
import React, { Suspense } from 'react';



export default function page() {
  return (
    <div>
      <Suspense fallback={<div>Loading chat...</div>}>
        <ChatPage />
      </Suspense>
    </div>
  );
}
