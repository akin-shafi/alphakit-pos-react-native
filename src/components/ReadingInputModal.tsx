import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Input } from './Input';
import { Button } from './Button';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface ReadingInputModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reading: number) => void;
  onSkip: () => void;
}

export const ReadingInputModal: React.FC<ReadingInputModalProps> = ({ visible, onClose, onSubmit, onSkip }) => {
    const [reading, setReading] = useState('');

    useEffect(() => {
        if (visible) {
            setReading('');
        }
    }, [visible]);

    const handleSubmit = () => {
        const val = parseFloat(reading);
        if (!isNaN(val)) {
            onSubmit(val);
            setReading('');
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Pump Reading</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={Colors.gray500} />
                        </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.subtitle}>Enter the closing reading from the main pump/meter.</Text>

                    <Input 
                        label="Closing Reading"
                        value={reading}
                        onChangeText={setReading}
                        keyboardType="numeric"
                        placeholder="e.g. 12500.5"
                        autoFocus
                    />

                    <View style={styles.buttonRow}>
                        <Button 
                            title="Skip" 
                            onPress={onSkip} 
                            variant="outline" 
                            style={styles.button} 
                        />
                        <Button 
                            title="Submit" 
                            onPress={handleSubmit} 
                            style={styles.button} 
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
    subtitle: {
        fontSize: 14,
        color: Colors.gray600,
        marginBottom: 24,
        lineHeight: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    button: {
        flex: 1,
    }
});
