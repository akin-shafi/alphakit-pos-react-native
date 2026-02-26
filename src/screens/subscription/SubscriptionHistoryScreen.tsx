import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { formatCurrency, formatDate } from "../../utils/Formatter";
import { SubscriptionService, Subscription } from "../../services/SubscriptionService";

const { width } = Dimensions.get('window');

export const SubscriptionHistoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [history, setHistory] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const data = await SubscriptionService.getHistory();
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const renderHistoryItem = (item: Subscription) => {
    const isSuccess = item.status === "ACTIVE";
    
    return (
      <View key={item.id} style={styles.historyCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.statusIndicator, { backgroundColor: isSuccess ? Colors.success : Colors.error }]} />
          <Text style={styles.planName}>{item.plan_type.replace('_', ' ')}</Text>
          <Text style={styles.amountText}>{formatCurrency(item.amount_paid || 0, 'NGN')}</Text>
        </View>
        
        <View style={styles.cardBody}>
          <Text style={styles.descriptionText}>{item.description || 'Standard Renewal'}</Text>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={14} color={Colors.gray400} />
              <Text style={styles.detailText}>{formatDate(item.start_date)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="card-outline" size={14} color={Colors.gray400} />
              <Text style={styles.detailText}>{item.payment_method || 'PAYSTACK'}</Text>
            </View>
          </View>
          
          <View style={styles.refContainer}>
            <Text style={styles.refLabel}>REF: {item.transaction_reference}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.teal} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment History</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.teal]} />}
        >
          {history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color={Colors.gray200} />
              <Text style={styles.emptyText}>No payment history found</Text>
            </View>
          ) : (
            history.map(renderHistoryItem)
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, backgroundColor: Colors.gray50 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  headerTitle: { fontSize: 18, fontWeight: "900", color: Colors.gray900, textTransform: 'uppercase', letterSpacing: 0.5 },
  backButton: { padding: 8, borderRadius: 12, backgroundColor: Colors.gray50 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20 },
  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  statusIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  planName: { flex: 1, fontSize: 13, fontWeight: '900', color: Colors.gray900, textTransform: 'uppercase', letterSpacing: 0.5 },
  amountText: { fontSize: 15, fontWeight: '900', color: Colors.slate900 },
  cardBody: { paddingLeft: 18 },
  descriptionText: { fontSize: 14, color: Colors.gray600, fontWeight: '700', marginBottom: 12 },
  detailsRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 12, color: Colors.gray400, fontWeight: '600' },
  refContainer: { backgroundColor: Colors.gray50, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  refLabel: { fontSize: 9, color: Colors.gray400, fontWeight: '800' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
  emptyText: { marginTop: 16, fontSize: 14, color: Colors.gray400, fontWeight: '700' },
});
