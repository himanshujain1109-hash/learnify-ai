import axios from "axios";

const API_URL = (
  import.meta.env.VITE_API_URL || "/api"
).replace(/\/$/, "");

const api = axios.create({
  baseURL: API_URL,
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.friendlyMessage =
        "Can't reach the Learnify AI server. Please try again.";
    } else {
      error.friendlyMessage =
        error.response.data?.message ||
        "Something went wrong. Please try again.";
    }

    return Promise.reject(error);
  }
);

export default api;
