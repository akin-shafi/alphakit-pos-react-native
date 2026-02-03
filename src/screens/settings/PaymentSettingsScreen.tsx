

import type React from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { usePaymentConfig } from "../../contexts/PaymentConfigContext"
import { Card } from "../../components/Card"
import { Colors, BusinessThemes } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"

export const PaymentSettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { business } = useAuth()
  const { config, updateConfig } = usePaymentConfig()

  const theme = business ? BusinessThemes[business.type] : BusinessThemes.default

  const defaultModes = [
    {
      id: "ask-every-time",
      label: "Ask Every Time",
      description: "Choose payment method for each transaction (Recommended)",
      icon: "help-circle",
    },
    {
      id: "in-app-card",
      label: "Process Card In-App",
      description: "Always use in-app card processing by default",
      icon: "card",
    },
    {
      id: "external-terminal",
      label: "External Terminal Only",
      description: "Always use external POS terminals",
      icon: "terminal",
    },
  ]

  const handleDefaultModeChange = (mode: string) => {
    updateConfig({ defaultMode: mode as any })
  }

  const handleMethodToggle = (method: string, value: boolean) => {
    updateConfig({
      enabledMethods: {
        ...config.enabledMethods,
        [method]: value,
      },
    })
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment & Checkout</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Payment Behavior</Text>
          <Text style={styles.sectionDescription}>
            Choose how the system should handle payment method selection during checkout
          </Text>

          <Card style={styles.optionsCard}>
            {defaultModes.map((mode, index) => (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.optionRow,
                  index < defaultModes.length - 1 && styles.optionRowBorder,
                  config.defaultMode === mode.id && styles.optionRowSelected,
                ]}
                onPress={() => handleDefaultModeChange(mode.id)}
              >
                <View
                  style={[
                    styles.optionIcon,
                    { backgroundColor: config.defaultMode === mode.id ? `${theme.primary}15` : Colors.gray100 },
                  ]}
                >
                  <Ionicons
                    name={mode.icon as any}
                    size={24}
                    color={config.defaultMode === mode.id ? theme.primary : Colors.gray600}
                  />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>{mode.label}</Text>
                  <Text style={styles.optionDescription}>{mode.description}</Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    config.defaultMode === mode.id && [styles.radioSelected, { borderColor: theme.primary }],
                  ]}
                >
                  {config.defaultMode === mode.id && (
                    <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enabled Payment Methods</Text>
          <Text style={styles.sectionDescription}>Choose which payment methods are available at checkout</Text>

          <Card style={styles.methodsCard}>
            <MethodToggle
              icon="cash"
              label="Cash"
              value={config.enabledMethods.cash}
              onChange={(val) => handleMethodToggle("cash", val)}
              color={theme.primary}
            />
            <MethodToggle
              icon="card"
              label="Card (In-App)"
              value={config.enabledMethods.card}
              onChange={(val) => handleMethodToggle("card", val)}
              color={theme.primary}
            />
            <MethodToggle
              icon="terminal"
              label="External Terminal"
              value={config.enabledMethods.externalTerminal}
              onChange={(val) => handleMethodToggle("externalTerminal", val)}
              color={theme.primary}
            />
            <MethodToggle
              icon="swap-horizontal"
              label="Bank Transfer"
              value={config.enabledMethods.transfer}
              onChange={(val) => handleMethodToggle("transfer", val)}
              color={theme.primary}
            />
            <MethodToggle
              icon="time"
              label="Credit Sale"
              value={config.enabledMethods.credit}
              onChange={(val) => handleMethodToggle("credit", val)}
              color={theme.primary}
              isLast
            />
          </Card>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={Colors.blue600} />
          <Text style={styles.infoText}>
            Cashiers can always override the default payment method during checkout for maximum flexibility
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const MethodToggle: React.FC<{
  icon: string
  label: string
  value: boolean
  onChange: (value: boolean) => void
  color: string
  isLast?: boolean
}> = ({ icon, label, value, onChange, color, isLast }) => (
  <View style={[styles.methodRow, !isLast && styles.methodRowBorder]}>
    <View style={styles.methodLeft}>
      <Ionicons name={icon as any} size={20} color={Colors.gray600} />
      <Text style={styles.methodLabel}>{label}</Text>
    </View>
    <Switch value={value} onValueChange={onChange} trackColor={{ true: color }} />
  </View>
)

const styles = StyleSheet.create({
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
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.white,
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  sectionDescription: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    lineHeight: 20,
  },
  optionsCard: {
    padding: 0,
    overflow: "hidden",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  optionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  optionRowSelected: {
    backgroundColor: Colors.gray50,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    lineHeight: 18,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray300,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderWidth: 2,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  methodsCard: {
    padding: 0,
    overflow: "hidden",
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  methodRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  methodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  methodLabel: {
    fontSize: Typography.base,
    color: Colors.gray900,
  },
  infoBox: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: Colors.blue50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.blue200,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.sm,
    color: Colors.blue900,
    lineHeight: 20,
  },
})
