import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Modal, 
  TextInput, 
  ActivityIndicator,
  Animated,
  Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSubscription } from "../../contexts/SubscriptionContext";
import { useAuth } from "../../contexts/AuthContext";
import { Colors } from "../../constants/Colors";
import { Typography } from "../../constants/Typography";
import { formatCurrency } from "../../utils/Formatter";
import { Paystack } from "react-native-paystack-webview";
import { SubscriptionService } from "../../services/SubscriptionService";

const { width } = Dimensions.get('window');

export const SubscriptionPlansScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { 
    plans, 
    availableModules, 
    availableBundles, 
    loading, 
    processSubscription, 
    isSubscribed, 
    daysRemaining, 
    subscription,
    modules: activeModules
  } = useSubscription();
  
  const { business, user } = useAuth();
  
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'QUARTERLY' | 'ANNUAL'>('MONTHLY');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  
  const [promoCode, setPromoCode] = useState("");
  const [isVerifyingPromo, setIsVerifyingPromo] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const paystackRef = useRef<any>(null);

  // Initialize from current state
  useEffect(() => {
    if (activeModules.length > 0) {
      setSelectedModules(activeModules.map(m => m.module));
    }
    if (subscription) {
      const planType = subscription.plan_type;
      if (planType.includes('ANNUAL')) setBillingCycle('ANNUAL');
      else if (planType.includes('QUARTERLY')) setBillingCycle('QUARTERLY');
      else setBillingCycle('MONTHLY');
    }
  }, [activeModules, subscription]);

  const toggleModule = (moduleType: string) => {
    setSelectedModules(prev => {
      const next = prev.includes(moduleType) 
        ? prev.filter(m => m !== moduleType) 
        : [...prev, moduleType];
      
      return next;
    });
  };

  const calculateTotal = useMemo(() => {
    const basePlanMonthly = plans.find(p => p.type === (business?.type === 'SERVICE' ? 'SERVICE_MONTHLY' : 'MONTHLY'));
    const currentBasePlan = plans.find(p => p.type === (business?.type === 'SERVICE' ? `SERVICE_${billingCycle}` : billingCycle));
    
    const monthMultiplier = billingCycle === 'ANNUAL' ? 12 : billingCycle === 'QUARTERLY' ? 3 : 1;
    const cycleDiscount = billingCycle === 'ANNUAL' ? 0.85 : billingCycle === 'QUARTERLY' ? 0.9 : 1;
    
    // Original Total (Monthly rates * cycle, no discount)
    let originalModulesTotal = 0;
    selectedModules.forEach(modType => {
        const mod = availableModules.find(m => m.type === modType);
        if (mod) originalModulesTotal += mod.price * monthMultiplier;
    });
    const originalTotal = (basePlanMonthly?.price || 0) * monthMultiplier + originalModulesTotal;

    // Final Total
    let finalModulesTotal = 0;
    selectedModules.forEach(modType => {
        const mod = availableModules.find(m => m.type === modType);
        if (mod) finalModulesTotal += mod.price * monthMultiplier * cycleDiscount;
    });

    const basePriceWithCycle = currentBasePlan?.price || 0;
    let finalTotal = basePriceWithCycle + finalModulesTotal;
    
    if (promoDiscount > 0) {
      finalTotal = finalTotal * (1 - promoDiscount / 100);
    }

    const savings = originalTotal - finalTotal;

    return {
        finalTotal,
        originalTotal,
        savings,
        discountPercent: Math.round((savings / originalTotal) * 100) || 0
    };
  }, [billingCycle, selectedModules, promoDiscount, plans, availableModules, business]);

  if (loading && !subscription) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.teal} />
        <Text style={styles.loadingText}>Syncing subscription...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Status Banner */}
          <View style={[
            styles.statusBanner, 
            isSubscribed ? styles.statusBannerActive : styles.statusBannerInactive
          ]}>
            <View style={[
              styles.statusIconBg,
              isSubscribed ? styles.statusIconBgActive : styles.statusIconBgInactive
            ]}>
              <Ionicons 
                name={isSubscribed ? "shield-checkmark" : "alert-circle"} 
                size={22} 
                color={isSubscribed ? Colors.success : Colors.error} 
              />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Account Status</Text>
              <Text style={styles.statusTitle}>
                {isSubscribed ? 'Active Account' : 'Payment Required'}
              </Text>
            </View>
            {isSubscribed && (
              <View style={styles.daysBadge}>
                <Text style={styles.daysValue}>{daysRemaining}</Text>
                <Text style={styles.daysLabel}>Days Left</Text>
              </View>
            )}
          </View>

          {/* 1. Billing Cycle */}
          <View style={styles.sectionHeader}>
            <View style={styles.stepCircle}><Text style={styles.stepText}>1</Text></View>
            <Text style={styles.sectionTitle}>Billing Cycle</Text>
          </View>
          
          <View style={styles.cycleGrid}>
            {[
              { id: 'MONTHLY', label: 'Monthly', tag: 'Standard', icon: 'calendar-outline' },
              { id: 'QUARTERLY', label: 'Quarterly', tag: 'Save 10%', icon: 'layers-outline' },
              { id: 'ANNUAL', label: 'Annual', tag: 'Save 15%', icon: 'sparkles-outline' }
            ].map((cycle) => (
              <TouchableOpacity 
                key={cycle.id}
                onPress={() => setBillingCycle(cycle.id as any)}
                style={[
                  styles.cycleCard,
                  billingCycle === cycle.id && styles.cycleCardActive
                ]}
              >
                <Ionicons 
                  name={cycle.icon as any} 
                  size={20} 
                  color={billingCycle === cycle.id ? Colors.teal : Colors.gray400} 
                  style={{ marginBottom: 4 }}
                />
                <Text style={[styles.cycleLabel, billingCycle === cycle.id && styles.cycleLabelActive]}>{cycle.label}</Text>
                <Text style={styles.cycleTag}>{cycle.tag}</Text>
              </TouchableOpacity>
            ))}
          </View>



          {/* 2. Custom Modules */}
          <View style={styles.sectionHeader}>
            <View style={styles.stepCircle}><Text style={styles.stepText}>2</Text></View>
            <Text style={styles.sectionTitle}>Custom Add-ons</Text>
          </View>
          
          <View style={styles.modulesList}>
            {availableModules.map((mod) => {
              const isSelected = selectedModules.includes(mod.type);
              return (
                <TouchableOpacity
                  key={mod.type}
                  onPress={() => toggleModule(mod.type)}
                  style={[styles.moduleItem, isSelected && styles.moduleItemActive]}
                >
                  <View style={[styles.checkCircle, isSelected && styles.checkCircleActive]}>
                    {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                  </View>
                  <View style={styles.moduleMainInfo}>
                    <Text style={styles.moduleTitle}>{mod.name}</Text>
                    <Text style={styles.moduleRate}>₦{mod.price.toLocaleString()} / month</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.gray300} />
                </TouchableOpacity>
              );
            })}
          </View>
          
          {/* Order Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryHeading}>Order Summary</Text>
            
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Base Terminal ({billingCycle})</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(plans.find(p => p.type === (business?.type === 'SERVICE' ? `SERVICE_${billingCycle}` : billingCycle))?.price || 0, 'NGN')}
              </Text>
            </View>

            {selectedModules.length > 0 && (
              <View style={styles.summaryLine}>
                <Text style={styles.summaryLabel}>Premium Add-ons</Text>
                <Text style={styles.summaryValue}>
                  {selectedModules.length} Active
                </Text>
              </View>
            )}

            <View style={styles.finalTotalContainer}>
              <View>
                <Text style={styles.totalPrompt}>Amount to Pay</Text>
                <Text style={styles.totalBilling}>{billingCycle} BILLING</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                {calculateTotal.savings > 0 && (
                  <View style={styles.savingsRow}>
                    <Text style={styles.originalPrice}>{formatCurrency(calculateTotal.originalTotal, 'NGN')}</Text>
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsText}>-{calculateTotal.discountPercent}%</Text>
                    </View>
                  </View>
                )}
                <Text style={styles.finalPrice}>{formatCurrency(calculateTotal.finalTotal, 'NGN')}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.checkoutBtn}
              onPress={() => setCheckoutVisible(true)}
            >
              <Text style={styles.checkoutBtnText}>Confirm and Upgrade</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>

            <View style={styles.trustRow}>
              <View style={styles.trustItem}>
                <Ionicons name="lock-closed" size={12} color={Colors.gray400} />
                <Text style={styles.trustText}>SECURE</Text>
              </View>
              <View style={styles.trustItem}>
                <Ionicons name="shield-checkmark" size={12} color={Colors.gray400} />
                <Text style={styles.trustText}>ENCRYPTED</Text>
              </View>
              <View style={styles.trustItem}>
                <Ionicons name="card" size={12} color={Colors.gray400} />
                <Text style={styles.trustText}>PAYSTACK</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Verification Modal */}
      <Modal
        visible={checkoutVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCheckoutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Upgrade</Text>
              <TouchableOpacity onPress={() => setCheckoutVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.gray900} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
               <View style={styles.promoBox}>
                  <Text style={styles.promoLabel}>Promo Code</Text>
                  <View style={styles.promoInputRow}>
                    <TextInput
                      style={styles.promoInput}
                      placeholder="ENTER CODE"
                      value={promoCode}
                      onChangeText={setPromoCode}
                      autoCapitalize="characters"
                    />
                    <TouchableOpacity 
                      style={[styles.applyBtn, !promoCode && styles.applyBtnDisabled]}
                      onPress={async () => {
                         if (!promoCode.trim()) return;
                         setIsVerifyingPromo(true);
                         try {
                           const res = await SubscriptionService.validatePromoCode(promoCode.trim());
                           if (res.success) {
                             setPromoDiscount(res.discount_percentage);
                             setAppliedPromo(promoCode.trim());
                             Alert.alert("Success", "Code applied!");
                           }
                         } finally {
                           setIsVerifyingPromo(false);
                         }
                      }}
                    >
                      {isVerifyingPromo ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.applyBtnText}>Apply</Text>}
                    </TouchableOpacity>
                  </View>
               </View>

               <View style={styles.checkoutSummary}>
                  <Text style={styles.checkTitle}>Order Breakdown</Text>
                  <View style={styles.checkLine}>
                    <Text style={styles.checkLabel}>Base Plan</Text>
                    <Text style={styles.checkValue}>{formatCurrency(calculateTotal.finalTotal, 'NGN')}</Text>
                  </View>
                  <View style={[styles.checkLine, { borderTopWidth: 1, borderTopColor: Colors.gray100, marginTop: 10, paddingTop: 10 }]}>
                    <Text style={styles.checkLabelBold}>Total Amount</Text>
                    <Text style={styles.checkValueBold}>{formatCurrency(calculateTotal.finalTotal, 'NGN')}</Text>
                  </View>
               </View>

               <TouchableOpacity 
                style={styles.paystackBtn}
                onPress={() => {
                  setCheckoutVisible(false);
                  setTimeout(() => paystackRef.current?.startTransaction(), 500);
                }}
              >
                <Text style={styles.paystackBtnText}>Pay with Paystack</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Paystack integration */}
      <Paystack
        paystackKey={(process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY as string) || "pk_test_c4d6b6735388bf536ab1cc72ad8961397078eb08"}
        amount={(calculateTotal.finalTotal * 100).toString()}
        billingEmail={user?.email || ""}
        billingName={`${user?.first_name || ""} ${user?.last_name || ""}`}
        currency="NGN"
        activityIndicatorColor={Colors.teal}
        onCancel={() => Alert.alert("Cancelled", "Payment cancelled")}
        onSuccess={async (res: any) => {
          try {
            await processSubscription(
              business?.type === 'SERVICE' ? `SERVICE_${billingCycle}` : billingCycle, 
              res.transactionRef.reference, 
              selectedModules,
              undefined,
              appliedPromo || undefined
            );
            Alert.alert("Success", "Subscription updated!");
            navigation.goBack();
          } catch (e) {
            Alert.alert("Error", "Update failed.");
          }
        }}
        ref={paystackRef}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, backgroundColor: Colors.gray50 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white },
  loadingText: { marginTop: 12, fontSize: 13, color: Colors.gray400, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
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
  scrollContent: { padding: 20, paddingBottom: 60 },
  
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 32,
  },
  statusBannerActive: { backgroundColor: Colors.success + '10', borderColor: Colors.success + '20' },
  statusBannerInactive: { backgroundColor: Colors.error + '10', borderColor: Colors.error + '20' },
  statusIconBg: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  statusIconBgActive: { backgroundColor: Colors.success + '20' },
  statusIconBgInactive: { backgroundColor: Colors.error + '20' },
  statusInfo: { flex: 1, marginLeft: 16 },
  statusLabel: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', color: Colors.gray400, letterSpacing: 1 },
  statusTitle: { fontSize: 16, fontWeight: '800', color: Colors.gray900 },
  daysBadge: { alignItems: 'center', paddingLeft: 16, borderLeftWidth: 1, borderLeftColor: Colors.gray200 },
  daysValue: { fontSize: 18, fontWeight: '900', color: Colors.success },
  daysLabel: { fontSize: 9, fontWeight: '800', color: Colors.gray400, textTransform: 'uppercase' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stepCircle: { width: 24, height: 24, borderRadius: 8, backgroundColor: Colors.gray900, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  stepText: { color: 'white', fontSize: 12, fontWeight: '900' },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: Colors.gray900 },

  cycleGrid: { flexDirection: 'row', gap: 10, marginBottom: 32 },
  cycleCard: { flex: 1, padding: 14, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.gray200, backgroundColor: Colors.white, alignItems: 'center' },
  cycleCardActive: { borderColor: Colors.teal, backgroundColor: Colors.teal + '05' },
  cycleLabel: { fontSize: 13, fontWeight: '800', color: Colors.gray700 },
  cycleLabelActive: { color: Colors.teal },
  cycleTag: { fontSize: 9, fontWeight: '900', color: Colors.gray400, textTransform: 'uppercase', marginTop: 2 },

  bundlesContainer: { gap: 12, marginBottom: 32 },
  bundleCard: { backgroundColor: Colors.white, borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: Colors.gray200 },
  bundleCardActive: { borderColor: Colors.teal, backgroundColor: Colors.teal + '05' },
  bundleTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  bundleInfo: { flex: 1, marginRight: 12 },
  bundleName: { fontSize: 18, fontWeight: '900', color: Colors.gray900 },
  bundleDesc: { fontSize: 12, color: Colors.gray500, marginTop: 4, lineHeight: 18 },
  bundlePriceContainer: { alignItems: 'flex-end' },
  bundlePriceText: { fontSize: 18, fontWeight: '900', color: Colors.teal },
  bundlePriceUnit: { fontSize: 10, color: Colors.gray400, fontWeight: '800' },
  bundleModules: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  moduleTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: Colors.gray50, borderWidth: 1, borderColor: Colors.gray100 },
  moduleTagText: { fontSize: 9, fontWeight: '800', color: Colors.gray500, textTransform: 'uppercase' },
  selectedIndicator: { position: 'absolute', top: 16, right: 16 },

  modulesList: { gap: 10, marginBottom: 40 },
  moduleItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: Colors.white, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.gray200 },
  moduleItemActive: { borderColor: Colors.teal, backgroundColor: Colors.teal + '05' },
  checkCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.gray200, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  checkCircleActive: { backgroundColor: Colors.teal, borderColor: Colors.teal },
  moduleMainInfo: { flex: 1 },
  moduleTitle: { fontSize: 14, fontWeight: '800', color: Colors.gray800 },
  moduleRate: { fontSize: 11, color: Colors.gray400, marginTop: 2 },

  summaryCard: { backgroundColor: Colors.gray900, borderRadius: 32, padding: 24, marginBottom: 20 },
  summaryHeading: { fontSize: 20, fontWeight: '900', color: 'white', marginBottom: 20 },
  summaryLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 13, color: Colors.gray400, fontWeight: '600' },
  summaryValue: { fontSize: 13, color: 'white', fontWeight: '800' },
  finalTotalContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  totalPrompt: { fontSize: 11, fontWeight: '900', color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 1 },
  totalBilling: { fontSize: 9, fontWeight: '900', color: Colors.teal, textTransform: 'uppercase' },
  savingsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  originalPrice: { fontSize: 12, color: Colors.gray500, textDecorationLine: 'line-through' },
  savingsBadge: { backgroundColor: Colors.success + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  savingsText: { fontSize: 10, fontWeight: '900', color: Colors.success },
  finalPrice: { fontSize: 32, fontWeight: '900', color: Colors.teal, letterSpacing: -1 },
  checkoutBtn: { backgroundColor: Colors.teal, borderRadius: 20, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24 },
  checkoutBtnText: { color: 'white', fontSize: 16, fontWeight: '900' },
  trustRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 16, opacity: 0.5 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trustText: { fontSize: 8, fontWeight: '900', color: Colors.gray400 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingBottom: 40, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: Colors.gray900 },
  modalBody: { padding: 24 },
  promoBox: { marginBottom: 24 },
  promoLabel: { fontSize: 12, fontWeight: '800', color: Colors.gray500, marginBottom: 8, textTransform: 'uppercase' },
  promoInputRow: { flexDirection: 'row', gap: 10 },
  promoInput: { flex: 1, height: 50, backgroundColor: Colors.gray50, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.gray200, paddingHorizontal: 16, fontSize: 14, fontWeight: '700' },
  applyBtn: { backgroundColor: Colors.gray900, borderRadius: 14, paddingHorizontal: 20, justifyContent: 'center' },
  applyBtnDisabled: { opacity: 0.3 },
  applyBtnText: { color: 'white', fontSize: 13, fontWeight: '900' },
  checkoutSummary: { backgroundColor: Colors.gray50, borderRadius: 24, padding: 20, marginBottom: 24 },
  checkTitle: { fontSize: 15, fontWeight: '900', color: Colors.gray900, marginBottom: 16 },
  checkLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  checkLabel: { fontSize: 14, color: Colors.gray500 },
  checkValue: { fontSize: 14, fontWeight: '700', color: Colors.gray900 },
  checkLabelBold: { fontSize: 16, fontWeight: '900', color: Colors.gray900 },
  checkValueBold: { fontSize: 18, fontWeight: '900', color: Colors.teal },
  paystackBtn: { backgroundColor: Colors.teal, borderRadius: 18, paddingVertical: 20, alignItems: 'center' },
  paystackBtnText: { color: 'white', fontSize: 16, fontWeight: '900' },
});
