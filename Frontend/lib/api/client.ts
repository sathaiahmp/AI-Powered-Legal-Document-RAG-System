import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiForm = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});
