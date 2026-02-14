import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Input } from './Input';
import { Button } from './Button';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface GasSaleModalProps {
  visible: boolean;
  onClose: () => void;
  onAddToCart: (quantity: number) => void;
  pricePerUnit: number; // Price per 10g usually
}

export const GasSaleModal: React.FC<GasSaleModalProps> = ({ visible, onClose, onAddToCart, pricePerUnit }) => {
  const [amount, setAmount] = useState('');
  const [weight, setWeight] = useState('');

  // Reset fields when opening
  useEffect(() => {
    if (visible) {
        setAmount('');
        setWeight('');
    }
  }, [visible]);

  // 1 unit = 10g
  // 1kg = 1000g = 100 units
  // Price is per unit (10g)

  const handleAmountChange = (text: string) => {
    setAmount(text);
    const val = parseFloat(text);
    if (!isNaN(val) && pricePerUnit > 0) {
      // Amount -> Units: val / pricePerUnit
      // Units -> Weight (kg): units * 10 / 1000 = units * 0.01
      const units = val / pricePerUnit;
      const kg = units * 0.01;
      // We format to 2 decimals for display, but keep precision maybe?
      // Text inputs usually better with fixed decimals to avoid jumping
      setWeight(kg.toFixed(2));
    } else {
        setWeight('');
    }
  };

  const handleWeightChange = (text: string) => {
    setWeight(text);
    const val = parseFloat(text);
    if (!isNaN(val)) {
      // Weight (kg) -> Units: (val * 1000) / 10 = val * 100
      const units = val * 100;
      const amt = units * pricePerUnit;
      setAmount(amt.toFixed(2));
    } else {
        setAmount('');
    }
  };

  const handleSubmit = () => {
      // Calculate quantity based on Amount to ensure price match
      const val = parseFloat(amount);
      if (!isNaN(val) && val > 0 && pricePerUnit > 0) {
          const quantity = Math.floor(val / pricePerUnit);
          if (quantity > 0) {
              onAddToCart(quantity);
              onClose();
          }
      } else {
        // Fallback to weight calculation if amount is empty/invalid but weight is there?
        // Usually amount is the source of truth for POS sales to match money collected
        // But if user entered 12.5kg, calculate exact price.
        const w = parseFloat(weight);
        if (!isNaN(w) && w > 0) {
             const quantity = Math.round(w * 100);
             if (quantity > 0) {
                 onAddToCart(quantity);
                 onClose();
             }
        }
      }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Gas Sale Calculator</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color={Colors.gray500} />
                    </TouchableOpacity>
                </View>
                
                <Text style={styles.rateText}>Rate: ₦{pricePerUnit} / 10g</Text>

                <Input 
                    label="Amount (₦)"
                    value={amount}
                    onChangeText={handleAmountChange}
                    keyboardType="numeric"
                    placeholder="e.g. 5000"
                />

                <Input 
                    label="Weight (kg)"
                    value={weight}
                    onChangeText={handleWeightChange}
                    keyboardType="numeric"
                    placeholder="e.g. 12.5"
                />

                <View style={styles.buttonRow}>
                    <Button 
                        title="Cancel" 
                        onPress={onClose} 
                        variant="outline" 
                        style={styles.cancelButton} 
                    />
                    <Button 
                        title="Add to Cart" 
                        onPress={handleSubmit} 
                        style={styles.submitButton} 
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
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.gray900,
    },
    rateText: {
        fontSize: 14,
        color: Colors.gray500,
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
    },
    submitButton: {
        flex: 1,
    }
});
