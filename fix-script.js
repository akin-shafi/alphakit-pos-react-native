const fs = require("fs");
const path = require("path");

const files = [
    {
        name: "src/services/AuthService.ts",
        content: `import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User, Business, Tenant } from "../types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

interface LoginResponse {
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
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const res = await axios.post(\`\${API_BASE_URL}/auth/refresh\`, { refreshToken });
          await AsyncStorage.setItem("accessToken", res.data.accessToken);
          originalRequest.headers["Authorization"] = \`Bearer \${res.data.accessToken}\`;
          return api(originalRequest);
        } catch (refreshErr) {
          await AsyncStorage.removeItem("accessToken");
          await AsyncStorage.removeItem("refreshToken");
          throw refreshErr;
        }
      }
    }
    const message = error.response?.data?.message || error.message || "Unknown API error";
    return Promise.reject(new Error(message));
  }
);

export const AuthService = {
  login: async (identifier: string, pin: string): Promise<LoginResponse> => {
    const res = await api.post("/auth/login", { identifier, pin });
    await AsyncStorage.setItem("accessToken", res.data.accessToken);
    await AsyncStorage.setItem("refreshToken", res.data.refreshToken);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
  },

  registerBusiness: async (payload: Partial<Business>): Promise<Business> => {
    const res = await api.post("/onboarding/register", payload);
    return res.data.business;
  },
};
`,
    },
    {
        name: "src/stores/useAuthStore.ts",
        content: `import create from "zustand";
import type { User, Business, Tenant } from "../types";
import { AuthService } from "../services/AuthService";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  business: Business | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (identifier: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
  registerBusiness: (payload: Partial<Business>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tenant: null,
  business: null,
  isAuthenticated: false,
  loading: false,

  login: async (identifier, pin) => {
    set({ loading: true });
    try {
      const res = await AuthService.login(identifier, pin);
      set({
        user: res.user,
        tenant: res.tenant,
        business: res.business,
        isAuthenticated: true,
      });
      await AsyncStorage.setItem("user", JSON.stringify(res.user));
      await AsyncStorage.setItem("tenant", JSON.stringify(res.tenant));
      await AsyncStorage.setItem("business", JSON.stringify(res.business));
    } catch (err: any) {
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await AuthService.logout();
      set({ user: null, tenant: null, business: null, isAuthenticated: false });
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("tenant");
      await AsyncStorage.removeItem("business");
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
    } finally {
      set({ loading: false });
    }
  },

  registerBusiness: async (payload) => {
    set({ loading: true });
    try {
      const business = await AuthService.registerBusiness(payload);
      set({ business });
      await AsyncStorage.setItem("business", JSON.stringify(business));
    } finally {
      set({ loading: false });
    }
  },
}));
`,
    },
];

files.forEach((file) => {
    const dir = path.dirname(file.name);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file.name, file.content, "utf8");
    //   console.log(\`✅ Created/Updated \${file.name}\`);
});

console.log("All files updated successfully.");
