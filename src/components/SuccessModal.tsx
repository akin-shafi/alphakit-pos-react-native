import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Modal, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "./Button";
import { Colors } from "../constants/Colors";

interface SuccessModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText: string;
  onPress: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  title,
  message,
  buttonText,
  onPress,
}) => {
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      scaleValue.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Animated.View
            style={[styles.iconContainer, { transform: [{ scale: scaleValue }] }]}
          >
            <View style={styles.circle}>
              <Ionicons name="checkmark" size={50} color={Colors.white} />
            </View>
          </Animated.View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <Button
            title={buttonText}
            onPress={onPress}
            style={styles.button}
            fullWidth
            primaryColor={Colors.teal}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 20,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.teal,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.gray900,
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: Colors.gray600,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    marginTop: 10,
  },
});
