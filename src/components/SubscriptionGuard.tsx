
import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useSubscription } from "../contexts/SubscriptionContext";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Colors } from "../constants/Colors";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  const { isSubscribed, loading } = useSubscription();
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!loading && !isSubscribed) {
      // If not subscribed, we could redirect, but usually, we show the Expired screen
      // or just block interaction. For now, let's allow children to render but 
      // the screens themselves should check isSubscribed.
      // Alternatively, we can navigate to the Expired screen.
    }
  }, [loading, isSubscribed, navigation]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.teal} />
      </View>
    );
  }

  return <>{children}</>;
};
