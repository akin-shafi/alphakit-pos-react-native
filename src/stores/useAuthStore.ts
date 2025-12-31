import { create } from "zustand";
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
  setPin: (userId: string, pin: string) => Promise<void>;
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

  setPin: async (userId: string, pin: string) => {
    set({ loading: true });
    try {
      await AuthService.setPin(userId, pin);
      // Optionally update user in store
      const updatedUser = get().user ? { ...get().user, pin } : null;
      set({ user: updatedUser });
      if (updatedUser) {
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } finally {
      set({ loading: false });
    }
  },
}));
