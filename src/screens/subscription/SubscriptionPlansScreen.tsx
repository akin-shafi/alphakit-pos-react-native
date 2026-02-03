import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSubscription } from "../../contexts/SubscriptionContext";
import { useAuth } from "../../contexts/AuthContext";
import { Colors } from "../../constants/Colors";
import { Typography } from "../../constants/Typography";
import { formatCurrency } from "../../utils/Formatter";
import { Paystack } from "react-native-paystack-webview";

export const SubscriptionPlansScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { plans, loading, processSubscription, isSubscribed, daysRemaining } = useSubscription();
  const { business, user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const paystackRef = useRef<any>(null);

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    Alert.alert(
      "Confirm Subscription",
      `Would you like to subscribe to the ${plan.name} for ${formatCurrency(plan.price, plan.currency)}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Proceed to Payment", 
          onPress: () => {
             paystackRef.current?.startTransaction();
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          {navigation.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Subscription Plans</Text>
          <View style={{ width: navigation.canGoBack() ? 24 : 0 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.statusCard}>
            <View style={styles.statusIconContainer}>
              <Ionicons 
                name={isSubscribed ? "checkmark-circle" : "alert-circle"} 
                size={40} 
                color={isSubscribed ? Colors.success : Colors.error} 
              />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Current Status</Text>
              <Text style={[styles.statusValue, { color: isSubscribed ? Colors.success : Colors.error }]}>
                {isSubscribed ? "Active" : "Trial/Expired"}
              </Text>
              {isSubscribed && (
                <Text style={styles.expiryText}>{daysRemaining} days remaining</Text>
              )}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Choose your plan</Text>
          <Text style={styles.sectionSubtitle}>Scale your business with professional tools</Text>

          {plans.map((plan) => (
            <TouchableOpacity 
              key={plan.type} 
              style={styles.planCard}
              onPress={() => handleSelectPlan(plan)}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                {plan.type === "ANNUAL" && (
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveBadgeText}>SAVE 20%</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.planPrice}>
                {formatCurrency(plan.price, plan.currency)}
                <Text style={styles.priceDuration}> / {plan.duration_days} days</Text>
              </Text>

              <View style={styles.divider} />

              <View style={styles.featureItem}>
                <Ionicons name="checkmark" size={18} color={Colors.teal} />
                <Text style={styles.featureText}>Manage up to {plan.user_limit} staff members</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark" size={18} color={Colors.teal} />
                <Text style={styles.featureText}>Inventory: up to {plan.product_limit} products</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark" size={18} color={Colors.teal} />
                <Text style={styles.featureText}>Detailed Sales Reports</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark" size={18} color={Colors.teal} />
                <Text style={styles.featureText}>Offline functionality</Text>
              </View>

              <View style={styles.subscribeButton}>
                <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedPlan && (
        <Paystack
          paystackKey={(process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY as string) || ""}
          amount={(selectedPlan.price * 100).toString()}
          billingEmail={user?.email || ""}
          billingName={`${user?.first_name || ""} ${user?.last_name || ""}`}
          currency={selectedPlan.currency || "NGN"}
          activityIndicatorColor={Colors.teal}
          onCancel={(e) => {
            Alert.alert("Cancelled", "Payment was cancelled");
          }}
          onSuccess={async (res: any) => {
            try {
              await processSubscription(selectedPlan.type, res.transactionRef.reference);
              Alert.alert("Success", "Subscription activated successfully!");
              navigation.goBack();
            } catch (e) {
              Alert.alert("Error", "Payment verification failed. Please contact support.");
            }
          }}
          ref={paystackRef}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statusCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.gray200,
    alignItems: "center",
  },
  statusIconContainer: {
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: Typography.xs,
    color: Colors.gray500,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statusValue: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  expiryText: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    textAlign: "center",
  },
  sectionSubtitle: {
    fontSize: Typography.base,
    color: Colors.gray500,
    textAlign: "center",
    marginBottom: 24,
    marginTop: 4,
  },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  planName: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.teal,
  },
  saveBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: Typography.bold,
    color: Colors.white,
  },
  planPrice: {
    fontSize: Typography["2xl"],
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  priceDuration: {
    fontSize: Typography.sm,
    color: Colors.gray500,
    fontWeight: "normal",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray100,
    marginVertical: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  featureText: {
    fontSize: Typography.sm,
    color: Colors.gray700,
    marginLeft: 8,
  },
  subscribeButton: {
    backgroundColor: Colors.teal,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  subscribeButtonText: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.white,
  },
});
