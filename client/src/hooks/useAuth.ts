"use client";

import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { useAuthStore } from "@/store/authStore";

/**
 * Legacy useAuth hook with fallback to Zustand store.
 * This provides backward compatibility during migration from Context API to Zustand.
 */
export function useAuth() {
  const zustandStore = useAuthStore();

  try {
    const context = useContext(AuthContext);

    if (context !== undefined) {
      return context;
    }
  } catch (error) {
    console.log(error);
  }

  // Fall back to Zustand store
  return zustandStore;
}
