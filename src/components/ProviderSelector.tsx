
import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../constants/Colors"
import { Typography } from "../constants/Typography"

interface ProviderOption {
  id: string
  name: string
  icon: string
}

interface ProviderSelectorProps {
  visible: boolean
  onClose: () => void
  onSelect: (provider: string) => void
  providers: string[]
  primaryColor: string
}

const PROVIDER_INFO: Record<string, ProviderOption> = {
  moniepoint: {
    id: "moniepoint",
    name: "MoniePoint",
    icon: "terminal",
  },
  opay: {
    id: "opay",
    name: "OPay",
    icon: "terminal",
  },
  other: {
    id: "other",
    name: "Other POS Terminal",
    icon: "terminal",
  },
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  visible,
  onClose,
  onSelect,
  providers,
  primaryColor,
}) => {
  if (!visible) return null

  const handleSelect = (provider: string) => {
    onSelect(provider)
  }

  return (
    <View style={styles.inlineContainer}>
      {/* <View style={styles.modalHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onClose} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.gray600} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Select Terminal Provider</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.gray600} />
        </TouchableOpacity>
      </View> */}

      <View style={styles.providers}>
        {providers.map((providerId) => {
          const provider = PROVIDER_INFO[providerId] || PROVIDER_INFO.other
          return (
            <TouchableOpacity
              key={provider.id}
              style={styles.providerCard}
              onPress={() => handleSelect(provider.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.providerIcon, { backgroundColor: `${primaryColor}15` }]}>
                <Ionicons name={provider.icon as any} size={28} color={primaryColor} />
              </View>
              <View style={styles.providerInfo}>
                <Text style={styles.providerLabel}>{provider.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  inlineContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
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
  providers: {
    padding: 16,
    gap: 12,
  },
  providerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    gap: 16,
  },
  providerIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  providerInfo: {
    flex: 1,
  },
  providerLabel: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
  },
})
