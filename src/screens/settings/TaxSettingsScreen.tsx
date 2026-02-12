import React, { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Switch, KeyboardAvoidingView, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { useSettings } from "../../contexts/SettingsContext"
import { Colors, BusinessThemes, getBusinessTheme } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"
import { Button } from "../../components/Button"
import { Card } from "../../components/Card"

export const TaxSettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { business } = useAuth()
  const { enableTax, taxRate, toggleTax, updateTaxRate } = useSettings()
  const theme = getBusinessTheme(business?.type)
  
  const [rateInput, setRateInput] = useState(taxRate.toString())
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    const rate = parseFloat(rateInput)
    if (isNaN(rate) || rate < 0) {
      Alert.alert("Error", "Please enter a valid tax rate")
      return
    }

    setLoading(true)
    try {
      await updateTaxRate(rate)
      Alert.alert("Success", "Tax settings updated")
      navigation.goBack()
    } catch (error) {
      Alert.alert("Error", "Failed to update tax settings")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tax Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Calculate Tax</Text>
              <Text style={styles.settingDescription}>Automatically add tax to checkout</Text>
            </View>
            <Switch
              value={enableTax}
              onValueChange={toggleTax}
              trackColor={{ false: Colors.gray200, true: theme.primary }}
              thumbColor={Colors.white}
            />
          </View>

          {enableTax && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Tax Rate (%)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={rateInput}
                  onChangeText={setRateInput}
                  keyboardType="numeric"
                  placeholder="0.00"
                />
                <Text style={styles.inputSuffix}>%</Text>
              </View>
              <Text style={styles.helperText}>This rate will be applied to the subtotal of every sale.</Text>
            </View>
          )}
        </Card>

        {enableTax && (
            <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>Example Calculation</Text>
                <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Subtotal</Text>
                    <Text style={styles.previewValue}>1,000.00</Text>
                </View>
                <View style={[styles.previewRow, { borderBottomWidth: 1, borderBottomColor: Colors.gray100, paddingBottom: 8 }]}>
                    <Text style={styles.previewLabel}>Tax ({rateInput || "0"}%)</Text>
                    <Text style={styles.previewValue}>
                        {(1000 * (parseFloat(rateInput) || 0) / 100).toFixed(2)}
                    </Text>
                </View>
                <View style={[styles.previewRow, { marginTop: 8 }]}>
                    <Text style={styles.previewTotalLabel}>Total</Text>
                    <Text style={[styles.previewTotalValue, { color: theme.primary }]}>
                        {(1000 * (1 + (parseFloat(rateInput) || 0) / 100)).toFixed(2)}
                    </Text>
                </View>
            </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save Settings"
          onPress={handleSave}
          loading={loading}
          fullWidth
          primaryColor={theme.primary}
        />
      </View>
    </KeyboardAvoidingView>
  )
}

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
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  card: {
    padding: 20,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: Typography.sm,
    color: Colors.gray500,
  },
  inputContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  inputLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.gray700,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  inputSuffix: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray400,
    marginLeft: 8,
  },
  helperText: {
    fontSize: Typography.xs,
    color: Colors.gray500,
    marginTop: 8,
    fontStyle: "italic",
  },
  previewCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderStyle: "dashed",
  },
  previewTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.gray400,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: Typography.sm,
    color: Colors.gray600,
  },
  previewValue: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
  },
  previewTotalLabel: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  previewTotalValue: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
})
