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

// Give every caller a consistent, human-readable message. In particular,
// requests that never reach the server (wrong VITE_API_URL, backend asleep
// on Render's free tier, CORS rejection) resolve to err.response === undefined
// — without this, the UI shows the generic fallback text with no indication
// that it's a connectivity problem rather than an invalid form submission.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.friendlyMessage =
        "Can't reach the Learnify AI server. It may be waking up (free hosting can take ~30s) — please try again in a moment.";
    } else {
      error.friendlyMessage = error.response.data?.message || "Something went wrong. Please try again.";
    }
    return Promise.reject(error);
  }
);

export default api;
