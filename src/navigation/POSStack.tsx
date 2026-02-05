import { createStackNavigator } from "@react-navigation/stack"
import { POSHomeScreen } from "../screens/pos/POSHomeScreen"
import { CartScreen } from "../screens/pos/CartScreen"
import { CheckoutScreen } from "../screens/pos/CheckoutScreen"
import { ExternalTerminalScreen } from "../screens/pos/ExternalTerminalScreen"
import { DraftOrdersScreen } from "../screens/pos/DraftOrdersScreen"
import DetailedReportScreen from "../screens/reports/DetailedReportScreen"
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

const Stack = createStackNavigator()

export const POSStack = () => {
  return (
    <Stack.Navigator initialRouteName="Dashboard" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      
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
    </Stack.Navigator>
  )
}
