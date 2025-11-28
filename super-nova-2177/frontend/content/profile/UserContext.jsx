"use client";
import { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

function calculateInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return parts.map(part => part[0].toUpperCase()).join("");
  } else if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return "";
}

export function UserProvider({ children }) {
  const [userData, setUserData] = useState({
    species: "",
    avatar: "",
    name: "",
    initials: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile);
        setUserData((prev) => ({
          ...prev,
          ...parsedProfile,
        }));
      } catch (err) {
        console.error("Failed to parse stored profile", err);
      }
    }
  }, []);

  useEffect(() => {
    setUserData((prev) => {
      const initials = calculateInitials(prev.name || "");
      if (prev.initials === initials) return prev;
      return {
        ...prev,
        initials,
      };
    });
  }, [userData.name]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const { species, avatar, name, activeBackend } = userData;

    if (!species && !avatar && !name && !activeBackend) return;

    localStorage.setItem(
      "userProfile",
      JSON.stringify({ species, avatar, name, activeBackend })
    );
  }, [userData.species, userData.avatar, userData.name, userData.activeBackend]);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}