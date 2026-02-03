import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { Colors } from "../constants/Colors";
import { Typography } from "../constants/Typography";

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  error?: string;
  resendEnabled?: boolean;
  onResend?: () => void;
  onChange?: (code: string) => void;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  error,
  resendEnabled = false,
  onResend,
  onChange,
}) => {
  const [code, setCode] = useState<string[]>(new Array(length).fill(""));
  const inputs = useRef<TextInput[]>([]);
  const [timer, setTimer] = useState(60); 

  useEffect(() => {
    // optional: start focus on first input
    // setTimeout(() => inputs.current[0]?.focus(), 100);
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChangeText = (text: string, index: number) => {
    // Handle paste? Simple version first.
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (onChange) onChange(newCode.join(""));

    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
    
    // Check completion
    const fullCode = newCode.join("");
    if (fullCode.length === length) {
        onComplete(fullCode);
        Keyboard.dismiss();
    }
  };

  // Handle backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (timer === 0 && onResend) {
        setTimer(60);
        onResend();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              if (ref) inputs.current[index] = ref;
            }}
            style={[
              styles.input,
              error ? styles.inputError : null,
              digit ? styles.inputFilled : null,
            ]}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            returnKeyType="done"
          />
        ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      {/* Resend Logic */}
      <View style={styles.resendContainer}> 
         <Text style={styles.resendText}>
            Did not receive code?{" "}
         </Text>
         <TouchableOpacity disabled={timer > 0} onPress={handleResend}>
             <Text style={[styles.resendLink, timer > 0 && styles.resendDisabled]}>
                 {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
             </Text>
         </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 20,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Adjust spacing
    width: "100%",
    maxWidth: 350,
  },
  input: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderRadius: 10,
    fontSize: 24,
    textAlign: "center",
    backgroundColor: Colors.white,
    color: Colors.gray900,
    fontWeight: "bold",
  },
  inputFilled: {
    borderColor: Colors.teal,
    backgroundColor: "#f0fbfb",
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 10,
  },
  resendContainer: {
      flexDirection: 'row',
      marginTop: 20,
  },
  resendText: {
      color: Colors.gray600,
  },
  resendLink: {
      color: Colors.teal,
      fontWeight: '600',
  },
  resendDisabled: {
      color: Colors.gray400,
  }
});
