import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView as RNScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { formatCurrency } from '../../utils/Formatter';
import { Button } from '../../components/Button';
import type { Product, Category } from '../../types';

interface RetailInventoryViewProps {
  products: Product[];
  categories: Category[];
  business: any;
  canManage: boolean;
  inventoryLoading: boolean;
  inventorySummary: any;
  onRefresh: () => void;
  onEditProduct: (product: Product) => void;
  onSeedData: () => void;
  loading: boolean;
}

export const RetailInventoryView: React.FC<RetailInventoryViewProps> = ({
  products,
  categories,
  business,
  canManage,
  inventoryLoading,
  inventorySummary,
  onRefresh,
  onEditProduct,
  onSeedData,
  loading
}) => {
  const getCategoryName = (categoryId: number) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || "Unknown";
  };

  const getCategoryColor = (categoryId: number) => {
    const catName = getCategoryName(categoryId);
    const colorMap: Record<string, string> = {
      Bakery: "#FEE2E2",
      Snacks: "#D1FAE5",
      Beverages: "#DBEAFE",
      Dairy: "#FCE7F3",
    };
    return colorMap[catName] || Colors.gray100;
  };

  const getCategoryTextColor = (categoryId: number) => {
    const catName = getCategoryName(categoryId);
    const colorMap: Record<string, string> = {
      Bakery: "#991B1B",
      Snacks: "#065F46",
      Beverages: "#1E40AF",
      Dairy: "#831843",
    };
    return colorMap[catName] || Colors.gray700;
  };

  const renderSummaryCards = () => {
    if (!inventorySummary || !canManage) return null;

    return (
      <View style={styles.summaryCardsContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardLabel}>Stock Worth</Text>
          <Text style={styles.summaryCardValue}>
            {formatCurrency(inventorySummary.total_purchase_cost, business?.currency)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardLabel}>Revenue</Text>
          <Text style={styles.summaryCardValue}>
            {formatCurrency(inventorySummary.total_selling_value, business?.currency)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardLabel}>Profit</Text>
          <Text style={[styles.summaryCardValue, { color: Colors.teal }]}>
            {formatCurrency(inventorySummary.potential_profit, business?.currency)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.productCard}
          onPress={() => canManage && onEditProduct(item)}
          activeOpacity={canManage ? 0.7 : 1}
        >
          <View style={styles.productHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{item.name}</Text>
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category_id) }]}>
                <Text style={[styles.categoryText, { color: getCategoryTextColor(item.category_id) }]}>
                  {getCategoryName(item.category_id)}
                </Text>
              </View>
            </View>
            <View style={styles.stockSection}>
              <Text style={styles.stockCount}>{item.stock}</Text>
              <Text style={styles.stockLabel}>in stock</Text>
            </View>
          </View>
          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>Price: {formatCurrency(item.price, business?.currency)}</Text>
            <Text style={styles.productSku}>SKU: {item.sku || `PROD-${item.id}`}</Text>
          </View>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={renderSummaryCards()}
      refreshControl={
        <RefreshControl
          refreshing={inventoryLoading}
          onRefresh={onRefresh}
          colors={[Colors.teal]}
          tintColor={Colors.teal}
        />
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="cube-outline" size={64} color={Colors.gray300} />
          <Text style={styles.emptyText}>No products found</Text>
          {canManage && !business?.is_seeded && (
            <View style={styles.seedContainer}>
              <Text style={styles.seedText}>
                Want to start quickly? Populate your inventory with sample data.
              </Text>
              <Button
                title="Populate Sample Data"
                onPress={onSeedData}
                variant="outline"
                primaryColor={Colors.teal}
                loading={loading}
              />
            </View>
          )}
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  summaryCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryCardLabel: {
    fontSize: 10,
    color: Colors.gray500,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryCardValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.gray900,
  },
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  productName: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    marginBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  stockSection: {
    alignItems: "flex-end",
  },
  stockCount: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  stockLabel: {
    fontSize: 10,
    color: Colors.gray500,
    textTransform: "uppercase",
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colors.gray50,
    paddingTop: 12,
  },
  productPrice: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.teal,
  },
  productSku: {
    fontSize: Typography.xs,
    color: Colors.gray400,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: Typography.lg,
    color: Colors.gray400,
  },
  seedContainer: {
    marginTop: 32,
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
    width: '100%',
    alignItems: 'center',
  },
  seedText: {
    fontSize: 14,
    color: Colors.gray600,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  }
});
