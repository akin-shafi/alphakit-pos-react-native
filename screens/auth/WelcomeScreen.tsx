import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Button } from "../../components/Button"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"

export const WelcomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>POS</Text>
          </View>
          <Text style={styles.title}>Welcome to POS Terminal</Text>
          <Text style={styles.subtitle}>Modern point of sale solution for your business</Text>
        </View>

        <View style={styles.illustration}>
          <View style={styles.illustrationBox}>
            <Text style={styles.illustrationText}>🏪</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button title="Register New Business" onPress={() => navigation.navigate("Onboarding")} fullWidth size="lg" />
          <Button
            title="Login to Existing Business"
            onPress={() => navigation.navigate("BusinessID")}
            variant="outline"
            fullWidth
            size="lg"
          />
        </View>
      </View>

      <Text style={styles.footer}>Secure • Fast • Reliable</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: 48,
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: Colors.black,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  logoText: {
    fontSize: Typography["3xl"],
    fontWeight: Typography.bold,
    color: Colors.white,
  },
  title: {
    fontSize: Typography["3xl"],
    fontWeight: Typography.bold,
    color: Colors.gray900,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: Typography.lg,
    color: Colors.gray500,
    textAlign: "center",
  },
  illustration: {
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationBox: {
    width: 200,
    height: 200,
    backgroundColor: Colors.gray50,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationText: {
    fontSize: 80,
  },
  actions: {
    gap: 16,
  },
  footer: {
    textAlign: "center",
    padding: 24,
    fontSize: Typography.sm,
    color: Colors.gray400,
  },
})
