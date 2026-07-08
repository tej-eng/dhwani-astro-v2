"use client";

import { usePathname } from "next/navigation";
import Footerlinks from "@/components/Footerlinks";
import CookieConsent from "@/components/cookieConsent";
import { ChatToast } from "./common";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  const isChatPage = pathname.startsWith("/chat-with-astrologer");

  return (
    <>
      <main
        className={
          isChatPage
            ? "w-screen h-screen"
            : "flex justify-center w-full pt-12 lg:pt-37 md:pt-37"
        }
      >
        {children}
        <div id="modal-root" />
        <ChatToast />
      </main>

      {!isChatPage && (
        <>
          <CookieConsent />
          <Footerlinks />
        </>
      )}
    </>
  );
}