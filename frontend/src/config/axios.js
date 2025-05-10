import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:5000", // fallback for local
  withCredentials: true,  // to allow cookies if you are using JWT authentication
});

export default API;
