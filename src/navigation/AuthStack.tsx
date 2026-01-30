import { createStackNavigator } from "@react-navigation/stack"
import { SplashScreen } from "../screens/auth/SplashScreen"
import { WelcomeScreen } from "../screens/auth/WelcomeScreen"
import { OnboardingScreen } from "../screens/auth/OnboardingScreen"
import { LoginEmailScreen } from "../screens/auth/LoginEmailScreen"

const Stack = createStackNavigator()

export const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginEmailScreen} />
    </Stack.Navigator>
  )
}
