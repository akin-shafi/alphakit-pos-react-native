
import apiClient from "./ApiClient";
import { API_ENDPOINTS } from "../config/api";

export interface SubscriptionPlan {
  type: "MONTHLY" | "QUARTERLY" | "ANNUAL";
  name: string;
  duration_days: number;
  price: number;
  currency: string;
  user_limit: number;
  product_limit: number;
}

export interface Subscription {
  id: number;
  business_id: number;
  plan_type: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "GRACE_PERIOD";
  start_date: string;
  end_date: string;
  amount_paid: number;
  transaction_reference: string;
}

export const SubscriptionService = {
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await apiClient.get(API_ENDPOINTS.subscription.plans);
    return response.data;
  },

  getStatus: async (): Promise<Subscription | { status: "NONE" }> => {
    const response = await apiClient.get(API_ENDPOINTS.subscription.status);
    return response.data;
  },

  subscribe: async (planType: string, reference: string): Promise<Subscription> => {
    const response = await apiClient.post(API_ENDPOINTS.subscription.subscribe, {
      plan_type: planType,
      reference,
    });
    return response.data;
  },
};
