"use client";

import React, { createContext, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

const SOCKET_BASE_URL = "https://dhwaniastro.com//dhwani-astro";

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  const connectSocket = () => {
    if (socket && socket.connected) {
      console.log("Socket already connected");
      return socket;
    }

    const socketInstance = io("https://dhwaniastro.com/dhwani-astro", {
      path: "/user-socket-service-v2/socket.io",
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketInstance.on("connect", () => {
      console.log(" Socket connected:", socketInstance.id);
    });

    socketInstance.on("connect_error", (err) => {
      console.error(" Socket error:", err.message);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    setSocket(socketInstance);

    return socketInstance;
  };

  return (
    <SocketContext.Provider value={{ socket, connectSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;