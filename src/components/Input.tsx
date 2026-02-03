

import type React from "react"
import { useState } from "react"
import { View, TextInput, Text, StyleSheet, type TextInputProps, type ViewStyle, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../constants/Colors"
import { Typography } from "../constants/Typography"

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  containerStyle?: ViewStyle
  inputStyle?: ViewStyle
}

export const Input: React.FC<InputProps> = ({ label, error, containerStyle, inputStyle, ...props }) => {
  const [isFocused, setIsFocused] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, isFocused && styles.inputFocused, error && styles.inputError, inputStyle]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.gray400}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
          secureTextEntry={props.secureTextEntry && !isPasswordVisible}
        />
        {props.secureTextEntry && (
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={24}
              color={Colors.gray500}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.gray700,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.gray900,
    paddingVertical: 14,
  },
  inputFocused: {
    borderColor: Colors.black,
  },
  inputError: {
    borderColor: Colors.error,
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: Typography.sm,
    color: Colors.error,
    marginTop: 4,
  },
})
