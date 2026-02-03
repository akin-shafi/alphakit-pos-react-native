
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSubscription } from "../contexts/SubscriptionContext";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "../constants/Colors";
import { Typography } from "../constants/Typography";

export const SubscriptionBanner: React.FC = () => {
  const { isSubscribed, isGracePeriod, daysRemaining, loading } = useSubscription();
  const navigation = useNavigation<any>();

  if (loading || (isSubscribed && !isGracePeriod && daysRemaining > 7)) {
    return null;
  }

  const isCritical = isGracePeriod || daysRemaining <= 3;
  const backgroundColor = isCritical ? Colors.error : Colors.warning;
  const icon = isCritical ? "alert-circle" : "warning";
  const message = isGracePeriod 
    ? "Subscription Expired! You are in a 7-day grace period." 
    : `Subscription expires in ${daysRemaining} days.`;

  return (
    <TouchableOpacity 
      style={[styles.banner, { backgroundColor }]}
      onPress={() => navigation.navigate("SubscriptionPlans")}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        <Ionicons name={icon} size={20} color={Colors.white} />
        <Text style={styles.message}>{message}</Text>
      </View>
      <View style={styles.action}>
        <Text style={styles.actionText}>RENEW</Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.white} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  message: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: Typography.bold,
    marginLeft: 8,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: Typography.bold,
    marginRight: 2,
  },
});
