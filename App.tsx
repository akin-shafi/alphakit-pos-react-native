import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { NavigationContainer } from "@react-navigation/native"
import { AuthProvider } from "./contexts/AuthContext"
import { CartProvider } from "./contexts/CartContext"
import { InventoryProvider } from "./contexts/InventoryContext"
import { PaymentConfigProvider } from "./contexts/PaymentConfigContext"
import { AppNavigation } from "./navigation/AppNavigation"

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PaymentConfigProvider>
          <CartProvider>
            <InventoryProvider>
              <NavigationContainer>
                <AppNavigation />
              </NavigationContainer>
              <StatusBar style="auto" />
            </InventoryProvider>
          </CartProvider>
        </PaymentConfigProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
