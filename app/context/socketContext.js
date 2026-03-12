"use client";

import React, { createContext, useState, useEffect } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

const SOCKET_URL = "https://chatmicroservice.onrender.com";
// const SOCKET_URL = "http://localhost:8001";

export const SocketProvider = ({ children }) => {

  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const socketInstance = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true   
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
      setLoading(false);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
      setLoading(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };

  }, []);

  return (
    <SocketContext.Provider value={{ socket, loading }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;