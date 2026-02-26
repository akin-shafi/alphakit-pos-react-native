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
import { SubscriptionService, PaymentMethod } from "../../services/SubscriptionService";

const { width } = Dimensions.get('window');

export const SubscriptionPlansScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { 
    plans, 
    availableModules, 
    availableBundles, 
    loading, 
    processSubscription, 
    processSavedCardSubscription,
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
  const [processing, setProcessing] = useState(false);

  const [savedCards, setSavedCards] = useState<PaymentMethod[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [isUsingSavedCard, setIsUsingSavedCard] = useState(false);
  
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const paystackRef = useRef<any>(null);

  const [isBasicMode, setIsBasicMode] = useState(false);

  // Initialize from current state
  useEffect(() => {
    if (activeModules.length > 0) {
      setSelectedModules(activeModules.map(m => m.module));
    } else if (business?.type === 'FUEL_STATION' || business?.type === 'LPG_STATION') {
      // Auto-recommend for gas stations
      setSelectedModules(['BULK_STOCK_MANAGEMENT']);
    }

    if (subscription) {
      const planType = subscription.plan_type;
      if (planType.includes('ANNUAL')) setBillingCycle('ANNUAL');
      else if (planType.includes('QUARTERLY')) setBillingCycle('QUARTERLY');
      else setBillingCycle('MONTHLY');
      
      // Detect if currently on basic plan
      if (planType.includes('SERVICE')) {
        setIsBasicMode(true);
      }
    }
  }, [activeModules, subscription, business?.type]);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setIsLoadingCards(true);
    try {
      const cards = await SubscriptionService.getSavedCards();
      setSavedCards(cards);
      if (cards.length > 0) {
        const defaultCard = cards.find(c => c.is_default) || cards[0];
        setSelectedCardId(defaultCard.id);
        setIsUsingSavedCard(true);
      }
    } catch (error) {
      console.error("Failed to fetch saved cards:", error);
    } finally {
      setIsLoadingCards(false);
    }
  };

  const handleSavedCardPayment = async () => {
    if (!selectedCardId) {
      Alert.alert("Error", "Please select a payment method.");
      return;
    }

    setProcessing(true);
    try {
      const planType = isBasicMode ? `SERVICE_${billingCycle}` : billingCycle;
      await processSavedCardSubscription({
        plan_type: planType as any,
        modules: selectedModules,
        card_id: selectedCardId
      });
      Alert.alert("Success", "Subscription updated successfully!");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Payment Failed", error.response?.data?.error || "Failed to process payment with saved card.");
    } finally {
      setProcessing(false);
    }
  };

  const toggleModule = (moduleType: string) => {
    setSelectedModules(prev => {
      const isRemoving = prev.includes(moduleType);
      let next = isRemoving 
        ? prev.filter(m => m !== moduleType) 
        : [...prev, moduleType];
      
      // Enforce Dependencies
      if (!isRemoving) {
        // Find if this module has dependencies
        const moduleData = availableModules.find(m => m.type === moduleType);
        if (moduleData?.depends_on) {
          moduleData.depends_on.forEach(dep => {
            if (!next.includes(dep)) {
              next.push(dep);
              const depName = availableModules.find(m => m.type === dep)?.name || dep;
              Alert.alert("Auto-selected", `${moduleData.name} requires ${depName}.`);
            }
          });
        }
      } else {
        // If removing a dependency, remove children? 
        // Example: If removing Inventory, remove Recipe.
        availableModules.forEach(m => {
          if (m.depends_on?.includes(moduleType) && next.includes(m.type)) {
            next = next.filter(mod => mod !== m.type);
            Alert.alert("Auto-removed", `Removing ${moduleType} also removes ${m.name}.`);
          }
        });
      }
      
      return next;
    });
  };

  const calculateTotal = useMemo(() => {
    const isWithinActivePlan = isSubscribed && subscription?.plan_type === (isBasicMode ? `SERVICE_${billingCycle}` : billingCycle);
    const currentBasePlan = plans.find(p => p.type === (isBasicMode ? `SERVICE_${billingCycle}` : billingCycle));
    const basePlanMonthly = plans.find(p => p.type === (isBasicMode ? 'SERVICE_MONTHLY' : 'MONTHLY'));
    
    const monthMultiplier = billingCycle === 'ANNUAL' ? 12 : billingCycle === 'QUARTERLY' ? 3 : 1;
    const cycleDiscount = billingCycle === 'ANNUAL' ? 0.85 : billingCycle === 'QUARTERLY' ? 0.9 : 1;
    
    // Check which modules are new vs already active
    const activeModTypes = activeModules.map(m => m.module);
    const newModules = selectedModules.filter(m => !activeModTypes.includes(m));

    let finalTotal = 0;
    let originalTotal = 0;
    let isProratedAddon = false;
    let creditAmount = 0;
    let isUpgrade = false;

    if (isSubscribed && subscription && !isWithinActivePlan && subscription.plan_type !== 'TRIAL') {
      // SCENARIO: UPGRADE
      const oldPlan = plans.find(p => p.type === subscription.plan_type);
      if (oldPlan && currentBasePlan && currentBasePlan.price > oldPlan.price) {
        isUpgrade = true;
        // Local calculation of credit (sync with backend)
        creditAmount = (daysRemaining / oldPlan.duration_days) * (subscription.amount_paid || oldPlan.price);
      }
    }

    if (isWithinActivePlan && daysRemaining > 5) {
      // SCENARIO: MID-CYCLE ADD-ON
      isProratedAddon = true;
      
      newModules.forEach(modType => {
        const mod = availableModules.find(m => m.type === modType);
        if (mod) {
          const proratedPrice = (mod.price / 30) * daysRemaining;
          finalTotal += proratedPrice;
          originalTotal += proratedPrice;
        }
      });
    } else {
      // SCENARIO: FRESH START OR RENEWAL OR UPGRADE
      const basePriceWithCycle = currentBasePlan?.price || 0;
      finalTotal = basePriceWithCycle;
      originalTotal = (basePlanMonthly?.price || 0) * monthMultiplier;

      selectedModules.forEach(modType => {
        const mod = availableModules.find(m => m.type === modType);
        if (mod) {
          finalTotal += mod.price * monthMultiplier * cycleDiscount;
          originalTotal += mod.price * monthMultiplier;
        }
      });

      if (isUpgrade) {
          finalTotal -= creditAmount;
      }
    }
    
    if (promoDiscount > 0) {
      finalTotal = finalTotal * (1 - promoDiscount / 100);
    }

    const savings = originalTotal - finalTotal;

    return {
        finalTotal: Math.max(0, finalTotal),
        originalTotal,
        savings,
        discountPercent: isProratedAddon ? 0 : (Math.round((savings / originalTotal) * 100) || 0),
        basePlanName: currentBasePlan?.name,
        isProratedAddon,
        isUpgrade,
        creditAmount,
        newModulesCount: newModules.length
    };
  }, [billingCycle, selectedModules, promoDiscount, plans, availableModules, isBasicMode, isSubscribed, subscription, daysRemaining, activeModules]);

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
          <TouchableOpacity 
            onPress={() => navigation.navigate("SubscriptionHistory")}
            style={styles.historyButton}
          >
            <Ionicons name="receipt-outline" size={24} color={Colors.gray900} />
          </TouchableOpacity>
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

          {/* Plan Type Toggle */}
          <View style={styles.modeToggleContainer}>
             <TouchableOpacity 
               style={[styles.modeButton, !isBasicMode ? styles.modeButtonActive : null]}
               onPress={() => setIsBasicMode(false)}
             >
                <Text style={[styles.modeButtonText, !isBasicMode ? styles.modeButtonTextActive : null]}>Growing Business</Text>
             </TouchableOpacity>
             <TouchableOpacity 
               style={[styles.modeButton, isBasicMode ? styles.modeButtonActive : null]}
               onPress={() => {
                   setIsBasicMode(true);
                   setSelectedModules([]); // Clear modules for basic
               }}
             >
                <Text style={[styles.modeButtonText, isBasicMode ? styles.modeButtonTextActive : null]}>Starter / Basic</Text>
             </TouchableOpacity>
          </View>

          {/* 1. Billing Cycle */}
          <View style={styles.sectionHeader}>
            <View style={styles.stepCircle}><Text style={styles.stepText}>1</Text></View>
            <Text style={styles.sectionTitle}>Billing Cycle</Text>
          </View>
          
          <View style={styles.cycleGrid}>
            {[
              { id: 'MONTHLY', label: 'Monthly', tag: 'Standard', icon: 'calendar-outline' },
              { id: 'QUARTERLY', label: 'Quarterly', tag: isBasicMode ? '+1 User' : 'Save 10%', icon: 'layers-outline' },
              { id: 'ANNUAL', label: 'Annual', tag: isBasicMode ? '+3 Users' : 'Save 15%', icon: 'sparkles-outline' }
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
            <Text style={styles.sectionTitle}>{isBasicMode ? 'Included Features' : 'Custom Add-ons'}</Text>
          </View>
          
          {isBasicMode ? (
              <View style={styles.basicPlanCard}>
                <View style={styles.basicPlanIcon}>
                   <Ionicons name="storefront" size={40} color={Colors.teal} />
                </View>
                <Text style={styles.basicPlanTitle}>Basic Sales Mode</Text>
                <Text style={styles.basicPlanDesc}>Perfect for small shops & kiosks. Track sales, print receipts, and manage a small catalog of up to 25 items.</Text>
                <View style={styles.basicPlanBadge}>
                   <Ionicons name="shield-checkmark" size={14} color={Colors.teal} />
                   <Text style={styles.basicPlanBadgeText}>Essential Features Only</Text>
                </View>
              </View>
          ) : (
            <View style={styles.modulesList}>
                {availableModules.map((mod) => {
                  const isSelected = selectedModules.includes(mod.type);
                  const isRecommended = (mod.type === 'BULK_STOCK_MANAGEMENT') && (business?.type === 'FUEL_STATION' || business?.type === 'LPG_STATION');

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
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.moduleTitle}>{mod.name}</Text>
                          {isRecommended && (
                            <View style={styles.recommendedBadge}>
                               <Text style={styles.recommendedBadgeText}>Recommended</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.moduleRate}>₦{mod.price.toLocaleString()} / month</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={Colors.gray300} />
                    </TouchableOpacity>
                  );
                })}
            </View>
          )}
          
          {/* Promo Code Section */}
          <View style={styles.promoSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.stepCircle}><Text style={styles.stepText}>3</Text></View>
              <Text style={styles.sectionTitle}>Promo Code</Text>
            </View>
            <View style={styles.promoInputRow}>
              <TextInput
                style={[styles.promoInput, appliedPromo ? styles.promoInputApplied : null]}
                placeholder="PROMO CODE"
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
                placeholderTextColor={Colors.gray400}
                editable={!isVerifyingPromo}
              />
              <TouchableOpacity 
                style={[styles.applyBtn, !promoCode && styles.applyBtnDisabled]}
                onPress={async () => {
                  if (!promoCode.trim()) return;
                  if (appliedPromo === promoCode.trim()) {
                    setAppliedPromo(null);
                    setPromoDiscount(0);
                    setPromoCode("");
                    return;
                  }
                  setIsVerifyingPromo(true);
                  try {
                    const res = await SubscriptionService.validatePromoCode(promoCode.trim());
                    if (res.success) {
                      setPromoDiscount(res.discount_percentage);
                      setAppliedPromo(promoCode.trim());
                      Alert.alert("Success", "Promo code applied!");
                    }
                  } catch (e: any) {
                    Alert.alert("Invalid", e.response?.data?.error || "Invalid promo code");
                  } finally {
                    setIsVerifyingPromo(false);
                  }
                }}
              >
                {isVerifyingPromo ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.applyBtnText}>{appliedPromo === promoCode.trim() ? "Remove" : "Apply"}</Text>
                )}
              </TouchableOpacity>
            </View>
            {appliedPromo && (
              <View style={styles.promoSuccess}>
                <Ionicons name="gift-outline" size={14} color={Colors.success} />
                <Text style={styles.promoSuccessText}>{promoDiscount}% discount applied!</Text>
              </View>
            )}
          </View>

          {/* Saved Cards Section */}
          {savedCards.length > 0 && (
            <View style={styles.promoSection}>
              <View style={[styles.sectionHeader, { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.stepCircle}><Text style={styles.stepText}>4</Text></View>
                  <Text style={styles.sectionTitle}>Payment Method</Text>
                </View>
                <TouchableOpacity onPress={() => setIsUsingSavedCard(!isUsingSavedCard)}>
                  <Text style={{ color: Colors.teal, fontWeight: '900', fontSize: 10 }}>
                    {isUsingSavedCard ? "ADD NEW" : "USE SAVED"}
                  </Text>
                </TouchableOpacity>
              </View>

              {isUsingSavedCard && (
                <View style={{ marginTop: 15 }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 5 }}>
                    {savedCards.map(card => (
                      <TouchableOpacity 
                        key={card.id} 
                        onPress={() => setSelectedCardId(card.id)}
                        style={{
                          backgroundColor: selectedCardId === card.id ? Colors.slate900 : Colors.gray50,
                          padding: 15,
                          borderRadius: 20,
                          marginRight: 10,
                          borderWidth: 1,
                          borderColor: selectedCardId === card.id ? Colors.slate900 : Colors.gray100,
                          minWidth: 160,
                          shadowColor: Colors.slate900,
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: selectedCardId === card.id ? 0.2 : 0,
                          shadowRadius: 8,
                          elevation: selectedCardId === card.id ? 4 : 0,
                          position: 'relative'
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                          <Ionicons 
                            name="card-outline" 
                            size={18} 
                            color={selectedCardId === card.id ? "white" : Colors.gray500} 
                          />
                          <Text style={{ 
                            marginLeft: 8, 
                            color: selectedCardId === card.id ? "white" : Colors.slate800,
                            fontWeight: '900',
                            fontSize: 13
                          }}>
                            •••• {card.last4}
                          </Text>
                        </View>
                        <Text style={{ 
                          color: selectedCardId === card.id ? Colors.gray400 : Colors.gray500,
                          fontSize: 10,
                          fontWeight: '700'
                        }}>
                          {card.brand} • Exp {card.exp_month}/{card.exp_year}
                        </Text>
                        {selectedCardId === card.id && (
                          <View style={{ position: 'absolute', top: 10, right: 10 }}>
                            <Ionicons name="checkmark-circle" size={16} color={Colors.teal} />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}
          
          {/* Order Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryHeading}>Order Summary</Text>
            
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Base Terminal ({billingCycle})</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(plans.find(p => p.type === (isBasicMode ? `SERVICE_${billingCycle}` : billingCycle))?.price || 0, 'NGN')}
              </Text>
            </View>

            {calculateTotal.newModulesCount > 0 && (
              <View style={styles.summaryLine}>
                <Text style={styles.summaryLabel}>
                  {calculateTotal.isProratedAddon ? 'New Add-ons (Prorated)' : 'Premium Add-ons'}
                </Text>
                <Text style={styles.summaryValue}>
                  {calculateTotal.newModulesCount} {calculateTotal.isProratedAddon ? 'Items' : 'Active'}
                </Text>
              </View>
            )}

            {calculateTotal.isProratedAddon && (
              <View style={styles.prorationNotice}>
                <Ionicons name="information-circle-outline" size={14} color={Colors.teal} />
                <Text style={styles.prorationNoticeText}>
                  Prorated for {daysRemaining} days remaining in current cycle
                </Text>
              </View>
            )}

            {calculateTotal.isUpgrade && (
              <View style={styles.prorationNotice}>
                <Ionicons name="sparkles" size={14} color={Colors.teal} />
                <Text style={styles.prorationNoticeText}>
                  Upgrade Credit: -{formatCurrency(calculateTotal.creditAmount, 'NGN')} (Unused value)
                </Text>
              </View>
            )}

            <View style={styles.finalTotalContainer}>
              <View>
                <Text style={styles.totalPrompt}>
                  {calculateTotal.isProratedAddon ? 'Add-on Total' : 'Amount to Pay'}
                </Text>
                <Text style={styles.totalBilling}>
                  {calculateTotal.isProratedAddon ? 'CURRENT CYCLE' : `${billingCycle} BILLING`}
                </Text>
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
                {promoDiscount > 0 && !calculateTotal.isProratedAddon && (
                  <View style={styles.promoDiscountRow}>
                    <Text style={styles.promoDiscountText}>PROMO: -{promoDiscount}%</Text>
                  </View>
                )}
                <Text style={styles.finalPrice}>{formatCurrency(calculateTotal.finalTotal, 'NGN')}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.checkoutBtn, processing && { opacity: 0.7 }]}
              onPress={() => {
                if (calculateTotal.finalTotal <= 0 && calculateTotal.isProratedAddon) {
                  Alert.alert("Already Active", "These modules are already active in your current plan.");
                  return;
                }
                if (isUsingSavedCard && selectedCardId) {
                  handleSavedCardPayment();
                } else {
                  setCheckoutVisible(true);
                }
              }}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.checkoutBtnText}>
                    {isUsingSavedCard ? 'Subscribe with Saved Card' : (calculateTotal.isProratedAddon ? 'Add to Current Plan' : 'Confirm and Upgrade')}
                  </Text>
                  <Ionicons name={isUsingSavedCard ? "checkmark-circle" : "arrow-forward"} size={20} color="white" />
                </>
              )}
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
                <View style={styles.checkoutSummary}>
                  <Text style={styles.checkTitle}>Order Breakdown</Text>
                  <View style={styles.checkLine}>
                    <Text style={styles.checkLabel}>Base Subtotal</Text>
                    <Text style={styles.checkValue}>
                      {formatCurrency(calculateTotal.originalTotal, 'NGN')}
                    </Text>
                  </View>
                  {calculateTotal.savings > 0 && (
                    <View style={styles.checkLine}>
                      <Text style={styles.checkLabel}>Cycle Discount</Text>
                      <Text style={[styles.checkValue, { color: Colors.success }]}>
                        -{formatCurrency(calculateTotal.savings, 'NGN')}
                      </Text>
                    </View>
                  )}
                  {promoDiscount > 0 && !calculateTotal.isProratedAddon && (
                    <View style={styles.checkLine}>
                      <Text style={styles.checkLabel}>Promo Discount ({promoDiscount}%)</Text>
                      <Text style={[styles.checkValue, { color: Colors.success }]}>
                        -{formatCurrency((calculateTotal.finalTotal / (1 - promoDiscount/100)) * (promoDiscount/100), 'NGN')}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.checkLine, { borderTopWidth: 1, borderTopColor: Colors.gray100, marginTop: 10, paddingTop: 10 }]}>
                    <Text style={styles.checkLabelBold}>Final Payment</Text>
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
        amount={calculateTotal.finalTotal.toString()}
        billingEmail={user?.email || ""}
        billingName={`${user?.first_name || ""} ${user?.last_name || ""}`}
        currency="NGN"
        activityIndicatorColor={Colors.teal}
        onCancel={() => Alert.alert("Cancelled", "Payment cancelled")}
          onSuccess={async (res: any) => {
          try {
            await processSubscription(
              isBasicMode ? `SERVICE_${billingCycle}` : billingCycle, 
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
  historyButton: { padding: 8, borderRadius: 12, backgroundColor: Colors.gray50 },
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
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.gray100,
    borderRadius: 16,
    padding: 6,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  modeButtonActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gray400,
  },
  modeButtonTextActive: {
    color: Colors.teal,
    fontWeight: '900',
  },
  basicPlanCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.teal + '20',
    borderStyle: 'dashed',
    marginBottom: 40,
  },
  basicPlanIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.teal + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  basicPlanTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.gray900,
    marginBottom: 8,
    textAlign: 'center',
  },
  basicPlanDesc: {
    fontSize: 13,
    color: Colors.gray500,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  basicPlanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.teal + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  basicPlanBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.teal,
    textTransform: 'uppercase',
  },
  recommendedBadge: {
    backgroundColor: Colors.teal + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: Colors.teal + '30',
  },
  recommendedBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: Colors.teal,
    textTransform: 'uppercase',
  },
  prorationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.teal + '10',
    padding: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  prorationNoticeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.teal,
    flex: 1,
  },
  promoSection: {
    marginBottom: 40,
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  promoInputApplied: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '05',
  },
  promoSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: Colors.success + '10',
    padding: 10,
    borderRadius: 12,
  },
  promoSuccessText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.success,
    textTransform: 'uppercase',
  },
  promoDiscountRow: {
    marginBottom: 2,
    alignItems: 'flex-end',
  },
  promoDiscountText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.success,
    textTransform: 'uppercase',
  },
});
