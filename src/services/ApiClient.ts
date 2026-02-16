import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeviceEventEmitter } from "react-native";
import API_BASE_URL, { API_ENDPOINTS } from "../config/api";

// Event name for session expiry
export const SESSION_EXPIRED_EVENT = "SESSION_EXPIRED";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request Interceptor: Logging & Token Injection
apiClient.interceptors.request.use(
  async (config) => {
    // Inject Token
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Inject Tenant ID
    let tenantId = await AsyncStorage.getItem("tenantId");
    if (!tenantId) {
      const tenantStr = await AsyncStorage.getItem("tenant");
      if (tenantStr) {
        try {
          const tenantObj = JSON.parse(tenantStr);
          tenantId = tenantObj.id?.toString() || tenantObj.tenant_id?.toString();
          if (tenantId) await AsyncStorage.setItem("tenantId", tenantId);
        } catch (e) {}
      }
    }
    if (tenantId) {
      config.headers["X-Tenant-ID"] = tenantId;
    }

    // Inject Business ID
    let businessId = await AsyncStorage.getItem("currentBusinessId");
    if (!businessId) {
      const businessStr = await AsyncStorage.getItem("business");
      if (businessStr) {
        try {
          const businessObj = JSON.parse(businessStr);
          businessId = businessObj.id?.toString();
          if (businessId) await AsyncStorage.setItem("currentBusinessId", businessId);
        } catch (e) {}
      }
    }
    if (businessId) {
      config.headers["X-Current-Business-ID"] = businessId;
    }

    // Console Logging
    const fullUrl = `${config.baseURL || ""}${config.url}`;
    // console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${fullUrl}`, {
    //   headers: config.headers,
    //   data: config.data,
    // });

    return config;
  },
  (error) => {
    console.error(`[API REQUEST ERROR]`, error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Logging & Token Refresh
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `[API RESPONSE] ${response.status} ${response.config.url}`,
      response.data
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    const status = error.response?.status
    const errorMsg = error.response?.data?.error || error.response?.data || error.message

    console.warn(
      `[API ERROR] ${status || "NETWORK_ERROR"} ${originalRequest?.url}`,
      errorMsg
    );

    const isAuthEndpoint = originalRequest?.url?.includes("login") || originalRequest?.url?.includes("resend-otp");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      console.log("[API] Attempting token refresh...");

      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          // Use a new instance to avoid loops, or just raw axios
          const res = await axios.post(
            `${API_BASE_URL}${API_ENDPOINTS.auth.refresh}`,
            { refresh_token: refreshToken }
          );

          const { access_token } = res.data;
          await AsyncStorage.setItem("accessToken", access_token);
          
          // Update header for the retry
          originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
          apiClient.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

          console.log("[API] Token refresh successful. Retrying request.");
          return apiClient(originalRequest);
        } catch (refreshErr) {
          console.error("[API] Token refresh failed. Triggering session expiry.");
          await AsyncStorage.removeItem("accessToken");
          await AsyncStorage.removeItem("refreshToken");
          
          // Emit session expired event to trigger logout in AuthContext
          DeviceEventEmitter.emit(SESSION_EXPIRED_EVENT);
          
          throw refreshErr;
        }
      } else {
        // No refresh token available, session is expired
        console.error("[API] No refresh token available. Triggering session expiry.");
        await AsyncStorage.removeItem("accessToken");
        DeviceEventEmitter.emit(SESSION_EXPIRED_EVENT);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

