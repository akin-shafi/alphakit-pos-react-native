
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSubscription } from "../../contexts/SubscriptionContext";
import { Colors } from "../../constants/Colors";
import { Typography } from "../../constants/Typography";

export const SubscriptionExpiredScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isGracePeriod, daysRemaining } = useSubscription();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconBackground}>
          <Ionicons 
            name={isGracePeriod ? "warning" : "lock-closed"} 
            size={80} 
            color={isGracePeriod ? Colors.warning : Colors.error} 
          />
        </View>

        <Text style={styles.title}>
          {isGracePeriod ? "Subscription Ending Soon" : "Subscription Expired"}
        </Text>
        
        <Text style={styles.message}>
          {isGracePeriod 
            ? `Your business subscription will end in ${daysRemaining} days. Renew now to avoid any interruption in your sales operations.`
            : "Your subscription has expired. To continue creating sales, managing inventory, and viewing reports, please renew your subscription."}
        </Text>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate("SubscriptionPlans")}
        >
          <Text style={styles.primaryButtonText}>Renew Subscription</Text>
        </TouchableOpacity>

        {navigation.canGoBack() && (
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        )}

        <View style={styles.supportContainer}>
          <Text style={styles.supportText}>Need help? Contact support@alphakit.com</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBackground: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.gray50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    textAlign: "center",
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: Colors.gray600,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: Colors.teal,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: Typography.bold,
  },
  secondaryButton: {
    width: "100%",
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: Colors.gray500,
    fontSize: 16,
    fontWeight: Typography.medium,
  },
  supportContainer: {
    position: "absolute",
    bottom: 30,
  },
  supportText: {
    fontSize: 14,
    color: Colors.gray400,
  },
});
