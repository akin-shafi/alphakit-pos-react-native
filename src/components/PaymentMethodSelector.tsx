

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../constants/Colors"
import { Typography } from "../constants/Typography"
import type { PaymentConfig } from "../types"
import { ProviderSelector } from "./ProviderSelector"

interface PaymentMethod {
  id: string
  label: string
  icon: string
  description: string
  enabled: boolean
}

interface PaymentMethodSelectorProps {
  visible: boolean
  onClose: () => void
  onSelect: (method: string, provider?: string) => void
  config: PaymentConfig
  primaryColor: string
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  visible,
  onClose,
  onSelect,
  config,
  primaryColor,
}) => {
  const [showProviderSelector, setShowProviderSelector] = useState(false)

  const paymentMethods: PaymentMethod[] = [
    {
      id: "card",
      label: "Card (In-App)",
      icon: "card",
      description: "Process card payment in the app",
      enabled: config.enabledMethods.card,
    },
    {
      id: "external-terminal",
      label: "External Terminal",
      icon: "terminal",
      description: "Use MoniePoint, Opay, or other POS",
      enabled: config.enabledMethods.externalTerminal,
    },
    {
      id: "cash",
      label: "Cash",
      icon: "cash",
      description: "Cash payment",
      enabled: config.enabledMethods.cash,
    },
    {
      id: "transfer",
      label: "Bank Transfer",
      icon: "swap-horizontal",
      description: "Bank transfer payment",
      enabled: config.enabledMethods.transfer,
    },
    {
      id: "credit",
      label: "Credit Sale",
      icon: "time",
      description: "Pay later / credit",
      enabled: config.enabledMethods.credit,
    },
  ]

  const handleSelect = (methodId: string) => {
    if (methodId === "external-terminal") {
      if (config.externalTerminalProviders.length > 1) {
        // Show provider selection modal
        setShowProviderSelector(true)
      } else {
        // Use the only available provider
        onSelect(methodId, config.externalTerminalProviders[0] || "moniepoint")
      }
    } else {
      onSelect(methodId)
    }
  }

  const handleProviderSelect = (provider: string) => {
    // Call onSelect first, which triggers the parent's dismissal and navigation (with a delay)
    onSelect("external-terminal", provider)
    // Then hide this provider selector
    setShowProviderSelector(false)
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {showProviderSelector ? "Select Provider" : "Select Payment Method"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.gray600} />
            </TouchableOpacity>
          </View>

          {showProviderSelector ? (
            <ProviderSelector
              visible={showProviderSelector}
              onClose={() => setShowProviderSelector(false)}
              onSelect={handleProviderSelect}
              providers={config.externalTerminalProviders}
              primaryColor={primaryColor}
            />
          ) : (
            <View style={styles.methods}>
              {paymentMethods
                .filter((method) => method.enabled)
                .map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={styles.methodCard}
                    onPress={() => handleSelect(method.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.methodIcon, { backgroundColor: `${primaryColor}15` }]}>
                      <Ionicons name={method.icon as any} size={28} color={primaryColor} />
                    </View>
                    <View style={styles.methodInfo}>
                      <Text style={styles.methodLabel}>{method.label}</Text>
                      <Text style={styles.methodDescription}>{method.description}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  modalTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  closeButton: {
    padding: 4,
  },
  methods: {
    padding: 16,
    gap: 12,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    gap: 16,
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: Typography.sm,
    color: Colors.gray600,
  },
})
