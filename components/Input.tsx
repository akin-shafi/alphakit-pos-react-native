"use client"

import type React from "react"
import { useState } from "react"
import { View, TextInput, Text, StyleSheet, type TextInputProps, type ViewStyle } from "react-native"
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

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, isFocused && styles.inputFocused, error && styles.inputError, inputStyle]}
        placeholderTextColor={Colors.gray400}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.gray700,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: Typography.base,
    color: Colors.gray900,
    minHeight: 52,
  },
  inputFocused: {
    borderColor: Colors.black,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: Typography.sm,
    color: Colors.error,
    marginTop: 4,
  },
})
