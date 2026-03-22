import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { Typography } from "../constants/Typography";
import { formatCurrency } from "../utils/Formatter";
import { Button } from "./Button";
import type { PaymentConfig } from "../types";

interface PaymentInfo {
  method: string;
  amount: number;
  terminal_provider?: string | null;
}

interface SplitPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (payments: PaymentInfo[]) => void;
  total: number;
  currency: string;
  config: PaymentConfig;
  primaryColor: string;
}

export const SplitPaymentModal: React.FC<SplitPaymentModalProps> = ({
  visible,
  onClose,
  onConfirm,
  total,
  currency,
  config,
  primaryColor,
}) => {
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [currentAmount, setCurrentAmount] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("cash");
  const [selectedProvider, setSelectedProvider] = useState<string>("moniepoint");

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, total - totalPaid);

  useEffect(() => {
    if (visible) {
      setPayments([]);
      setCurrentAmount(total.toString());
      setSelectedMethod("cash");
    }
  }, [visible, total]);

  const addPayment = () => {
    const amount = parseFloat(currentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount to pay.");
      return;
    }

    if (amount > remaining + 0.01) {
      Alert.alert("Amount Exceeded", "The amount exceeds the remaining balance.");
      return;
    }

    setPayments([...payments, {
      method: selectedMethod,
      amount,
      terminal_provider: (selectedMethod === "external-terminal" || selectedMethod === "transfer") ? selectedProvider : null
    }]);

    const newRemaining = remaining - amount;
    setCurrentAmount(newRemaining > 0 ? newRemaining.toString() : "0");
  };

  const removePayment = (index: number) => {
    const p = payments[index];
    setPayments(payments.filter((_, i) => i !== index));
    setCurrentAmount((remaining + p.amount).toString());
  };

  const handleFinish = () => {
    if (totalPaid < total - 0.01) {
      Alert.alert("Incomplete Payment", "Please fulfill the full order total before finishing.");
      return;
    }
    onConfirm(payments);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Split Payment</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.gray600} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Balance Card */}
            <View style={styles.balanceCard}>
                <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Order Total</Text>
                    <Text style={styles.balanceValue}>{formatCurrency(total, currency)}</Text>
                </View>
                <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Total Paid</Text>
                    <Text style={[styles.balanceValue, { color: Colors.success }]}>{formatCurrency(totalPaid, currency)}</Text>
                </View>
                <View style={[styles.balanceRow, styles.remainingRow]}>
                    <Text style={styles.remainingLabel}>Remaining</Text>
                    <Text style={styles.remainingValue}>{formatCurrency(remaining, currency)}</Text>
                </View>
            </View>

            {/* Added Payments List */}
            <View style={styles.paymentsList}>
                <Text style={styles.sectionTitle}>Payments Added</Text>
                {payments.length === 0 ? (
                    <Text style={styles.emptyText}>No payments added yet</Text>
                ) : (
                    payments.map((p, i) => (
                        <View key={i} style={styles.paymentItem}>
                            <View style={styles.paymentInfo}>
                                <Text style={styles.paymentMethod}>{p.method.toUpperCase()}</Text>
                                {p.terminal_provider && <Text style={styles.providerInfo}>{p.terminal_provider}</Text>}
                            </View>
                            <View style={styles.paymentAction}>
                                <Text style={styles.paymentAmount}>{formatCurrency(p.amount, currency)}</Text>
                                <TouchableOpacity onPress={() => removePayment(i)} style={styles.removeBtn}>
                                    <Ionicons name="trash-outline" size={18} color={Colors.error} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </View>

            {/* Manual Entry */}
            {remaining > 0 && (
                <View style={styles.entrySection}>
                    <Text style={styles.sectionTitle}>Add New Payment</Text>
                    
                    <View style={styles.methodToggle}>
                        {['cash', 'card', 'transfer', 'external-terminal'].map(m => (
                            config.enabledMethods[m === 'card' ? 'card' : m === 'external-terminal' ? 'externalTerminal' : m] && (
                                <TouchableOpacity 
                                    key={m}
                                    onPress={() => setSelectedMethod(m)}
                                    style={[
                                        styles.methodBtn, 
                                        selectedMethod === m && { backgroundColor: primaryColor, borderColor: primaryColor }
                                    ]}
                                >
                                    <Text style={[styles.methodBtnText, selectedMethod === m && { color: Colors.white }]}>
                                        {m === 'external-terminal' ? 'POS' : m.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            )
                        ))}
                    </View>

                    {(selectedMethod === 'external-terminal' || selectedMethod === 'transfer') && (
                        <View style={styles.providerToggle}>
                            {config.externalTerminalProviders.map(prov => (
                                <TouchableOpacity 
                                    key={prov}
                                    onPress={() => setSelectedProvider(prov)}
                                    style={[
                                        styles.providerBtn, 
                                        selectedProvider === prov && { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                                    ]}
                                >
                                    <Text style={[styles.providerBtnText, selectedProvider === prov && { color: primaryColor }]}>
                                        {prov.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <TextInput 
                            style={styles.input}
                            value={currentAmount}
                            onChangeText={setCurrentAmount}
                            keyboardType="numeric"
                            placeholder="Amount"
                        />
                        <TouchableOpacity 
                            onPress={addPayment}
                            style={[styles.addBtn, { backgroundColor: primaryColor }]}
                        >
                            <Ionicons name="add" size={24} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Button 
                title={remaining > 0.01 ? `Fulfill ${formatCurrency(remaining, currency)}` : "Complete Split Payment"}
                onPress={handleFinish}
                disabled={totalPaid < total - 0.01}
                fullWidth
                primaryColor={primaryColor}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  title: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  balanceCard: {
    backgroundColor: Colors.gray50,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  balanceLabel: {
    color: Colors.gray600,
  },
  balanceValue: {
    fontWeight: Typography.bold,
  },
  remainingRow: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    paddingTop: 8,
  },
  remainingLabel: {
    fontWeight: Typography.bold,
    fontSize: Typography.lg,
  },
  remainingValue: {
    fontWeight: Typography.bold,
    fontSize: Typography.lg,
    color: Colors.warning,
  },
  sectionTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.gray500,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  paymentsList: {
    marginBottom: 24,
  },
  emptyText: {
    textAlign: "center",
    color: Colors.gray400,
    marginVertical: 12,
  },
  paymentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray100,
    marginBottom: 8,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentMethod: {
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  providerInfo: {
    fontSize: Typography.xs,
    color: Colors.gray500,
  },
  paymentAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentAmount: {
    fontWeight: Typography.bold,
  },
  removeBtn: {
    padding: 4,
  },
  entrySection: {
    backgroundColor: Colors.gray50,
    padding: 16,
    borderRadius: 16,
    marginBottom: 40,
  },
  methodToggle: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  methodBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray200,
    backgroundColor: Colors.white,
  },
  methodBtnText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.gray600,
  },
  providerToggle: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  providerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  providerBtnText: {
    fontSize: 10,
    fontWeight: Typography.bold,
    color: Colors.gray500,
  },
  inputGroup: {
    flexDirection: "row",
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  addBtn: {
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
});
