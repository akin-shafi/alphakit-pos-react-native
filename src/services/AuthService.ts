
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./ApiClient";
import { API_ENDPOINTS } from "../config/api";
import type { User, Business, Tenant, RegisterBusinessPayload, RegisterBusinessResponse } from "../types";

export interface LoginResponse {
  user: User;
  tenant: Tenant;
  business: Business;
  accessToken: string;
  refreshToken: string;
}

export const AuthService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await apiClient.post(API_ENDPOINTS.auth.login, { email, password });

    const tenantId = (res.data.tenant?.id || res.data.user?.tenant_id || res.data.business?.tenant_id || "").toString();
    
    await AsyncStorage.setItem("accessToken", res.data.access_token);
    await AsyncStorage.setItem("refreshToken", res.data.refresh_token);
    await AsyncStorage.setItem("tenantId", tenantId);
    await AsyncStorage.setItem("currentBusinessId", res.data.business.id.toString());

    return {
      user: res.data.user,
      tenant: res.data.tenant,
      business: res.data.business,
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token,
    };
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.auth.logout);
    } catch (e) {
      console.warn("Logout request failed", e);
    }
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    await AsyncStorage.removeItem("tenantId");
  },

  registerBusiness: async (
    payload: RegisterBusinessPayload
  ): Promise<RegisterBusinessResponse> => {
    const res = await apiClient.post(API_ENDPOINTS.onboarding.registerBusiness, payload);

    const data = res.data;

    // Save tokens
    const tenantId = (data.tenant?.id || data.tenant_id || data.user?.tenant_id || "").toString();
    await AsyncStorage.setItem("accessToken", data.access_token || data.accessToken);
    await AsyncStorage.setItem("refreshToken", data.refresh_token || data.refreshToken);
    await AsyncStorage.setItem("tenantId", tenantId);
    await AsyncStorage.setItem("currentBusinessId", (data.business?.id || data.business_id).toString());

    return {
      user: data.user,
      business: data.business,
      tenant: data.tenant,
      accessToken: data.access_token || data.accessToken,
      refreshToken: data.refresh_token || data.refreshToken,
    };
  },

  /**
   * Set a PIN for a user (used after onboarding)
   * @param userId - ID of the user
   * @param pin - 4-digit PIN
   */
  setPin: async (userId: string, pin: string): Promise<User> => {
    const endpoint = API_ENDPOINTS.users.setPin(userId);
    const res = await apiClient.post(endpoint, { pin });
    return res.data.user;
  },

  verifyEmail: async (email: string, code: string): Promise<LoginResponse> => {
    const res = await apiClient.post("/auth/verify-email", { email, code });
    
    return {
      user: res.data.user,
      tenant: res.data.tenant,
      business: res.data.business,
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token,
    };
  },

  resendOTP: async (email: string): Promise<void> => {
    await apiClient.post("/auth/resend-otp", { email });
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post("/auth/forgot-password", { email });
  },

  verifyResetOTP: async (email: string, otp: string): Promise<void> => {
    await apiClient.post("/auth/verify-reset-otp", { email, otp });
  },

  resetPassword: async (email: string, otp: string, newPassword: string): Promise<void> => {
    await apiClient.post("/auth/reset-password", { email, otp, new_password: newPassword });
  },

  seedSampleData: async (businessId: number, businessType: string): Promise<void> => {
    await apiClient.post(`${API_ENDPOINTS.onboarding.seed}?business_type=${businessType}`);
  },

  updateBusiness: async (businessId: number, data: Partial<Business>): Promise<Business> => {
    const res = await apiClient.put(`/businesses/${businessId}`, data);
    return res.data;
  },

  getRecipe: async (productId: string): Promise<any> => {
    const res = await apiClient.get(`/recipes/${productId}`);
    return res.data;
  },

  addIngredient: async (data: any): Promise<any> => {
    const res = await apiClient.post(`/recipes`, data);
    return res.data;
  },

  removeIngredient: async (id: string): Promise<any> => {
    const res = await apiClient.delete(`/recipes/${id}`);
    return res.data;
  },

  getProfile: async (): Promise<LoginResponse> => {
    const res = await apiClient.get("/auth/profile");
    return {
      user: res.data.user,
      tenant: res.data.tenant,
      business: res.data.business,
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token,
    };
  }
};

export default AuthService;
