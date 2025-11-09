// dengan logging
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==== Interceptor Request ====
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("[API] Using accessToken:", token.slice(0, 20) + "..."); // log sebagian token
    } else {
      console.warn("[API] No accessToken found in localStorage");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==== Refresh Token Logic ====
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ==== Interceptor Response ====
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Deteksi token kadaluarsa
    if (error.response?.status === 403 && !originalRequest._retry) {
      console.warn("[API] Access token expired. Trying to refresh...");
      if (isRefreshing) {
        console.log("[API] Refresh in progress, waiting in queue...");
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            console.log("[API] Queue resumed with new token");
            originalRequest.headers.Authorization = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        console.error("[API] No refreshToken found. Redirecting to login.");
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        console.log("[API] Calling /auth/refresh-token...");
        const res = await axios.post("http://localhost:3001/api/auth/token", {
          refreshToken,
        });

        console.log("[API] Refresh success:", res.data);
        const newAccessToken = res.data.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        api.defaults.headers.common.Authorization = "Bearer " + newAccessToken;
        processQueue(null, newAccessToken);

        console.log("[API] Retrying original request with new token...");
        return api(originalRequest);
      } catch (err) {
        console.error("[API] Refresh token failed:", err);
        processQueue(err, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Jika bukan expired token
    return Promise.reject(error);
  }
);

export default api;
