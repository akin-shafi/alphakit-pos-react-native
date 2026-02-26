
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl, 
  Modal, 
  TextInput, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { ExpenseService, Expense } from '../../services/ExpenseService';
import { formatCurrency } from '../../utils/Formatter';

export const ExpensesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { business } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // New Expense form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Utilities');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = ['Utilities', 'Rent', 'Salaries', 'Inventory Purchase', 'Repairs', 'Marketing', 'Tax', 'Other'];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const start = new Date();
      start.setMonth(now.getMonth() - 1);
      
      const data = await ExpenseService.getExpenses(
        start.toISOString().split('T')[0],
        now.toISOString().split('T')[0]
      );
      setExpenses(data || []);
    } catch (error) {
      console.error('Failed to fetch expenses', error);
      Alert.alert('Error', 'Could not load expenses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddExpense = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      await ExpenseService.createExpense({
        amount: parseFloat(amount),
        category,
        description,
        date
      });
      
      setIsModalVisible(false);
      setAmount('');
      setDescription('');
      fetchExpenses();
      Alert.alert('Success', 'Expense recorded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save expense');
    }
  };

  const handleDeleteExpense = (id: number) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await ExpenseService.deleteExpense(id);
              fetchExpenses();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete expense');
            }
          }
        }
      ]
    );
  };

  const totalMonthlyExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expenses</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchExpenses(); }} colors={[Colors.teal]} />
        }
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Expenses (30 Days)</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalMonthlyExpenses, business?.currency)}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="add" size={20} color={Colors.white} />
            <Text style={styles.addButtonText}>Add New</Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={Colors.teal} style={{ marginTop: 40 }} />
        ) : expenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={Colors.gray200} />
            <Text style={styles.emptyText}>No expenses recorded yet</Text>
          </View>
        ) : (
          expenses.map((exp) => (
            <View key={exp.id} style={styles.expenseItem}>
              <View style={styles.expenseInfo}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{exp.category}</Text>
                </View>
                <Text style={styles.expenseDescription}>{exp.description || 'No description'}</Text>
                <Text style={styles.expenseDate}>{new Date(exp.date).toLocaleDateString()}</Text>
              </View>
              <View style={styles.expenseActions}>
                <Text style={styles.expenseAmount}>{formatCurrency(exp.amount, business?.currency)}</Text>
                <TouchableOpacity onPress={() => handleDeleteExpense(exp.id)}>
                  <Ionicons name="trash-outline" size={20} color={Colors.rose} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Expense</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.gray900} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount ({business?.currency || 'USD'})</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.categoriesContainer}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryOption,
                        category === cat && styles.categoryOptionSelected
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        category === cat && styles.categoryOptionTextSelected
                      ]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="e.g. Electricity bill"
                  multiline
                  numberOfLines={3}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleAddExpense}>
                <Text style={styles.saveButtonText}>Save Expense</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.teal,
  },
  headerTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.white,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.gray100,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: Typography.sm,
    color: Colors.gray500,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: Typography['4xl'],
    fontWeight: Typography.bold,
    color: Colors.rose,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blue600,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: Typography.bold,
    fontSize: Typography.sm,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  expenseInfo: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.gray100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.gray600,
    textTransform: 'uppercase',
  },
  expenseDescription: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: Typography.xs,
    color: Colors.gray400,
  },
  expenseActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  expenseAmount: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.rose,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: Typography.base,
    color: Colors.gray400,
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
    height: '85%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  modalForm: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.gray700,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 12,
    padding: 16,
    fontSize: Typography.base,
    color: Colors.gray900,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryOptionSelected: {
    backgroundColor: Colors.teal + '10',
    borderColor: Colors.teal,
  },
  categoryOptionText: {
    fontSize: Typography.sm,
    color: Colors.gray600,
  },
  categoryOptionTextSelected: {
    color: Colors.teal,
    fontWeight: Typography.bold,
  },
  saveButton: {
    backgroundColor: Colors.teal,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 40,
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
});
