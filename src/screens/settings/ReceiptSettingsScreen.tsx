import React, { useState } from "react"
import { View, Text, StyleSheet, Switch, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"
import { Button } from "../../components/Button"

export const ReceiptSettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [showLogo, setShowLogo] = useState(true)
  const [showAddress, setShowAddress] = useState(true)
  const [footerMessage, setFooterMessage] = useState("Thank you for your business!")
  const [showTax, setShowTax] = useState(true)

  const handleSave = () => {
    Alert.alert("Success", "Receipt template saved")
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receipt Template</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>Preview</Text>
          </View>
          <View style={styles.receiptPaper}>
            {showLogo && (
              <View style={styles.placeholderLogo}>
                <Ionicons name="business" size={24} color={Colors.gray400} />
              </View>
            )}
            <Text style={styles.receiptBrand}>Fiber Store</Text>
            {showAddress && <Text style={styles.receiptText}>123 Business Rd, Lagos</Text>}
            <Text style={styles.receiptDivider}>--------------------------------</Text>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptText}>Item Name</Text>
              <Text style={styles.receiptText}>$10.00</Text>
            </View>
            <Text style={styles.receiptDivider}>--------------------------------</Text>
            {showTax && (
               <View style={styles.receiptRow}>
                 <Text style={styles.receiptText}>Tax</Text>
                 <Text style={styles.receiptText}>$0.50</Text>
               </View>
            )}
             <View style={styles.receiptRow}>
               <Text style={[styles.receiptText, { fontWeight: 'bold' }]}>TOTAL</Text>
               <Text style={[styles.receiptText, { fontWeight: 'bold' }]}>$10.50</Text>
             </View>
             <Text style={styles.receiptDivider}>--------------------------------</Text>
             <Text style={[styles.receiptText, { textAlign: 'center', marginTop: 8 }]}>{footerMessage}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VISIBILITY OPTIONS</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowTitle}>Show Business Logo</Text>
              <Switch
                value={showLogo}
                onValueChange={setShowLogo}
                trackColor={{ false: Colors.gray200, true: Colors.teal }}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowTitle}>Show Address</Text>
              <Switch
                value={showAddress}
                onValueChange={setShowAddress}
                trackColor={{ false: Colors.gray200, true: Colors.teal }}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowTitle}>Show Tax Breakdown</Text>
              <Switch
                value={showTax}
                onValueChange={setShowTax}
                trackColor={{ false: Colors.gray200, true: Colors.teal }}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CUSTOM TEXT</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Footer Message</Text>
              <TextInput
                style={styles.input}
                value={footerMessage}
                onChangeText={setFooterMessage}
                multiline
                maxLength={100}
              />
            </View>
          </View>
        </View>

        <Button title="Save Template" onPress={handleSave} primaryColor={Colors.teal} style={styles.button} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  previewCard: {
    alignItems: 'center',
    marginBottom: 8,
  },
  previewHeader: {
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: Typography.sm,
    color: Colors.gray500,
    fontWeight: Typography.semibold,
  },
  receiptPaper: {
    backgroundColor: Colors.white,
    width: '80%',
    padding: 20,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderLogo: {
    width: 48,
    height: 48,
    backgroundColor: Colors.gray100,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptBrand: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    textAlign: 'center',
    marginBottom: 4,
  },
  receiptText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: Colors.black,
  },
  receiptDivider: {
    fontSize: 12,
    color: Colors.gray400,
    marginVertical: 4,
    textAlign: 'center',
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.gray500,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray100,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  rowTitle: {
    fontSize: Typography.base,
    color: Colors.gray900,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray100,
  },
  inputGroup: {
    padding: 16,
    gap: 8,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.gray700,
  },
  input: {
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 8,
    padding: 12,
    fontSize: Typography.base,
    color: Colors.gray900,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 8,
  },
})
