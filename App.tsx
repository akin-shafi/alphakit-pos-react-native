import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { NavigationContainer } from "@react-navigation/native"
import { AuthProvider } from "./src/contexts/AuthContext"
import { CartProvider } from "./src/contexts/CartContext"
import { InventoryProvider } from "./src/contexts/InventoryContext"
import { PaymentConfigProvider } from "./src/contexts/PaymentConfigContext"
import { AppNavigation } from "./src/navigation/AppNavigation"

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
