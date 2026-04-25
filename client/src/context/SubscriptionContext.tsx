import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface Subscription {
  id: number;
  userId: number;
  plan: string;
  status: string;
  billingCycle: string;
  autoRenew: boolean;
  startsAt: string;
  expiresAt: string | null;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
  isSubscribed: boolean;
  isFree: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSubscription = async () => {
    try {
      const response = await axios.get("/api/subscriptions/me", { withCredentials: true });
      if (response.data.success) {
        setSubscription(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch subscription:", err);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSubscription();
  }, []);

  const isSubscribed = subscription !== null && subscription.status === 'active' && subscription.plan !== 'free';
  const isFree = !subscription || subscription.plan === 'free';

  return (
    <SubscriptionContext.Provider value={{ subscription, loading, refreshSubscription, isSubscribed, isFree }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
