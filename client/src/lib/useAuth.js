import useAuthStore from "@/lib/authStore";

const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isDrawerOpen = useAuthStore((state) => state.isDrawerOpen);
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const clearState = useAuthStore((state) => state.logout);
  const setIsDrawerOpen = useAuthStore((state) => state.setIsDrawerOpen);

  return {
    user,
    clearState,
    setUser,
    setToken,
    token,
    isDrawerOpen,
    setIsDrawerOpen,
  };
};

export default useAuth;
