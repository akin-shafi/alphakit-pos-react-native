// src/services/AuthService.ts (or wherever your service is)

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL, { API_ENDPOINTS } from "../config/api";
import type { User, Business, Tenant, RegisterBusinessPayload, RegisterBusinessResponse } from "../types";

export interface LoginResponse {
  user: User;
  tenant: Tenant;
  business: Business;
  accessToken: string;
  refreshToken: string;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Axios interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const res = await axios.post(
            `${API_BASE_URL}${API_ENDPOINTS.auth.refresh}`,
            { refreshToken }
          );

          const { accessToken } = res.data;
          await AsyncStorage.setItem("accessToken", accessToken);
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

          return api(originalRequest);
        } catch (refreshErr) {
          await AsyncStorage.removeItem("accessToken");
          await AsyncStorage.removeItem("refreshToken");
          throw refreshErr;
        }
      }
    }

    const message =
      error.response?.data?.message || error.message || "Unknown API error";
    return Promise.reject(new Error(message));
  }
);

export const AuthService = {
  login: async (identifier: string, pin: string): Promise<LoginResponse> => {
    const res = await api.post(API_ENDPOINTS.auth.login, { identifier, pin });

    await AsyncStorage.setItem("accessToken", res.data.accessToken);
    await AsyncStorage.setItem("refreshToken", res.data.refreshToken);

    return res.data;
  },

  logout: async (): Promise<void> => {
    await api.post(API_ENDPOINTS.auth.logout);
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
  },

  // registerBusiness: async (payload: Partial<Business>): Promise<Business> => {
  //   const res = await api.post(API_ENDPOINTS.onboarding.registerBusiness, payload);
  //   return res.data.business;
  // },

  registerBusiness: async (
  payload: RegisterBusinessPayload
): Promise<RegisterBusinessResponse> => {
  const res = await api.post(API_ENDPOINTS.onboarding.registerBusiness, payload)
  
  // Assuming backend returns full auth response after onboarding
  const data = res.data // { user, business, tenant, accessToken, refreshToken }

  // Save tokens
  await AsyncStorage.setItem("accessToken", data.accessToken)
  await AsyncStorage.setItem("refreshToken", data.refreshToken)

  return data
},

  /**
   * Set a PIN for a user (used after onboarding)
   * @param userId - ID of the user
   * @param pin - 4-digit PIN
   */
  setPin: async (userId: string, pin: string): Promise<User> => {
    const endpoint = API_ENDPOINTS.users.setPin(userId);
    const res = await api.post(endpoint, { pin });
    return res.data.user;
  },
};

export default AuthService;