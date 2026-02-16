
import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSubscription } from "../../contexts/SubscriptionContext";
import { useAuth } from "../../contexts/AuthContext";
import { Colors } from "../../constants/Colors";
import { Typography } from "../../constants/Typography";
import { formatCurrency } from "../../utils/Formatter";
import { Paystack } from "react-native-paystack-webview";

export const SubscriptionCheckoutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { plans, availableModules, availableBundles, subscription, modules: activeModules, processSubscription, loading } = useSubscription();
  const { business, user } = useAuth();
  
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'QUARTERLY' | 'ANNUAL'>('MONTHLY');
  const [processing, setProcessing] = useState(false);
  const paystackRef = useRef<any>(null);

  const calculateTotal = () => {
    const basePlan = plans.find(p => p.type === (business?.type === 'SERVICE' ? `SERVICE_${billingCycle}` : billingCycle));
    const basePrice = basePlan?.price || 0;
    const monthMultiplier = billingCycle === 'ANNUAL' ? 12 : billingCycle === 'QUARTERLY' ? 3 : 1;
    const discount = billingCycle === 'ANNUAL' ? 0.85 : billingCycle === 'QUARTERLY' ? 0.9 : 1;

    const pickedModules = activeModules.map(m => m.module);
    
    const modulesTotal = pickedModules.reduce((acc, modType) => {
       const mod = availableModules.find(m => m.type === modType);
       return acc + (mod ? mod.price * monthMultiplier * discount : 0);
    }, 0);

    return basePrice + modulesTotal;
  };

  const handlePay = () => {
    if (!user || !business) {
      Alert.alert("Error", "Session expired. Please login again.");
      return;
    }
    paystackRef.current?.startTransaction();
  };

  const pickedModules = activeModules.map(m => m.module);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
           <View style={styles.badge}>
              <Ionicons name="globe-outline" size={14} color={Colors.teal} />
              <Text style={styles.badgeText}>SECURE INTERNATIONAL CHECKOUT</Text>
           </View>
           <h1 style={{ display: 'none' }}>Activate Terminal</h1>
           <Text style={styles.title}>Activate Your{"\n"}<Text style={{color: Colors.teal}}>Merchant Terminal</Text></Text>
           <Text style={styles.subtitle}>Welcome, {user?.first_name}! Your {business?.name} terminal is prepared. Settle your subscription to gain full operational access.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SUBSCRIPTION CYCLE</Text>
          <View style={styles.cycleGrid}>
             {[
               { id: 'MONTHLY', label: 'Monthly', desc: 'Normal Rate' },
               { id: 'QUARTERLY', label: 'Quarterly', desc: 'Save 10%' },
               { id: 'ANNUAL', label: 'Annual', desc: 'Save 15%' }
             ].map((cycle) => (
                <TouchableOpacity 
                  key={cycle.id}
                  onPress={() => setBillingCycle(cycle.id as any)}
                  style={[styles.cycleCard, billingCycle === cycle.id && styles.cycleCardActive]}
                >
                   <Text style={[styles.cycleLabel, billingCycle === cycle.id && styles.cycleLabelActive]}>{cycle.label}</Text>
                   <Text style={styles.cycleDesc}>{cycle.desc}</Text>
                   {billingCycle === cycle.id && (
                     <View style={styles.checkIcon}>
                        <Ionicons name="checkmark-circle" size={16} color={Colors.teal} />
                     </View>
                   )}
                </TouchableOpacity>
             ))}
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
             <View>
                <Text style={styles.summaryTitle}>Checkout Summary</Text>
                <Text style={styles.summarySubtitle}>SELECTED TERMINAL FEATURES</Text>
             </View>
             <View style={styles.packageIcon}>
                <Ionicons name="cube-outline" size={24} color={Colors.gray400} />
             </View>
          </View>

          <View style={styles.summaryItems}>
             {/* Base Plan */}
             <View style={styles.summaryRow}>
                <View style={styles.rowLead}>
                   <View style={styles.dot} />
                   <View>
                      <Text style={styles.itemName}>AlphaKit POS Base</Text>
                      <Text style={styles.itemSub}>{business?.type === 'SERVICE' ? 'Service Station' : 'Retail Pro'} • {billingCycle}</Text>
                   </View>
                </View>
                <Text style={styles.itemPrice}>
                   {formatCurrency(plans.find(p => p.type === (business?.type === 'SERVICE' ? `SERVICE_${billingCycle}` : billingCycle))?.price || 0)}
                </Text>
             </View>

             {/* Individual Modules */}
             {pickedModules.map((modType) => {
                const mod = availableModules.find(am => am.type === modType);
                if (!mod) return null;
                const price = mod.price * (billingCycle === 'ANNUAL' ? 12 : billingCycle === 'QUARTERLY' ? 3 : 1) * (billingCycle === 'ANNUAL' ? 0.85 : billingCycle === 'QUARTERLY' ? 0.9 : 1);
                return (
                   <View key={modType} style={styles.summaryRowSmall}>
                      <View style={styles.rowLead}>
                         <View style={styles.dotSmall} />
                         <Text style={styles.itemNameSmall}>{mod.name}</Text>
                      </View>
                      <Text style={styles.itemPriceSmall}>{formatCurrency(price)}</Text>
                   </View>
                );
             })}
          </View>

          <View style={styles.summaryFooter}>
             <View>
                <Text style={styles.totalLabel}>TOTAL COMMIT</Text>
                <Text style={styles.totalValue}>{formatCurrency(calculateTotal())}</Text>
             </View>
             <View style={styles.noFeeBadge}>
                <Text style={styles.noFeeText}>NO SETUP FEES</Text>
             </View>
          </View>
        </View>

        <View style={styles.paymentCard}>
           <View style={styles.paymentIconCircle}>
              <Ionicons name="lock-closed" size={32} color={Colors.teal} />
           </View>
           <Text style={styles.paymentTitle}>Instant Activation</Text>
           <Text style={styles.paymentDesc}>Securely settle your subscription via Paystack. Your terminal will be activated instantly upon success.</Text>
           
           <TouchableOpacity 
            style={styles.payBtn}
            onPress={handlePay}
            disabled={processing}
           >
              {processing ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.payBtnText}>Pay {formatCurrency(calculateTotal())} Now</Text>
                  <Ionicons name="card-outline" size={20} color={Colors.white} />
                </>
              )}
           </TouchableOpacity>

           <View style={styles.pciRow}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.success} />
              <Text style={styles.pciText}>PCI-DSS COMPLIANT SECURITY</Text>
           </View>
        </View>

        <Text style={styles.legalText}>By clicking pay now, you agree to AlphaKit Professional Terms of Service. Activation takes ~3 seconds.</Text>
      </ScrollView>

      {user && business && (
        <Paystack
          paystackKey={(process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY as string) || "pk_test_840e6c5354972e6167651084bdd356073167b"}
          amount={calculateTotal().toString()}
          billingEmail={user.email}
          billingName={`${user.first_name} ${user.last_name}`}
          currency="NGN"
          activityIndicatorColor={Colors.teal}
          onCancel={() => {
            setProcessing(false);
          }}
          onSuccess={async (res: any) => {
            try {
              setProcessing(true);
              const planType = business.type === 'SERVICE' ? `SERVICE_${billingCycle}` : billingCycle;
              await processSubscription(
                planType, 
                res.transactionRef.reference, 
                activeModules.map(m => m.module),
                undefined
              );
              navigation.replace("POS");
            } catch (e) {
              setProcessing(false);
              Alert.alert("Error", "Activation failed. Please contact support.");
            }
          }}
          ref={paystackRef}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { padding: 24, paddingBottom: 60 },
  header: { marginBottom: 30 },
  badge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    backgroundColor: Colors.teal + '10', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20, 
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.teal + '20',
    marginBottom: 16
  },
  badgeText: { fontSize: 9, fontWeight: '900', color: Colors.teal, letterSpacing: 1 },
  title: { fontSize: 32, fontWeight: '900', lineHeight: 38, color: Colors.gray900, marginBottom: 12 },
  subtitle: { fontSize: 15, color: Colors.gray500, lineHeight: 22, fontWeight: '500' },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 10, fontWeight: '900', color: Colors.gray400, letterSpacing: 2, marginBottom: 12, marginLeft: 4 },
  cycleGrid: { flexDirection: 'row', gap: 10 },
  cycleCard: { 
    flex: 1, 
    backgroundColor: Colors.gray50, 
    borderRadius: 16, 
    padding: 14, 
    borderWidth: 1.5, 
    borderColor: Colors.gray100,
    alignItems: 'center',
    position: 'relative'
  },
  cycleCardActive: { 
    backgroundColor: Colors.white, 
    borderColor: Colors.teal,
    elevation: 4,
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  cycleLabel: { fontSize: 13, fontWeight: '800', color: Colors.gray500 },
  cycleLabelActive: { color: Colors.teal },
  cycleDesc: { fontSize: 9, fontWeight: '700', color: Colors.gray400, marginTop: 2, textTransform: 'uppercase' },
  checkIcon: { position: 'absolute', top: -5, right: -5, backgroundColor: Colors.white, borderRadius: 10 },
  summaryCard: { 
    backgroundColor: Colors.white, 
    borderRadius: 30, 
    padding: 24, 
    borderWidth: 1, 
    borderColor: Colors.gray200,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: Colors.gray50, paddingBottom: 16 },
  summaryTitle: { fontSize: 18, fontWeight: '900', color: Colors.gray900 },
  summarySubtitle: { fontSize: 9, fontWeight: '800', color: Colors.gray400, letterSpacing: 1, marginTop: 2 },
  packageIcon: { width: 44, height: 44, backgroundColor: Colors.gray50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  summaryItems: { gap: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryRowSmall: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 22 },
  rowLead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.teal },
  dotSmall: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.gray300 },
  itemName: { fontSize: 14, fontWeight: '800', color: Colors.gray800 },
  itemSub: { fontSize: 10, fontWeight: '700', color: Colors.gray400, textTransform: 'uppercase' },
  itemPrice: { fontSize: 14, fontWeight: '900', color: Colors.gray900 },
  itemNameSmall: { fontSize: 13, fontWeight: '600', color: Colors.gray600 },
  itemPriceSmall: { fontSize: 13, fontWeight: '700', color: Colors.gray500 },
  bundleRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: Colors.warning + '10', 
    padding: 12, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.warning + '20'
  },
  bundleIconContainer: { 
    width: 32, 
    height: 32, 
    backgroundColor: Colors.warning, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  bundleName: { fontSize: 13, fontWeight: '800', color: Colors.warning },
  bundleSub: { fontSize: 8, fontWeight: '900', color: Colors.warning, opacity: 0.8 },
  bundlePrice: { fontSize: 14, fontWeight: '900', color: Colors.warning },
  summaryFooter: { 
    marginTop: 20, 
    paddingTop: 20, 
    borderTopWidth: 1, 
    borderTopColor: Colors.gray100, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end' 
  },
  totalLabel: { fontSize: 10, fontWeight: '900', color: Colors.gray400, marginBottom: 4 },
  totalValue: { fontSize: 28, fontWeight: '900', color: Colors.gray900, letterSpacing: -1 },
  noFeeBadge: { backgroundColor: Colors.success + '10', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  noFeeText: { fontSize: 9, fontWeight: '900', color: Colors.success },
  paymentCard: { 
    backgroundColor: Colors.gray900, 
    borderRadius: 35, 
    padding: 30, 
    alignItems: 'center'
  },
  paymentIconCircle: { 
    width: 64, 
    height: 64, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 22, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)' 
  },
  paymentTitle: { fontSize: 22, fontWeight: '900', color: Colors.white, marginBottom: 8 },
  paymentDesc: { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 20, marginBottom: 30 },
  payBtn: { 
    width: '100%', 
    backgroundColor: Colors.teal, 
    borderRadius: 20, 
    paddingVertical: 18, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10,
    elevation: 8,
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12
  },
  payBtnText: { color: Colors.white, fontSize: 16, fontWeight: '900' },
  pciRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20 },
  pciText: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.3)', letterSpacing: 0.5 },
  legalText: { fontSize: 11, color: Colors.gray400, textAlign: 'center', marginTop: 20, fontStyle: 'italic', paddingHorizontal: 20 }
});
