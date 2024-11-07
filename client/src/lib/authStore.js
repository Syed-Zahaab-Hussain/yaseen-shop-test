import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isDrawerOpen: false,
      setUser: (user) => set({ user }),
      setIsDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),
      logout: () => set({ user: null, isDrawerOpen: false }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }), // Only persist the user state
    }
  )
);

export default useAuthStore;
