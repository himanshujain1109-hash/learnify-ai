import axios from "axios";

const api = axios.create({
  baseURL: "",
  timeout: 120000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("learnify_token");

    if (token) {
      config.headers = config.headers || {};
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
        "Unable to connect to Learnify AI server. Please check your internet connection or try again.";
    } else {
      error.friendlyMessage =
        error.response.data?.message ||
        "Something went wrong. Please try again.";
    }

    return Promise.reject(error);
  }
);

export default api;
