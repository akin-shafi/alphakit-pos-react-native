
import apiClient from "./ApiClient";
import { API_ENDPOINTS } from "../config/api";

export interface SubscriptionPlan {
  type: "MONTHLY" | "QUARTERLY" | "ANNUAL" | "SERVICE_MONTHLY" | "SERVICE_QUARTERLY" | "SERVICE_ANNUAL";
  name: string;
  duration_days: number;
  price: number;
  currency: string;
  user_limit: number;
  product_limit: number;
}

export interface ModulePlan {
  type: string;
  name: string;
  price: number;
  description: string;
  depends_on?: string[];
}

export interface ModuleBundle {
  code: string;
  name: string;
  price: number;
  modules: string[];
  description: string;
}

export interface BusinessModule {
  id: number;
  business_id: number;
  module: string;
  is_active: boolean;
  expiry_date?: string;
}

export interface Subscription {
  id: number;
  business_id: number;
  plan_type: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "GRACE_PERIOD" | "PENDING_PAYMENT";
  start_date: string;
  end_date: string;
  amount_paid: number;
  description?: string;
  payment_method?: string;
  transaction_reference: string;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionStatus {
  subscription?: Subscription;
  modules?: BusinessModule[];
}

export interface PaymentMethod {
  id: number;
  business_id: number;
  email: string;
  card_category: string;
  card_type: string;
  bank: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  brand: string;
  is_default: boolean;
  created_at?: string;
}

export const SubscriptionService = {
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await apiClient.get(API_ENDPOINTS.subscription.plans);
    return response.data;
  },

  getPricing: async (): Promise<{ plans: SubscriptionPlan[], modules: ModulePlan[], bundles: ModuleBundle[] }> => {
    const response = await apiClient.get(API_ENDPOINTS.subscription.pricing);
    return response.data;
  },

  getStatus: async (): Promise<Subscription | { status: "NONE" }> => {
    const response = await apiClient.get(API_ENDPOINTS.subscription.status);
    return response.data;
  },

  getHistory: async (): Promise<Subscription[]> => {
    const response = await apiClient.get(API_ENDPOINTS.subscription.history);
    return response.data;
  },

  subscribe: async (planType: string, reference: string, modules?: string[], bundleCode?: string, promoCode?: string): Promise<Subscription> => {
    let url = API_ENDPOINTS.subscription.subscribe;
    if (promoCode) {
      url += `?promo_code=${promoCode}`;
    }
    const response = await apiClient.post(url, {
      plan_type: planType,
      reference,
      modules: modules || [],
      bundle_code: bundleCode,
    });
    return response.data;
  },

  validatePromoCode: async (code: string): Promise<{ success: boolean; discount_percentage: number }> => {
    const response = await apiClient.get(`${API_ENDPOINTS.subscription.promoValidate}?code=${code}`);
    return response.data;
  },

  getSavedCards: async (): Promise<PaymentMethod[]> => {
    const response = await apiClient.get(API_ENDPOINTS.subscription.cards);
    return response.data;
  },

  chargeSavedCard: async (data: { plan_type: string; modules: string[]; bundle_code?: string; card_id: number }): Promise<Subscription> => {
    const response = await apiClient.post(API_ENDPOINTS.subscription.chargeSaved, data);
    return response.data;
  },

  deleteSavedCard: async (id: number): Promise<any> => {
    const response = await apiClient.delete(API_ENDPOINTS.subscription.deleteCard(id.toString()));
    return response.data;
  },
};
