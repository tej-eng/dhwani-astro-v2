"use client";

import { usePathname } from "next/navigation";

export default function LayoutContent({ children }) {

   const pathname = usePathname();

   const isChat =
      pathname.startsWith("/chat-with-astrologer");

   return (
      <>
         {!isChat && <Header />}

         <main>{children}</main>

         {!isChat && <Footer />}
      </>
   );
}