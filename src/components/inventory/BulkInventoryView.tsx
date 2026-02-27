import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { formatCurrency } from '../../utils/Formatter';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import apiClient from '../../services/ApiClient';
import type { Product } from '../../types';

interface BulkInventoryViewProps {
  products: Product[];
  activeRounds: any[];
  business: any;
  inventoryLoading: boolean;
  onRefresh: () => void;
  canManage: boolean;
}

export const BulkInventoryView: React.FC<BulkInventoryViewProps> = ({
  products,
  activeRounds,
  business,
  inventoryLoading,
  onRefresh,
  canManage
}) => {
  const [restockModalVisible, setRestockModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    volume: '',
    cost: ''
  });

  const bulkProducts = products.filter(p => p.track_by_round);

  const handleRestock = async () => {
    if (!formData.productId || !formData.volume || !formData.cost) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/inventory/rounds', {
        product_id: parseInt(formData.productId),
        total_volume: parseFloat(formData.volume),
        cost: parseFloat(formData.cost)
      });
      Alert.alert("Success", "Restock successful");
      setRestockModalVisible(false);
      onRefresh();
    } catch (e) {
      Alert.alert("Error", "Failed to restock");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseRound = async (id: number) => {
    Alert.alert("Close Round", "Are you sure you want to close this batch? No further sales will deduct from it.", [
      { text: "Cancel", style: "cancel" },
      { text: "Close", style: "destructive", onPress: async () => {
        try {
          await apiClient.post(`/inventory/rounds/${id}/close`);
          onRefresh();
        } catch (e) {
          Alert.alert("Error", "Failed to close round");
        }
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={activeRounds}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const product = products.find(p => p.id === item.product_id);
          const percentage = (item.remaining_volume / item.total_volume) * 100;
          return (
            <View style={styles.roundCard}>
              <View style={styles.roundHeader}>
                <View>
                  <Text style={styles.productName}>{product?.name || 'Bulk LPG'}</Text>
                  <Text style={styles.batchInfo}>Batch #{item.id} • Started {new Date(item.start_date).toLocaleDateString()}</Text>
                </View>
                {canManage && (
                  <TouchableOpacity onPress={() => handleCloseRound(item.id)}>
                    <Text style={styles.closeAction}>Close</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.progressContainer}>
                <View style={[styles.progressBarBg, { backgroundColor: Colors.gray100 }]}>
                   <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: percentage < 15 ? Colors.error : Colors.teal }]} />
                </View>
                <View style={styles.progressLabels}>
                   <Text style={styles.progressText}>{item.remaining_volume.toFixed(2)} / {item.total_volume.toFixed(2)} {product?.unit_of_measure || 'Tons'}</Text>
                   <Text style={[styles.percentageText, { color: percentage < 15 ? Colors.error : Colors.teal }]}>{percentage.toFixed(1)}%</Text>
                </View>
              </View>
            </View>
          );
        }}
        ListHeaderComponent={
          <>
            <View style={styles.summaryBox}>
                <Text style={styles.summaryLabel}>Currently Available Stock</Text>
                <Text style={styles.summaryValue}>
                    {activeRounds.reduce((acc, r) => acc + r.remaining_volume, 0).toFixed(2)} 
                    <Text style={{ fontSize: 16 }}> {bulkProducts[0]?.unit_of_measure || 'Tons'}</Text>
                </Text>
            </View>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Supply Batches</Text>
                {canManage && (
                    <TouchableOpacity style={styles.addBtn} onPress={() => setRestockModalVisible(true)}>
                        <Ionicons name="add" size={20} color={Colors.white} />
                        <Text style={styles.addBtnText}>New Intake</Text>
                    </TouchableOpacity>
                )}
            </View>
          </>
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={inventoryLoading}
            onRefresh={onRefresh}
            colors={[Colors.teal]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
             <Ionicons name="flash-outline" size={64} color={Colors.gray200} />
             <Text style={styles.emptyTitle}>Empty Surplus</Text>
             <Text style={styles.emptyText}>Add your first bulk stock batch to start tracking your {business?.type === 'LPG_STATION' ? 'LPG' : 'Bulk'} inventory.</Text>
          </View>
        }
      />

      <Modal visible={restockModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>New Stock Intake</Text>
                    <TouchableOpacity onPress={() => setRestockModalVisible(false)}>
                        <Ionicons name="close" size={24} color={Colors.gray500} />
                    </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                    <Text style={styles.label}>Select Product</Text>
                    {bulkProducts.map(p => (
                        <TouchableOpacity 
                            key={p.id}
                            style={[styles.productOption, formData.productId === p.id.toString() && styles.productOptionActive]}
                            onPress={() => setFormData({...formData, productId: p.id.toString()})}
                        >
                            <Text style={[styles.productOptionText, formData.productId === p.id.toString() && styles.productOptionTextActive]}>{p.name}</Text>
                            {formData.productId === p.id.toString() && <Ionicons name="checkmark-circle" size={20} color={Colors.teal} />}
                        </TouchableOpacity>
                    ))}

                    <Input 
                        label="Quantity (In Tons/Liters)"
                        placeholder="0.00"
                        value={formData.volume}
                        onChangeText={(t) => setFormData({...formData, volume: t})}
                        keyboardType="decimal-pad"
                    />

                    <Input 
                        label="Purchase Total Cost"
                        placeholder="0.00"
                        value={formData.cost}
                        onChangeText={(t) => setFormData({...formData, cost: t})}
                        keyboardType="decimal-pad"
                    />

                    <Button 
                        title="Confirm Intake"
                        onPress={handleRestock}
                        loading={loading}
                        style={{ marginTop: 24 }}
                    />
                </View>
            </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryBox: {
      backgroundColor: Colors.teal,
      padding: 24,
      borderRadius: 24,
      marginBottom: 32,
      shadowColor: Colors.teal,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 5,
  },
  summaryLabel: {
      color: 'rgba(255,255,255,0.7)',
      fontWeight: '700',
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 8,
  },
  summaryValue: {
      color: Colors.white,
      fontSize: 32,
      fontWeight: '900',
  },
  sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: Colors.gray900,
  },
  addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.teal + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      gap: 4,
  },
  addBtnText: {
      color: Colors.teal,
      fontWeight: '800',
      fontSize: 12,
  },
  roundCard: {
      backgroundColor: Colors.white,
      borderRadius: 24,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: Colors.gray100,
  },
  roundHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
  },
  productName: {
      fontSize: 16,
      fontWeight: '800',
      color: Colors.gray900,
      marginBottom: 2,
  },
  batchInfo: {
      fontSize: 12,
      color: Colors.gray400,
      fontWeight: '500',
  },
  closeAction: {
      color: Colors.error,
      fontWeight: '800',
      fontSize: 12,
      textTransform: 'uppercase',
  },
  progressContainer: {
      marginTop: 8,
  },
  progressBarBg: {
      height: 12,
      borderRadius: 6,
      overflow: 'hidden',
      marginBottom: 8,
  },
  progressBar: {
      height: '100%',
      borderRadius: 6,
  },
  progressLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
  progressText: {
      fontSize: 12,
      color: Colors.gray700,
      fontWeight: '700',
  },
  percentageText: {
      fontSize: 12,
      fontWeight: '900',
  },
  empty: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 60,
  },
  emptyTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: Colors.gray900,
      marginTop: 20,
  },
  emptyText: {
      fontSize: 14,
      color: Colors.gray500,
      textAlign: 'center',
      marginTop: 8,
      paddingHorizontal: 40,
      lineHeight: 20,
  },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
  },
  modalContent: {
      backgroundColor: Colors.white,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: 24,
      maxHeight: '80%',
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
  },
  modalTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: Colors.gray900,
  },
  modalBody: {
      gap: 16,
  },
  label: {
      fontSize: 12,
      fontWeight: '800',
      color: Colors.gray500,
      textTransform: 'uppercase',
      marginBottom: 4,
  },
  productOption: {
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: Colors.gray100,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
  },
  productOptionActive: {
      borderColor: Colors.teal,
      backgroundColor: Colors.teal + '05',
  },
  productOptionText: {
      fontSize: 14,
      fontWeight: '700',
      color: Colors.gray700,
  },
  productOptionTextActive: {
      color: Colors.teal,
  }
});
