
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { SubscriptionService, Subscription, SubscriptionPlan } from "../services/SubscriptionService";
import { useAuth } from "./AuthContext";

interface SubscriptionContextType {
  subscription: Subscription | null;
  plans: SubscriptionPlan[];
  loading: boolean;
  isSubscribed: boolean;
  isExpired: boolean;
  isGracePeriod: boolean;
  daysRemaining: number;
  refreshStatus: () => Promise<void>;
  processSubscription: (planType: string, reference: string) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshStatus = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [status, activePlans] = await Promise.all([
        SubscriptionService.getStatus(),
        SubscriptionService.getPlans(),
      ]);
      
      if ("status" in status && status.status === "NONE") {
        setSubscription(null);
      } else {
        setSubscription(status as Subscription);
      }
      setPlans(activePlans);
    } catch (error) {
      console.error("Failed to fetch subscription status:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const processSubscription = async (planType: string, reference: string) => {
    try {
      setLoading(true);
      await SubscriptionService.subscribe(planType, reference);
      await refreshStatus();
    } catch (error) {
      console.error("Subscription failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isSubscribed = subscription?.status === "ACTIVE" || subscription?.status === "GRACE_PERIOD";
  const isExpired = subscription?.status === "EXPIRED";
  const isGracePeriod = subscription?.status === "GRACE_PERIOD";
  
  const daysRemaining = subscription?.end_date 
    ? Math.max(0, Math.ceil((new Date(subscription.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        plans,
        loading,
        isSubscribed,
        isExpired,
        isGracePeriod,
        daysRemaining,
        refreshStatus,
        processSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
