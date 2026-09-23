import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

export const apiForm = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    "Content-Type": "multipart/form-data",
  },
  timeout: 60000, // 60 seconds timeout for file uploads
});

// Add request interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

apiForm.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Form Error:", error);
    return Promise.reject(error);
  }
);
