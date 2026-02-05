import { createStackNavigator } from "@react-navigation/stack"
import { SplashScreen } from "../screens/auth/SplashScreen"
import { WelcomeScreen } from "../screens/auth/WelcomeScreen"
import { OnboardingScreen } from "../screens/auth/OnboardingScreen"
import { LoginEmailScreen } from "../screens/auth/LoginEmailScreen"
import { OTPVerificationScreen } from "../screens/auth/OTPVerificationScreen"
import { ForgotPasswordScreen } from "../screens/auth/ForgotPasswordScreen"
import { ResetPasswordScreen } from "../screens/auth/ResetPasswordScreen"

export type AuthStackParamList = {
  Splash: undefined
  Welcome: undefined
  Onboarding: undefined
  Login: undefined
  OTPVerification: { email: string; password?: string }
  ForgotPassword: undefined
  ResetPassword: { email: string }
}

const Stack = createStackNavigator<AuthStackParamList>()

export const AuthStack = () => {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginEmailScreen} />
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  )
}
