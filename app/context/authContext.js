"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();


export function AuthProvider({ children }) {
const [user, setUser] = useState(null);
  
 const [isLoggedIn, setIsLoggedIn] = useState(false);
 
  const [showLogin, setShowLogin] = useState(false);
  const [pendingRoute, setPendingRoute] = useState(null);

useEffect(() => {
  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    setUser(JSON.parse(storedUser));
    setIsLoggedIn(true);
  } else {
    setIsLoggedIn(false);
  }

}, []);

  const value = {
    user,
    setUser,
    isLoggedIn,
    setIsLoggedIn,
    showLogin,
    setShowLogin,
    pendingRoute,
    setPendingRoute,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}