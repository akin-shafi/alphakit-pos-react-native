import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Colors } from "../constants/Colors";

interface PasswordStrengthMeterProps {
  password?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password = "",
}) => {
  const [strength, setStrength] = useState(0);
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(Colors.gray300);

  useEffect(() => {
    const calculateStrength = (pwd: string) => {
      if (!pwd) return 0;
      let score = 0;
      if (pwd.length > 6) score++;
      if (pwd.length > 10) score++;
      if (/[A-Z]/.test(pwd)) score++;
      if (/[0-9]/.test(pwd)) score++;
      if (/[^A-Za-z0-9]/.test(pwd)) score++;
      return Math.min(score, 5); // 0-5
    };

    const score = calculateStrength(password);
    setStrength(score);

    switch (score) {
      case 0:
      case 1:
        setLabel("Weak");
        setColor(Colors.error);
        break;
      case 2:
        setLabel("Fair");
        setColor("#f39c12"); // Orange
        break;
      case 3:
        setLabel("Good");
        setColor("#3498db"); // Blue
        break;
      case 4:
      case 5:
        setLabel("Strong");
        setColor(Colors.teal);
        break;
      default:
        setLabel("");
        setColor(Colors.gray300);
    }
  }, [password]);

  if (!password) return null;

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        {[1, 2, 3, 4, 5].map((index) => (
          <View
            key={index}
            style={[
              styles.bar,
              {
                backgroundColor: index <= strength ? color : Colors.gray200,
                flex: 1,
                marginRight: index < 5 ? 4 : 0,
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 16,
  },
  barContainer: {
    flexDirection: "row",
    height: 4,
    width: "100%",
    borderRadius: 2,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
    textAlign: "right",
  },
});
