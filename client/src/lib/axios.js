import axios from "axios";
import useAuthStore from "@/lib/authStore";

const BASE_URL = `${import.meta.env.VITE_BASE_URL}`;

export const publicApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const privateApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

privateApi.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers["authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

privateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await publicApi.get("/auth/refresh-token");
        const { accessToken } = response.data;
        useAuthStore.getState().setToken(accessToken);
        originalRequest.headers["authorization"] = `Bearer ${accessToken}`;
        return privateApi(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
