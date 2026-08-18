import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.warn(
    "VITE_API_URL is not configured. Add it in Vercel Environment Variables."
  );
}

const api = axios.create({
  baseURL: API_URL || "http://localhost:5000",
  timeout: 60000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("learnify_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
