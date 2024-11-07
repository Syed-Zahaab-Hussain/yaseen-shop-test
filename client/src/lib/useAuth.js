import useAuthStore from "@/lib/authStore";

const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const isDrawerOpen = useAuthStore((state) => state.isDrawerOpen);
  const setUser = useAuthStore((state) => state.setUser);
  const clearState = useAuthStore((state) => state.logout);
  const setIsDrawerOpen = useAuthStore((state) => state.setIsDrawerOpen);

  return {
    user,
    clearState,
    setUser,
    isDrawerOpen,
    setIsDrawerOpen,
  };
};

export default useAuth;
