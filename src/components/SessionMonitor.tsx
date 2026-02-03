// src/components/SessionMonitor.tsx

import React, { useRef } from "react";
import { View, PanResponder, StyleSheet } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export const SessionMonitor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { resetInactivityTimer, isAuthenticated } = useAuth();

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        if (isAuthenticated) {
          resetInactivityTimer();
        }
        return false; // Don't capture, just observe
      },
      onMoveShouldSetPanResponderCapture: () => {
        if (isAuthenticated) {
          resetInactivityTimer();
        }
        return false;
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
