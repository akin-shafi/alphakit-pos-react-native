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
  Switch,
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"
import { Button } from "../../components/Button"
import { Input } from "../../components/Input"
import { useSettings } from "../../contexts/SettingsContext"
import * as ExpoDevice from "expo-device"

// Conditional import to handle Expo Go vs Development Build
let BleManager: any
try {
  // We only require it if we're not in the middle of a crash-prone environment
  // react-native-ble-plx might throw on require if native modules are missing
  BleManager = require("react-native-ble-plx").BleManager
} catch (e) {
  console.warn("BleManager could not be required (missing native module)")
}

type PrinterType = "bluetooth" | "network" | "internal" | "none"

interface Printer {
  id: string
  name: string
  address: string
  type: PrinterType
  device?: any 
}

export const PrinterSettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { 
    printerType, 
    printerAddress, 
    printerName, 
    printerPaperSize, 
    autoPrint, 
    updatePrinter 
  } = useSettings()

  const [selectedType, setSelectedType] = useState<PrinterType>(printerType === "none" ? "bluetooth" : printerType)
  const [permissionsGranted, setPermissionsGranted] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [printers, setPrinters] = useState<Printer[]>([])
  
  const [manualIp, setManualIp] = useState("")
  const [manualPort, setManualPort] = useState("9100")
  const [manualName, setManualName] = useState("")
  
  const [isBleSupported, setIsBleSupported] = useState(!!BleManager)
  
  // BLE Manager reference
  const manager = useMemo(() => {
    if (!BleManager) return null
    try {
      return new BleManager()
    } catch (e) {
      console.warn("BLE Manager could not be initialized:", e)
      return null
    }
  }, [])
  
  // Animation
  const spinValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!manager) {
      setIsBleSupported(false)
    }
    return () => {
      manager?.destroy()
    }
  }, [manager])

  useEffect(() => {
    setPrinters([])
    setIsScanning(false)
    try {
        manager?.stopDeviceScan()
    } catch(e) {}
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
    if (Platform.OS !== "android") return true
    try {
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
    } catch(e) {
        return false
    }
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
      setPermissionsGranted(true) 
      startScanning()
    }
  }

  const checkPermissions = async (type: PrinterType) => {
    if (type === "internal" || type === "network" || type === "none") {
        setPermissionsGranted(true)
        return
    }
    setPermissionsGranted(false) 
  }

  const startScanning = async () => {
    if (selectedType === "bluetooth") {
       scanBluetooth()
    } else if (selectedType === "internal") {
       setPrinters([{ id: "int1", name: "Internal Printer", address: "LOCAL", type: "internal" }])
    }
  }

  const scanBluetooth = () => {
      if (!manager) {
        Alert.alert(
          "Bluetooth Not Available",
          "Bluetooth functionality requires a custom Development Build (native modules). It will not work in Expo Go.\n\nYou can use Network printers instead while testing in Expo Go."
        )
        return
      }

      setIsScanning(true)
      setPrinters([])

      try {
        manager.startDeviceScan(null, null, (error: any, device: any) => {
            if (error) {
                console.warn("BLE Scan Error", error)
                setIsScanning(false)
                Alert.alert("Scan Error", "Please ensure Bluetooth is enabled")
                return
            }

            if (device && (device.name || device.localName)) {
                setPrinters(prev => {
                    if (prev.find(p => p.id === device.id)) return prev
                    return [...prev, {
                        id: device.id,
                        name: device.name || device.localName || "Unknown Device",
                        address: device.id, 
                        type: "bluetooth",
                        device: device
                    }]
                })
            }
        })
      } catch(e) {
         setIsScanning(false)
         Alert.alert("Error", "Failed to start scanning. Native module error.")
      }
      
      setTimeout(() => {
          try { manager?.stopDeviceScan() } catch(e) {}
          setIsScanning(false)
      }, 10000)
  }

  const handleAddNetworkPrinter = async () => {
    if (!manualIp) {
      Alert.alert("Invalid input", "Please enter a valid IP address")
      return
    }
    
    setIsScanning(true) 
    setTimeout(async () => {
       setIsScanning(false)
       const address = `${manualIp}:${manualPort}`
       const name = manualName || "Network Printer"
       
       await updatePrinter({
           type: "network",
           address: address,
           name: name
       })
       
       Alert.alert("Success", `Printer ${name} saved as default`)
    }, 1000)
  }
  
  const handleConnect = async (printer: Printer) => {
    if (printer.type === "bluetooth") {
        if (!manager) {
            Alert.alert("Native Error", "Bluetooth requires development build")
            return
        }
        Alert.alert("Save Printer", `Set ${printer.name} as your default receipt printer?`, [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Set Default", 
                onPress: async () => {
                    await updatePrinter({
                        type: "bluetooth",
                        address: printer.address,
                        name: printer.name
                    })
                    toastNotify(`Printer ${printer.name} ready`)
                }
            }
        ])
    } else {
        await updatePrinter({
            type: printer.type,
            address: printer.address,
            name: printer.name
        })
        Alert.alert("Success", `${printer.name} configured`)
    }
  }

  const toastNotify = (msg: string) => {
      // Small helper as we don't have react-hot-toast on mobile yet
      Alert.alert("Printer Updated", msg)
  }

  const renderPrinterItem = ({ item }: { item: Printer }) => (
    <TouchableOpacity 
        style={[
            styles.printerCard, 
            printerAddress === item.address && styles.activePrinterCard
        ]} 
        onPress={() => handleConnect(item)}
    >
      <View style={[styles.printerIcon, printerAddress === item.address && styles.activePrinterIcon]}>
        <Ionicons name="print" size={24} color={printerAddress === item.address ? Colors.white : Colors.teal} />
      </View>
      <View style={styles.printerInfo}>
        <Text style={styles.printerName}>{item.name}</Text>
        <Text style={styles.printerAddress}>{item.address}</Text>
      </View>
      {printerAddress === item.address ? (
          <Ionicons name="checkmark-circle" size={24} color={Colors.teal} />
      ) : (
          <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
      )}
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Printer Setup</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Active Printer</Text>
        </View>

        <View style={styles.activePrinterBox}>
            {printerType !== "none" ? (
                <View style={styles.activeRow}>
                    <View style={styles.activeIcon}>
                        <Ionicons 
                            name={printerType === 'bluetooth' ? 'bluetooth' : printerType === 'network' ? 'wifi' : 'hardware-chip'} 
                            size={20} 
                            color={Colors.teal} 
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.activeName}>{printerName || "Configured Printer"}</Text>
                        <Text style={styles.activeAddress}>{printerAddress}</Text>
                    </View>
                    <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>ACTIVE</Text>
                    </View>
                </View>
            ) : (
                <Text style={styles.noPrinterText}>No printer configured</Text>
            )}
        </View>

        <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Printing Preferences</Text>
        </View>

        <View style={styles.card}>
            <View style={styles.settingRow}>
                <View>
                    <Text style={styles.settingTitle}>Auto-Print Receipt</Text>
                    <Text style={styles.settingSub}>Print automatically after sale</Text>
                </View>
                <Switch 
                    value={autoPrint} 
                    onValueChange={(val) => updatePrinter({ autoPrint: val })}
                    trackColor={{ false: Colors.gray200, true: Colors.teal }}
                />
            </View>
            <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: Colors.gray100, marginTop: 12, paddingTop: 12 }]}>
                <View>
                    <Text style={styles.settingTitle}>Paper Size</Text>
                    <Text style={styles.settingSub}>Standard size for thermal rolls</Text>
                </View>
                <View style={styles.sizeToggle}>
                    {(['58mm', '80mm'] as const).map(size => (
                        <TouchableOpacity 
                            key={size}
                            onPress={() => updatePrinter({ paperSize: size })}
                            style={[styles.sizeBtn, printerPaperSize === size && styles.activeSizeBtn]}
                        >
                            <Text style={[styles.sizeBtnText, printerPaperSize === size && styles.activeSizeBtnText]}>{size}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>

        <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Find & Add Printers</Text>
        </View>

        <View style={styles.typeSelector}>
            {(['bluetooth', 'network', 'internal'] as const).map(type => (
                <TouchableOpacity
                    key={type}
                    style={[styles.typeTab, selectedType === type && styles.typeTabActive]}
                    onPress={() => setSelectedType(type)}
                >
                    <Ionicons 
                        name={type === 'bluetooth' ? 'bluetooth' : type === 'network' ? 'wifi' : 'hardware-chip-outline'} 
                        size={18} 
                        color={selectedType === type ? Colors.teal : Colors.gray500} 
                    />
                    <Text style={[styles.typeTabText, selectedType === type && styles.typeTabTextActive]}>
                        {type === 'bluetooth' ? 'BT' : type === 'network' ? 'Wi-Fi' : 'Built-in'}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

        <View style={styles.scanArea}>
            {selectedType === "bluetooth" && (
                !permissionsGranted ? (
                    <View style={styles.centerContent}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="bluetooth" size={32} color={Colors.gray500} />
                        </View>
                        <Text style={styles.scanTitle}>Bluetooth Permission</Text>
                        <Text style={styles.scanSub}>Search for nearby printers</Text>
                        <Button title="Allow Access" onPress={requestPermissions} primaryColor={Colors.teal} style={{ width: '100%', marginTop: 16 }} />
                    </View>
                ) : isScanning ? (
                    <View style={styles.centerContent}>
                        <Animated.View style={{ transform: [{ rotate: spin }] }}>
                            <Ionicons name="sync" size={48} color={Colors.teal} />
                        </Animated.View>
                        <Text style={styles.scanTitle}>Scanning...</Text>
                    </View>
                ) : (
                    <FlatList
                        scrollEnabled={false}
                        data={printers}
                        keyExtractor={(item) => item.id}
                        renderItem={renderPrinterItem}
                        ListEmptyComponent={
                            <View style={styles.centerContent}>
                                <Text style={styles.noPrinterText}>No bluetooth devices found</Text>
                                <Button title="Scan Again" onPress={startScanning} variant="outline" style={{ marginTop: 12 }} />
                            </View>
                        }
                    />
                )
            )}

            {selectedType === "network" && (
                <View style={styles.networkForm}>
                    <Input 
                        label="Printer IP" 
                        placeholder="192.168.1.100" 
                        value={manualIp} 
                        onChangeText={setManualIp} 
                        keyboardType="numeric"
                    />
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Input label="Port" value={manualPort} onChangeText={setManualPort} keyboardType="numeric" />
                        </View>
                        <View style={{ flex: 2 }}>
                            <Input label="Name" placeholder="Kitchen" value={manualName} onChangeText={setManualName} />
                        </View>
                    </View>
                    <Button 
                        title="Add & Set Default" 
                        onPress={handleAddNetworkPrinter} 
                        primaryColor={Colors.teal} 
                        loading={isScanning}
                        style={{ marginTop: 8 }}
                    />
                </View>
            )}

            {selectedType === "internal" && (
                <FlatList
                    scrollEnabled={false}
                    data={printers}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPrinterItem}
                    ListEmptyComponent={
                        <View style={styles.centerContent}>
                            <Button title="Check Hardware" onPress={startScanning} primaryColor={Colors.teal} />
                        </View>
                    }
                />
            )}
        </View>

        <View style={{ height: 40 }} />
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
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  activePrinterBox: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.teal + '40', // light teal border
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.teal + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: Colors.gray900,
  },
  activeAddress: {
    fontSize: 12,
    color: Colors.gray500,
  },
  activeBadge: {
    backgroundColor: Colors.teal,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  noPrinterText: {
    color: Colors.gray400,
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: Colors.gray800,
  },
  settingSub: {
    fontSize: 12,
    color: Colors.gray500,
  },
  sizeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.gray100,
    padding: 4,
    borderRadius: 8,
  },
  sizeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeSizeBtn: {
    backgroundColor: Colors.white,
    shadowSmall: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    }
  } as any,
  sizeBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.gray500,
  },
  activeSizeBtnText: {
    color: Colors.teal,
  },
  typeSelector: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  typeTabActive: {
    borderColor: Colors.teal,
    backgroundColor: Colors.teal + '05',
  },
  typeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray600,
  },
  typeTabTextActive: {
    color: Colors.teal,
  },
  scanArea: {
    paddingHorizontal: 16,
  },
  centerContent: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanTitle: {
    marginTop: 12,
    fontWeight: 'bold',
    color: Colors.gray700,
  },
  scanSub: {
    fontSize: 13,
    color: Colors.gray500,
    textAlign: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  printerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.gray100,
    gap: 12,
  },
  activePrinterCard: {
    borderColor: Colors.teal,
    backgroundColor: Colors.teal + '02',
  },
  printerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.teal + '08',
    alignItems: "center",
    justifyContent: "center",
  },
  activePrinterIcon: {
    backgroundColor: Colors.teal,
  },
  printerInfo: {
    flex: 1,
  },
  printerName: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.gray900,
  },
  printerAddress: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 2,
  },
  networkForm: {
      backgroundColor: Colors.white,
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: Colors.gray100,
  }
})
