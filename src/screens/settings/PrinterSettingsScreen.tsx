import React, { useState, useEffect, useRef, useMemo } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
  Easing,
  PermissionsAndroid,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"
import { Button } from "../../components/Button"
import { Input } from "../../components/Input"
import { BleManager, Device } from "react-native-ble-plx"
import * as ExpoDevice from "expo-device"
// import * as Location from "expo-location"

type PrinterType = "bluetooth" | "network" | "internal"

interface Printer {
  id: string
  name: string
  address: string
  type: PrinterType,
  device?: Device // Store raw device for connection
}

export const PrinterSettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedType, setSelectedType] = useState<PrinterType>("bluetooth")
  const [permissionsGranted, setPermissionsGranted] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [printers, setPrinters] = useState<Printer[]>([])
  
  const [manualIp, setManualIp] = useState("")
  const [manualPort, setManualPort] = useState("9100")
  const [manualName, setManualName] = useState("")
  
  const [isBleSupported, setIsBleSupported] = useState(true)
  
  // BLE Manager reference
  const manager = useMemo(() => {
    try {
      return new BleManager()
    } catch (e) {
      console.warn("BLE Manager could not be initialized (likely missing native module):", e)
      return null
    }
  }, [])
  
  // Animation
  const spinValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Reset on mount
    if (!manager) {
      setIsBleSupported(false)
    }
    return () => {
      manager?.destroy()
    }
  }, [manager])

  useEffect(() => {
    // Reset state when type changes
    setPrinters([])
    setIsScanning(false)
    manager?.stopDeviceScan() // Stop any ongoing scan
    checkPermissions(selectedType)
  }, [selectedType])

  useEffect(() => {
    if (isScanning) {
      startSpinning()
    } else {
      stopSpinning()
    }
  }, [isScanning])

  const startSpinning = () => {
    spinValue.setValue(0)
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start()
  }

  const stopSpinning = () => {
    spinValue.stopAnimation()
  }

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Bluetooth Scan Permission",
        message: "App requires Bluetooth Scanning to find printers",
        buttonPositive: "OK",
      }
    )
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Bluetooth Connect Permission",
        message: "App requires Bluetooth Connect to connect to printers",
        buttonPositive: "OK",
      }
    )
    const fineLocationPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "App requires Location permission to scan for Bluetooth devices",
          buttonPositive: "OK",
        }
      )

    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted"
    )
  }

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "App requires Location permission to scan for Bluetooth devices",
            buttonPositive: "OK",
          }
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
             setPermissionsGranted(true)
             startScanning()
        } else {
            setPermissionsGranted(false)
        }
      } else {
        const isGranted = await requestAndroid31Permissions()
        setPermissionsGranted(isGranted)
        if (isGranted) startScanning()
      }
    } else {
      // iOS
      setPermissionsGranted(true) // Assumed for now, actual request happens on use
      startScanning()
    }
  }

  const checkPermissions = async (type: PrinterType) => {
    if (type === "internal" || type === "network") {
        setPermissionsGranted(true)
        return
    }
    // For Bluetooth, we will check on "Allow Access" or auto-check if we could
    // For now, we set to false to force user to press "Turn On/Allow"
    setPermissionsGranted(false) 
  }

  const startScanning = async () => {
    if (selectedType === "bluetooth") {
       scanBluetooth()
    } else if (selectedType === "internal") {
       // Internal - mock
       setPrinters([{ id: "int1", name: "Internal Printer", address: "LOCAL", type: "internal" }])
    }
    // Network type uses manual entry, so no auto-scan
  }

  const scanBluetooth = () => {
      if (!manager) {
        Alert.alert(
          "Bluetooth Not Available",
          "Bluetooth functionality requires a custom Development Build. It will not work in Expo Go.\n\nPlease rebuild your app using 'npx expo run:android' or 'npx expo run:ios'."
        )
        return
      }

      setIsScanning(true)
      setPrinters([])

      manager.startDeviceScan(null, null, (error, device) => {
          if (error) {
              // Handle error (e.g. bluetooth off)
              console.warn("BLE Scan Error", error)
              setIsScanning(false)
              Alert.alert("Scan Error", error.message)
              return
          }

          if (device && (device.name || device.localName)) {
              setPrinters(prev => {
                  if (prev.find(p => p.id === device.id)) return prev
                  return [...prev, {
                      id: device.id,
                      name: device.name || device.localName || "Unknown Device",
                      address: device.id, // MAC on Android, UUID on iOS
                      type: "bluetooth",
                      device: device
                  }]
              })
          }
      })
      
      // Stop scan after 10 seconds
      setTimeout(() => {
          manager?.stopDeviceScan()
          setIsScanning(false)
      }, 10000)
  }

  const handleAddNetworkPrinter = () => {
    if (!manualIp) {
      Alert.alert("Invalid input", "Please enter a valid IP address")
      return
    }
    
    // Simulate adding/verifying
    setIsScanning(true) // Reuse spinner for "verifying"
    setTimeout(() => {
       setIsScanning(false)
       const newPrinter: Printer = {
           id: `net-${Date.now()}`,
           name: manualName || "Network Printer",
           address: `${manualIp}:${manualPort}`,
           type: "network"
       }
       setPrinters(prev => [...prev, newPrinter])
       setManualIp("")
       setManualName("")
       Alert.alert("Success", "Printer added successfully")
    }, 1500)
  }
  
  const handleConnect = async (printer: Printer) => {
      if (printer.type === "bluetooth" && printer.device) {
          Alert.alert("Connecting", `Connecting to ${printer.name}...`)
          try {
             const device = await printer.device.connect()
             await device.discoverAllServicesAndCharacteristics()
             Alert.alert("Success", `Connected to ${printer.name}`)
             // Save connected printer to storage here
          } catch (e: any) {
              Alert.alert("Connection Failed", e.message || "Could not connect")
          }
      } else {
        // Network/Internal
        Alert.alert("Connect", `Connecting to ${printer.name}...`, [
            { text: "Cancel", style: "cancel" },
            { text: "Connect", onPress: () => Alert.alert("Success", `Connected to ${printer.name}`) },
        ])
      }
  }

  const renderPrinterItem = ({ item }: { item: Printer }) => (
    <TouchableOpacity style={styles.printerCard} onPress={() => handleConnect(item)}>
      <View style={styles.printerIcon}>
        <Ionicons name="print" size={24} color={Colors.teal} />
      </View>
      <View style={styles.printerInfo}>
        <Text style={styles.printerName}>{item.name}</Text>
        <Text style={styles.printerAddress}>{item.address}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
    </TouchableOpacity>
  )

  const renderContent = () => {
    if (!permissionsGranted && selectedType === "bluetooth") {
      return (
        <View style={styles.centerContent}>
          <View style={styles.iconCircle}>
             <Ionicons name="bluetooth" size={48} color={Colors.gray500} />
          </View>
          <Text style={styles.permissionTitle}>Enable Bluetooth Access</Text>
          <Text style={styles.permissionText}>
            We need your permission to search for available Bluetooth printers nearby.
          </Text>
          <Button title="Allow Access" onPress={requestPermissions} primaryColor={Colors.teal} style={styles.permissionButton} />
        </View>
      )
    }

    if (selectedType === "network") {
      return (
        <View style={styles.networkParamsContainer}>
           <Text style={styles.sectionTitle}>Add Network Printer</Text>
           <Input 
             label="IP Address" 
             placeholder="e.g. 192.168.1.100" 
             value={manualIp} 
             onChangeText={setManualIp} 
             keyboardType="numeric"
           />
           <View style={{ flexDirection: "row", gap: 12 }}>
             <View style={{ flex: 1 }}>
               <Input 
                 label="Port" 
                 placeholder="9100" 
                 value={manualPort} 
                 onChangeText={setManualPort} 
                 keyboardType="numeric"
               />
             </View>
             <View style={{ flex: 1 }}>
                <Input 
                 label="Name (Optional)" 
                 placeholder="Kitchen Printer" 
                 value={manualName} 
                 onChangeText={setManualName} 
               />
             </View>
           </View>
           
           <Button 
             title={isScanning ? "Verifying..." : "Add Printer"}
             onPress={handleAddNetworkPrinter} 
             primaryColor={Colors.teal}
             loading={isScanning}
           />
           
           {printers.length > 0 && (
             <>
               <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Saved Printers</Text>
               <FlatList
                data={printers}
                keyExtractor={(item) => item.id}
                renderItem={renderPrinterItem}
                contentContainerStyle={styles.listContentNoPadding}
              />
             </>
           )}
        </View>
      )
    }

    if (isScanning) {
        return (
          <View style={styles.centerContent}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="sync" size={64} color={Colors.teal} />
            </Animated.View>
            <Text style={styles.scanningTitle}>Searching for printers...</Text>
            <Text style={styles.scanningText}>Please ensure your printer is powered on and nearby.</Text>
          </View>
        )
      }

    if (printers.length === 0) {
      return (
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.gray300} />
          <Text style={styles.emptyTitle}>No printers found</Text>
          <Text style={styles.emptyText}>We couldn't find any {selectedType} printers.</Text>
          <Button title="Try Again" onPress={startScanning} variant="outline" style={styles.retryButton} />
        </View>
      )
    }

    return (
      <FlatList
        data={printers}
        keyExtractor={(item) => item.id}
        renderItem={renderPrinterItem}
        contentContainerStyle={styles.listContent}
      />
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Printer Setup</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeTab, selectedType === "bluetooth" && styles.typeTabActive]}
          onPress={() => setSelectedType("bluetooth")}
        >
          <Ionicons name="bluetooth" size={20} color={selectedType === "bluetooth" ? Colors.teal : Colors.gray500} />
          <Text style={[styles.typeText, selectedType === "bluetooth" && styles.typeTextActive]}>Bluetooth</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeTab, selectedType === "network" && styles.typeTabActive]}
          onPress={() => setSelectedType("network")}
        >
          <Ionicons name="wifi" size={20} color={selectedType === "network" ? Colors.teal : Colors.gray500} />
          <Text style={[styles.typeText, selectedType === "network" && styles.typeTextActive]}>Wi-Fi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeTab, selectedType === "internal" && styles.typeTabActive]}
          onPress={() => setSelectedType("internal")}
        >
          <Ionicons name="hardware-chip-outline" size={20} color={selectedType === "internal" ? Colors.teal : Colors.gray500} />
          <Text style={[styles.typeText, selectedType === "internal" && styles.typeTextActive]}>Built-in</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>{renderContent()}</View>
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
  typeSelector: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    gap: 12,
  },
  typeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.gray200,
    gap: 8,
  },
  typeTabActive: {
    backgroundColor: Colors.teal50,
    borderColor: Colors.teal,
  },
  typeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.gray600,
  },
  typeTextActive: {
    color: Colors.teal,
  },
  content: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.gray100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 12,
    textAlign: "center",
  },
  permissionText: {
    fontSize: Typography.base,
    color: Colors.gray600,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    minWidth: 200,
  },
  scanningTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    marginTop: 24,
    marginBottom: 8,
  },
  scanningText: {
    fontSize: Typography.sm,
    color: Colors.gray500,
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: Typography.sm,
    color: Colors.gray500,
    marginBottom: 24,
    textAlign: "center",
  },
  retryButton: {
    minWidth: 160,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  listContentNoPadding: {
    paddingVertical: 12,
    gap: 12,
  },
  networkParamsContainer: {
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    marginBottom: 12,
  },
  printerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    gap: 16,
  },
  printerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.teal50,
    alignItems: "center",
    justifyContent: "center",
  },
  printerInfo: {
    flex: 1,
  },
  printerName: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    marginBottom: 4,
  },
  printerAddress: {
    fontSize: Typography.xs,
    color: Colors.gray500,
  },
})
