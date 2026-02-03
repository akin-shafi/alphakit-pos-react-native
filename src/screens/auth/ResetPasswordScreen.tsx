

import React, { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback } from "react-native"
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native"
import { Colors } from "../../constants/Colors"
import { Input } from "../../components/Input"
import { Button } from "../../components/Button"
import { Ionicons } from "@expo/vector-icons"
import { AuthService } from "../../services/AuthService"
import { Toast } from "../../components/Toast"
import { OTPInput } from "../../components/OTPInput"
import { PasswordStrengthMeter } from "../../components/PasswordStrengthMeter"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { AuthStackParamList } from "../../navigation/AuthStack"

type ScreenRouteProp = RouteProp<AuthStackParamList, "ResetPassword">
type ScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, "ResetPassword">

export const ResetPasswordScreen = () => {
    const navigation = useNavigation<ScreenNavigationProp>()
    const route = useRoute<ScreenRouteProp>()
    const { email } = route.params

    const [step, setStep] = useState<1 | 2>(1) // 1: OTP, 2: New Password
    const [otp, setOtp] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState<{ visible: boolean; message: string; type: "success" | "error" }>({ visible: false, message: "", type: "error" })

    // Step 1: Verify OTP
    const handleVerifyOTP = async (code: string) => {
        setLoading(true)
        try {
            await AuthService.verifyResetOTP(email, code)
            setOtp(code)
            setToast({ visible: true, message: "Code verified", type: "success" })
            setStep(2)
        } catch (err: any) {
             setToast({ visible: true, message: err.response?.data?.error || "Invalid code", type: "error" })
        } finally {
            setLoading(false)
        }
    }

    // Step 2: Reset Password
    const handleResetPassword = async () => {
        if (!password || password.length < 4) { // Basic validation, meter handles visual
            setToast({ visible: true, message: "Password is too short", type: "error" })
            return
        }
        if (password !== confirmPassword) {
            setToast({ visible: true, message: "Passwords do not match", type: "error" })
            return
        }

        setLoading(true)
        try {
            await AuthService.resetPassword(email, otp, password)
            setToast({ visible: true, message: "Password reset successfully", type: "success" })
            
            setTimeout(() => {
                navigation.navigate("Login")
            }, 1000)
        } catch (err: any) {
            setToast({ visible: true, message: err.response?.data?.error || "Failed to reset password", type: "error" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.inner}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>{step === 1 ? "Verification Code" : "New Password"}</Text>
                        <Text style={styles.subtitle}>
                            {step === 1 
                                ? `Enter the code sent to ${email}` 
                                : "Create a new strong password for your account"}
                        </Text>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {step === 1 && (
                            <View style={styles.stepContainer}>
                                <OTPInput 
                                    length={6} 
                                    onComplete={handleVerifyOTP} 
                                    resendEnabled 
                                    onResend={async () => {
                                        await AuthService.forgotPassword(email)
                                        setToast({ visible: true, message: "Code resent", type: "success" })
                                    }}
                                />
                            </View>
                        )}

                        {step === 2 && (
                            <View style={styles.form}>
                                <Input
                                    label="New Password"
                                    placeholder="Enter new password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                                <PasswordStrengthMeter password={password} />
                                
                                <Input
                                    label="Confirm Password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                />

                                <Button
                                    title="Reset Password"
                                    onPress={handleResetPassword}
                                    loading={loading}
                                    disabled={loading}
                                    variant="primary"
                                    style={{ marginTop: 24 }}
                                />
                            </View>
                        )}
                    </ScrollView>

                    <Toast 
                        visible={toast.visible} 
                        message={toast.message} 
                        type={toast.type} 
                        onHide={() => setToast({ ...toast, visible: false })} 
                    />
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    inner: {
        flex: 1,
        padding: 24,
        paddingTop: 60,
    },
    backButton: {
        marginBottom: 20,
        width: 40,
        height: 40,
        justifyContent: "center",
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: Colors.gray900,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.gray600,
        lineHeight: 24,
    },
    stepContainer: {
        alignItems: "center",
    },
    form: {
        gap: 16,
    },
})
