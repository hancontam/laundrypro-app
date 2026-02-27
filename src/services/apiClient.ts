// src/services/apiClient.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = 'https://laundrypro-api.onrender.com';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable cookie handling for React Native
  withCredentials: true,
});

// ─── Response interceptor ───────────────────────────────────────
// 401 = Unauthorized (no token / invalid token)
// 403 = Forbidden (logged in but insufficient permissions)
// 410 = Gone (token expired → refresh)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // On 410 (token expired), try to refresh
    if (error.response?.status === 410 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(`${BASE_URL}/v1/users/refresh-token`, null, {
          withCredentials: true,
        });

        // Retry original request with refreshed cookie
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
