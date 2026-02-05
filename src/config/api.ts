// src/config/api.ts

// const API_BASE_URL = process.env.NODE_ENV === "development" ?  "http://192.168.0.107:5050" : process.env.EXPO_PUBLIC_API_URL + "/api/v1/";
const API_BASE_URL = "http://192.168.0.107:5050/api/v1";
// const API_BASE_URL = "https://posfiber.onrender.com/api/v1";

export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login" as const,
    logout: "/auth/logout" as const,
    refresh: "/auth/refresh" as const,
  },
  onboarding: {
    registerBusiness: "/onboarding/register" as const,
    seed: "/seed" as const,
  },
  users: {
    base: "/users" as const,
    setPin: (userId: string) => `/users/${userId}/set-pin` as const,
    byId: (userId: string) => `/users/${userId}` as const,
  },
  inventory: {
    products: "/products" as const,
    productById: (productId: string) => `/products/${productId}` as const,
    productsByBusiness: (businessId: string) =>
      `/products?businessId=${businessId}` as const,
  },
  categories: {
    base: "/categories" as const,
    byId: (id: string) => `/categories/${id}` as const,
  },
  // Sales endpoints
  sales: {
    base: "/sales" as const,
    byId: (saleId: string) => `/sales/${saleId}` as const,
    void: (saleId: string) => `/sales/${saleId}/void` as const,
    list: "/sales" as const, // Will use query params for filtering
    dailyReport: "/sales/reports/daily" as const,
    rangeReport: "/sales/reports/range" as const,
  },

	
  subscription: {
    plans: "/subscription/plans" as const,
    status: "/subscription/status" as const,
    subscribe: "/subscription/subscribe" as const,
  },
};

export const getFullUrl = (path: string): string => `${API_BASE_URL}${path}`;

export default API_BASE_URL;