import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../constants/Colors"
import { Typography } from "../constants/Typography"
import type { ConnectionStatus } from "../types"

interface StatusBadgeProps {
  status: ConnectionStatus
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    if (!status.isOnline) {
      return {
        icon: "cloud-offline" as const,
        text: "Offline",
        color: Colors.offline,
        bgColor: Colors.gray100,
      }
    }
    if (status.pendingSyncCount > 0) {
      return {
        icon: "sync" as const,
        text: "Syncing",
        color: Colors.syncing,
        bgColor: "#FEF3C7",
      }
    }
    return {
      icon: "cloud-done" as const,
      text: "Online",
      color: Colors.online,
      bgColor: "#D1FAE5",
    }
  }

  const config = getStatusConfig()

  return (
    <View style={[styles.badge, { backgroundColor: config.bgColor }]}>
      <Ionicons name={config.icon} size={14} color={config.color} />
      <Text style={[styles.text, { color: config.color }]}>{config.text}</Text>
      {status.pendingSyncCount > 0 && (
        <View style={[styles.count, { backgroundColor: config.color }]}>
          <Text style={styles.countText}>{status.pendingSyncCount}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  text: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
  },
  count: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
  },
  countText: {
    fontSize: 10,
    fontWeight: Typography.bold,
    color: Colors.white,
  },
})
