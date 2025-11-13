import axios from "axios";

// ==== Tambah type custom biar skipAuthRefresh bisa diterima oleh Axios ====
declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
    _retry?: boolean;
  }
}

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
      console.log("[API] Using accessToken:", token.slice(0, 20) + "...");
    } else {
      console.warn("[API] No accessToken found in localStorage");
    }

    // Logging endpoint dan method
    console.log(`[API] Request → ${config.method?.toUpperCase()} ${config.url}`);
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
  (response) => {
    console.log(
      `[API] Response ← ${response.config.method?.toUpperCase()} ${
        response.config.url
      } (${response.status})`
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 🚫 Abaikan interceptor kalau flag skipAuthRefresh aktif
    if (originalRequest?.skipAuthRefresh) {
      return Promise.reject(error);
    }

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
        console.log("[API] Calling /auth/token to refresh...");
        // ✅ pakai api.post agar consistent dan tetap kena baseURL
        const res = await api.post(
          "/auth/token",
          { refreshToken },
          { skipAuthRefresh: true } // biar gak masuk interceptor lagi
        );

        const newAccessToken = res.data?.data?.accessToken;
        console.log("[API] Refresh success:", newAccessToken?.slice(0, 20) + "...");
        localStorage.setItem("accessToken", newAccessToken);

        api.defaults.headers.common.Authorization = "Bearer " + newAccessToken;
        processQueue(null, newAccessToken);

        console.log("[API] Retrying original request with new token...");
        originalRequest.headers.Authorization = "Bearer " + newAccessToken;
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
