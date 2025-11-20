// src/api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const uploadLog = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(`${BASE_URL}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const fetchHistory = async () => {
  const res = await axios.get(`${BASE_URL}/history`);
  return res.data;
};

export const fetchLog = async (id) => {
  const res = await axios.get(`${BASE_URL}/log/${id}`);
  return res.data;
};
