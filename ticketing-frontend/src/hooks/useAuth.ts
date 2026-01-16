import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  hasRole: (roles: string[]) => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: localStorage.getItem("token"),
      user: null,
      isAuthenticated: !!localStorage.getItem("token"),

      setAuth: (token: string, user: User) => {
        localStorage.setItem("token", token);
        localStorage.setItem("userRole", user.role);
        set({ token, user, isAuthenticated: true });
      },

      clearAuth: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        set({ token: null, user: null, isAuthenticated: false });
      },

      hasRole: (roles: string[]) => {
        const state = get();
        const userRole = state.user?.role || localStorage.getItem("userRole");
        if (!userRole) return false;
        return roles.some(
          (role) => role.toLowerCase() === userRole.toLowerCase(),
        );
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
