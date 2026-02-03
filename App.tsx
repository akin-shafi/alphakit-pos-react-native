import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { NavigationContainer } from "@react-navigation/native"
import { AuthProvider } from "./src/contexts/AuthContext"
import { CartProvider } from "./src/contexts/CartContext"
import { InventoryProvider } from "./src/contexts/InventoryContext"
import { PaymentConfigProvider } from "./src/contexts/PaymentConfigContext"
import { SubscriptionProvider } from "./src/contexts/SubscriptionContext"
import { AppNavigation } from "./src/navigation/AppNavigation"
import { SessionMonitor } from "./src/components/SessionMonitor"

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PaymentConfigProvider>
          <CartProvider>
            <InventoryProvider>
              <SubscriptionProvider>
                <SessionMonitor>
                  <NavigationContainer>
                    <AppNavigation />
                  </NavigationContainer>
                </SessionMonitor>
              </SubscriptionProvider>
              <StatusBar style="auto" />
            </InventoryProvider>
          </CartProvider>
        </PaymentConfigProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
