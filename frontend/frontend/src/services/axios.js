import axios from "axios";
import { Toast } from "antd-mobile";

// ===== Helper functions for token handling =====
const getToken = () => localStorage.getItem("authToken");
const setToken = (token) => localStorage.setItem("authToken", token);

// ===== Determine correct API base URL =====
let API_URL;
const hostname = window.location.hostname;

if (hostname === "localhost") {
  // 🧑‍💻 Local development
  API_URL = process.env.REACT_APP_API_URL_LOCAL || "http://localhost:5000/api";
} else if (hostname.startsWith("192.")) {
  // 📶 LAN / same Wi-Fi testing
  API_URL = process.env.REACT_APP_API_URL_LAN || `http://${hostname}:5000/api`;
} else {
  // 🌍 Production (Vercel or custom domain)
  API_URL =
    process.env.REACT_APP_API_URL ||
    "https://playstore-application-xxq1.vercel.app/api";
}

// Log which API is being used (for debugging)
console.log("✅ Using API Base URL:", API_URL);

// ===== Create Axios instance =====
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000, // ⏱ 15 seconds
});

// ===== Request Interceptor =====
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== Response Interceptor =====
api.interceptors.response.use(
  (response) => {
    if (response.data?.accessToken) setToken(response.data.accessToken);
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const msg = error.response.data?.message || "Something went wrong!";

      switch (status) {
        case 401:
          Toast.show({
            content: "Unauthorized! Please login again.",
            icon: "fail",
          });
          break;
        case 403:
          Toast.show({ content: "Forbidden! Access denied.", icon: "fail" });
          break;
        case 404:
          Toast.show({ content: "API endpoint not found!", icon: "fail" });
          break;
        case 500:
        default:
          Toast.show({ content: "Server error! Try again later.", icon: "fail" });
      }
    } else if (error.request) {
      Toast.show({
        content: "No response from server. Check your connection!",
        icon: "fail",
      });
    } else {
      Toast.show({ content: error.message, icon: "fail" });
    }

    return Promise.reject(error);
  }
);

export default api;
