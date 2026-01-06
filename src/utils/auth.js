import axios from "axios";

const backendApi = import.meta.env.VITE_BACKEND_API || 'http://localhost:8000';

export const Auth = {
  isLoggedIn: () => localStorage.getItem("isLoggedIn") === "true",
  getToken: () => localStorage.getItem("access_token"),
  getRefreshToken: () => localStorage.getItem("refresh_token"),
  getUserId: () => localStorage.getItem("user_id"),
  getEmail: () => localStorage.getItem("email"),
  
  refreshToken: async () => {
    try {
      const refreshToken = Auth.getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }
      const response = await axios.post(
  `${backendApi}/auth/refresh`,
  {
    refresh_token: refreshToken,
  },
  {
    headers: {
      "Content-Type": "application/json",
    },
  }
);

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      const { access_token, refresh_token, token_type } = data;

      localStorage.setItem("access_token", access_token);
      if (refresh_token) {
        localStorage.setItem("refresh_token", refresh_token);
      }

      return access_token;
    } catch (error) {
      console.error("Token refresh error:", error);
      Auth.logout();
      throw error;
    }
  },
  logout: () => {
    localStorage.clear();
    window.location.href = "/login";
  },
};

export const setupAxiosInterceptors = (axiosInstance) => {
  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  axiosInstance.interceptors.request.use(
    (config) => {
      const token = Auth.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await Auth.refreshToken();
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};