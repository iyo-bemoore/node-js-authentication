import axios from "axios";
import { env_config } from "./constants";

const instance = axios.create({
  baseURL: env_config[process.env.NODE_ENV],
});

instance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);

export default instance;
