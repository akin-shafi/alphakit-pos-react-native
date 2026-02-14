import { createStackNavigator } from "@react-navigation/stack"
import { POSHomeScreen } from "../screens/pos/POSHomeScreen"
import { CartScreen } from "../screens/pos/CartScreen"
import { CheckoutScreen } from "../screens/pos/CheckoutScreen"
import { ExternalTerminalScreen } from "../screens/pos/ExternalTerminalScreen"
import { DraftOrdersScreen } from "../screens/pos/DraftOrdersScreen"
import DetailedReportScreen from "../screens/reports/DetailedReportScreen"
import { AuditLogScreen } from "../screens/reports/AuditLogScreen"
import { PaymentSettingsScreen } from "../screens/settings/PaymentSettingsScreen"
import { StaffManagementScreen } from "../screens/settings/StaffManagementScreen"
import { PrinterSettingsScreen } from "../screens/settings/PrinterSettingsScreen"
import { ReceiptSettingsScreen } from "../screens/settings/ReceiptSettingsScreen"
import { MainTabs } from "./MainTabs"
import { SubscriptionPlansScreen } from "../screens/subscription/SubscriptionPlansScreen"
import { SubscriptionExpiredScreen } from "../screens/subscription/SubscriptionExpiredScreen"
import { DashboardScreen } from "../screens/home/DashboardScreen"
import { ProfileScreen } from "../screens/settings/ProfileScreen"
import { RoleManagementScreen } from "../screens/settings/RoleManagementScreen"
import { ShiftManagementScreen } from "../screens/settings/ShiftManagementScreen"

import { TableManagementScreen } from "../screens/settings/TableManagementScreen"

import { TaxSettingsScreen } from "../screens/settings/TaxSettingsScreen"
import { HowItWorksScreen } from "../screens/home/HowItWorksScreen"
import { KitchenScreen } from "../screens/kitchen/KitchenScreen"
import { useAuth } from "../contexts/AuthContext"

const Stack = createStackNavigator()

export const POSStack = () => {
  const { user } = useAuth()
  const isKDS = user?.role === "KITCHEN" || user?.role === "CHEF" || user?.role === "BARTENDER"
  const isSuperAdmin = user?.role === "super_admin"
  
  // Determine initial route based on user role
  const getInitialRoute = () => {
    if (isSuperAdmin) return "Dashboard" // Super admins go to dashboard with admin message
    if (isKDS) return "Kitchen"
    return "Dashboard"
  }

  return (
    <Stack.Navigator 
      initialRouteName={getInitialRoute()} 
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Kitchen" component={KitchenScreen} />
      
      {/* Sub-screens */}
      <Stack.Screen name="Cart" component={CartScreen} />  
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="ExternalTerminal" component={ExternalTerminalScreen} />
      <Stack.Screen name="DraftOrders" component={DraftOrdersScreen} />
      <Stack.Screen name="DetailedReport" component={DetailedReportScreen} />
      <Stack.Screen name="PaymentSettings" component={PaymentSettingsScreen} />
      <Stack.Screen name="StaffManagement" component={StaffManagementScreen} /> 
      <Stack.Screen name="PrinterSettings" component={PrinterSettingsScreen} />
      <Stack.Screen name="ReceiptSettings" component={ReceiptSettingsScreen} />
      <Stack.Screen name="SubscriptionPlans" component={SubscriptionPlansScreen} />
      <Stack.Screen name="SubscriptionExpired" component={SubscriptionExpiredScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="RoleManagement" component={RoleManagementScreen} />
      <Stack.Screen name="ShiftManagement" component={ShiftManagementScreen} />
      <Stack.Screen name="TableManagement" component={TableManagementScreen} />
      <Stack.Screen name="TaxSettings" component={TaxSettingsScreen} />
      <Stack.Screen name="AuditLog" component={AuditLogScreen} />
      <Stack.Screen name="HowItWorks" component={HowItWorksScreen} />
    </Stack.Navigator>
  )
}
