import type React from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Button } from "../../components/Button"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"

export const WelcomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="storefront" size={48} color={Colors.white} />
          </View>
        </View>

        <Text style={styles.title}>Welcome to{"\n"}POS Terminal</Text>
        <Text style={styles.description}>
          The complete point of sale solution for your business. Manage inventory, process transactions, and track sales
          all in one place.
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: Colors.tealLight }]}>
              <Ionicons name="cart" size={28} color={Colors.teal} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Fast Checkout</Text>
              <Text style={styles.featureText}>Process sales quickly with an intuitive interface</Text>
            </View>
          </View>

          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: Colors.tealLight }]}>
              <Ionicons name="cube" size={28} color={Colors.teal} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Inventory Management</Text>
              <Text style={styles.featureText}>Track stock levels and manage products easily</Text>
            </View>
          </View>

          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: Colors.tealLight }]}>
              <Ionicons name="bar-chart" size={28} color={Colors.teal} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Sales Reports</Text>
              <Text style={styles.featureText}>Get insights with detailed analytics</Text>
            </View>
          </View>

          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: Colors.tealLight }]}>
              <Ionicons name="shield-checkmark" size={28} color={Colors.teal} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Secure & Reliable</Text>
              <Text style={styles.featureText}>Your business data is safe and protected</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Button
          title="Get Started"
          onPress={() => navigation.navigate("Onboarding")}
          fullWidth
          size="lg"
          style={styles.primaryButton}
        />
        <Button
          title="I Have an Account"
          onPress={() => navigation.navigate("BusinessID")}
          variant="outline"
          fullWidth
          size="lg"
          style={styles.outlineButton}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 180,
  },
  header: {
    alignItems: "flex-start",
    marginTop: 24,
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    backgroundColor: Colors.teal,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 34,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 16,
    lineHeight: 42,
  },
  description: {
    fontSize: Typography.base,
    color: Colors.gray600,
    lineHeight: 24,
    marginBottom: 40,
  },
  features: {
    gap: 28,
  },
  feature: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  featureContent: {
    flex: 1,
    paddingTop: 4,
  },
  featureTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    marginBottom: 4,
  },
  featureText: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    lineHeight: 20,
  },
  actions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 32,
    backgroundColor: Colors.white,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  primaryButton: {
    backgroundColor: Colors.teal,
  },
  outlineButton: {
    borderColor: Colors.teal,
  },
})
