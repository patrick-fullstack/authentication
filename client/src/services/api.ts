import axios from "axios";
// import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://authentication-server-opal.vercel.app";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// api.interceptors.request.use((config) => {
//   const token = Cookies.get("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default api;
