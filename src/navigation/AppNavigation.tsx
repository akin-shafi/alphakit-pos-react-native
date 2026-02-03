
import { createStackNavigator } from "@react-navigation/stack"
import { useAuth } from "../contexts/AuthContext"
import { useSubscription } from "../contexts/SubscriptionContext"
import { AuthStack } from "./AuthStack"
import { POSStack } from "./POSStack"
import { SubscriptionExpiredScreen } from "../screens/subscription/SubscriptionExpiredScreen"
import { SubscriptionPlansScreen } from "../screens/subscription/SubscriptionPlansScreen"

const Stack = createStackNavigator()

export const AppNavigation = () => {
  const { isAuthenticated } = useAuth()
  const { isSubscribed, loading } = useSubscription()

  if (isAuthenticated && loading) {
    return null; // Or a splash screen
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : !isSubscribed ? (
        <Stack.Group>
          <Stack.Screen name="SubscriptionExpired" component={SubscriptionExpiredScreen} />
          <Stack.Screen name="SubscriptionPlans" component={SubscriptionPlansScreen} />
        </Stack.Group>
      ) : (
        <Stack.Screen name="POS" component={POSStack} />
      )}
    </Stack.Navigator>
  )
}
