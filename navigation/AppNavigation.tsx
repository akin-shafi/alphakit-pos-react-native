"use client"

import { createStackNavigator } from "@react-navigation/stack"
import { useAuth } from "../contexts/AuthContext"
import { AuthStack } from "./AuthStack"
import { POSStack } from "./POSStack"

const Stack = createStackNavigator()

export const AppNavigation = () => {
  const { isAuthenticated } = useAuth()

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : (
        <Stack.Screen name="POS" component={POSStack} />
      )}
    </Stack.Navigator>
  )
}
