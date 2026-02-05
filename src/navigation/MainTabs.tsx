import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { POSHomeScreen } from "../screens/pos/POSHomeScreen"
import { InventoryScreen } from "../screens/inventory/InventoryScreen"
import { ReportsScreen } from "../screens/reports/ReportsScreen"
import { SettingsScreen } from "../screens/settings/SettingsScreen"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../constants/Colors"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Platform } from "react-native"
import { useAuth } from "../contexts/AuthContext"
import { RolePermissions } from "../constants/Roles"

const Tab = createBottomTabNavigator()

export const MainTabs = () => {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  
  const roleKey = (user?.role?.toLowerCase() || "") as any
  const permissions = RolePermissions[roleKey as keyof typeof RolePermissions]
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.teal,
        tabBarInactiveTintColor: Colors.gray400,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.gray200,
          height: Platform.OS === "android" ? 60 + insets.bottom : 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
          backgroundColor: Colors.white,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginBottom: insets.bottom > 0 ? 0 : 4,
        },
      }}
    >
      <Tab.Screen
        name="POSHome"
        component={POSHomeScreen}
        options={{
          tabBarLabel: "POS",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />
      
      {permissions?.canManageInventory && (
        <Tab.Screen
          name="Inventory"
          component={InventoryScreen}
          options={{
            tabBarLabel: "Inventory",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cube-outline" size={size} color={color} />
            ),
          }}
        />
      )}

      {permissions?.canViewReports && (
        <Tab.Screen
          name="Reports"
          component={ReportsScreen}
          options={{
            tabBarLabel: "Reports",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bar-chart-outline" size={size} color={color} />
            ),
          }}
        />
      )}

      {permissions?.canManageSettings && (
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: "Settings",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  )
}
