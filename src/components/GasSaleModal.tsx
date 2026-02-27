import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Input } from './Input';
import { Button } from './Button';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface GasSaleModalProps {
  visible: boolean;
  onClose: () => void;
  onAddToCart: (kgQty: number, pricePerKg: number) => void;
  pricePerKg: number; // Price per KG (e.g., 1100)
  availableStock?: number; // Stock in KG directly
  productName?: string;
  currency?: string;
}

export const GasSaleModal: React.FC<GasSaleModalProps> = ({ 
  visible, 
  onClose, 
  onAddToCart, 
  pricePerKg,
  availableStock = 0,
  productName = "Gas Refill",
  currency = "₦"
}) => {
  const [amount, setAmount] = useState('');
  const [weight, setWeight] = useState('');
  const availableKg = availableStock; // Stock IS in KG directly

  useEffect(() => {
    if (visible) {
        setAmount('');
        setWeight('');
    }
  }, [visible]);

  const handleAmountChange = (text: string) => {
    setAmount(text);
    const val = parseFloat(text);
    if (!isNaN(val) && pricePerKg > 0) {
      const kg = val / pricePerKg;
      setWeight(kg.toFixed(2));
    } else {
        setWeight('');
    }
  };

  const handleWeightChange = (text: string) => {
    setWeight(text);
    const val = parseFloat(text);
    if (!isNaN(val)) {
      const amt = val * pricePerKg;
      setAmount(amt.toFixed(2));
    } else {
        setAmount('');
    }
  };

  const setPresetWeight = (w: number) => {
    setWeight(w.toString());
    const amt = w * pricePerKg;
    setAmount(amt.toFixed(2));
  };

  const handleSubmit = () => {
      const w = parseFloat(weight);
      if (!isNaN(w) && w > 0) {
           if (w > availableKg) {
               return; 
           }
           onAddToCart(w, pricePerKg);
           onClose();
      }
  };

  const presets = [0.5, 1, 2, 3, 5, 6, 12.5, 25];
  const isOverStock = (parseFloat(weight) || 0) > availableKg;

  return (
    <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>{productName}</Text>
                        <Text style={styles.subtitle}>Sale Calculator</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={Colors.gray500} />
                    </TouchableOpacity>
                </View>

                <View style={styles.rateCard}>
                    <View>
                        <Text style={styles.rateLabel}>RATE PER KG</Text>
                        <Text style={styles.rateValue}>{currency}{pricePerKg.toLocaleString()}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View>
                        <Text style={styles.rateLabel}>STOCK</Text>
                        <Text style={styles.rateValue}>{availableKg.toLocaleString()}kg</Text>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={styles.sectionLabel}>QUICK SELECT</Text>
                    <View style={styles.presetsGrid}>
                        {presets.map(w => (
                            <TouchableOpacity 
                                key={w} 
                                disabled={w > availableKg}
                                onPress={() => setPresetWeight(w)}
                                style={[
                                    styles.presetChip,
                                    parseFloat(weight) === w && styles.presetChipActive,
                                    (w > availableKg) && styles.presetChipDisabled
                                ]}
                            >
                                <Text style={[
                                    styles.presetText,
                                    parseFloat(weight) === w && styles.presetTextActive
                                ]}>{w}kg</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.inputsContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Weight (KG)</Text>
                            <View style={[styles.inputWrapper, isOverStock && styles.inputWrapperError]}>
                                <Input 
                                    value={weight}
                                    onChangeText={handleWeightChange}
                                    keyboardType="numeric"
                                    placeholder="0.00"
                                    containerStyle={{marginBottom: 0}}
                                    inputStyle={styles.bigInput}
                                />
                                <Text style={styles.inputUnit}>kg</Text>
                            </View>
                            {isOverStock && (
                                <Text style={styles.errorText}>Insufficient stock available</Text>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Total Price ({currency})</Text>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.currencyPrefix}>{currency}</Text>
                                <Input 
                                    value={amount}
                                    onChangeText={handleAmountChange}
                                    keyboardType="numeric"
                                    placeholder="0.00"
                                    containerStyle={{marginBottom: 0}}
                                    inputStyle={[styles.bigInput, {paddingLeft: 42}]}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <Button 
                        title="Cancel" 
                        onPress={onClose} 
                        variant="outline" 
                        style={styles.cancelBtn} 
                    />
                    <Button 
                        title="Add to Sale" 
                        onPress={handleSubmit} 
                        disabled={isOverStock || !weight || parseFloat(weight) <= 0}
                        primaryColor={Colors.teal}
                        style={styles.submitBtn} 
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
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.gray900,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.teal,
        fontWeight: '600',
    },
    closeButton: {
        padding: 8,
        backgroundColor: Colors.gray100,
        borderRadius: 20,
    },
    rateCard: {
        flexDirection: 'row',
        backgroundColor: Colors.tealLight,
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    rateLabel: {
        fontSize: 10,
        color: Colors.teal,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    rateValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.gray900,
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(0,128,128,0.1)',
        marginHorizontal: 20,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: Colors.gray400,
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    presetsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    presetChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.gray200,
        minWidth: '22%',
        alignItems: 'center',
    },
    presetChipActive: {
        backgroundColor: Colors.teal,
        borderColor: Colors.teal,
    },
    presetChipDisabled: {
        opacity: 0.3,
    },
    presetText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: Colors.gray700,
    },
    presetTextActive: {
        color: Colors.white,
    },
    inputsContainer: {
        gap: 20,
        marginBottom: 30,
    },
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.gray700,
    },
    inputWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    inputWrapperError: {
        borderColor: Colors.error,
    },
    bigInput: {
        height: 64,
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.gray900,
        backgroundColor: Colors.gray50,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: Colors.gray200,
        paddingHorizontal: 16,
    },
    inputUnit: {
        position: 'absolute',
        right: 16,
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.gray400,
    },
    currencyPrefix: {
        position: 'absolute',
        left: 16,
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.gray400,
        zIndex: 2,
    },
    errorText: {
        color: Colors.error,
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 4,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    cancelBtn: {
        flex: 1,
    },
    submitBtn: {
        flex: 1,
    }
});
