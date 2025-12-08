import { createStackNavigator } from "@react-navigation/stack"
import { POSHomeScreen } from "../screens/pos/POSHomeScreen"
import { CartScreen } from "../screens/pos/CartScreen"
import { CheckoutScreen } from "../screens/pos/CheckoutScreen"
import { ExternalTerminalScreen } from "../screens/pos/ExternalTerminalScreen"
import { InventoryScreen } from "../screens/inventory/InventoryScreen"
import { ReportsScreen } from "../screens/reports/ReportsScreen"
import  DetailedReportScreen  from "../screens/reports/DetailedReportScreen"
import { SettingsScreen } from "../screens/settings/SettingsScreen"
import { PaymentSettingsScreen } from "../screens/settings/PaymentSettingsScreen"

const Stack = createStackNavigator()

export const POSStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="POSHome" component={POSHomeScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="ExternalTerminal" component={ExternalTerminalScreen} />
      <Stack.Screen name="Inventory" component={InventoryScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="DetailedReport" component={DetailedReportScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="PaymentSettings" component={PaymentSettingsScreen} />
    </Stack.Navigator>
  )
}
