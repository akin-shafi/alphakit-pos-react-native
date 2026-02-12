import React, { useEffect, useState, useCallback } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, DeviceEventEmitter, ActivityIndicator, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { SalesService } from "../../services/SalesService"
import { DraftService } from "../../services/DraftService"
import { ReceiptService } from "../../services/ReceiptService"
import WebSocketService, { WS_EVENTS } from "../../services/WebSocketService"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"
import { formatCurrency } from "../../utils/Formatter"
import type { Sale, PrepStatus } from "../../types"

// Local interface for KDS order (often a Draft in our system)
interface KDSOrder extends Sale {
    items: any[];
    table_number?: string;
    customer_name?: string;
    created_at: string; // Ensure it exists for Date parsing
}

export const KitchenScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { business, logout } = useAuth()
    const [orders, setOrders] = useState<KDSOrder[]>([])
    const [loading, setLoading] = useState(true)

    const fetchOrders = useCallback(async () => {
        try {
            // In our system, active orders in the kitchen are usually "DRAFTS"
            const drafts = await DraftService.listDrafts()
            setOrders(drafts)
        } catch (error) {
            console.error("[KDS] Fetch error:", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchOrders()

        if (business?.id) {
            WebSocketService.connect(business.id)
        }

        // Real-time listeners
        const subs = [
            DeviceEventEmitter.addListener(WS_EVENTS.ORDER_CREATED, (order) => {
                setOrders(prev => [order, ...prev])
            }),
            DeviceEventEmitter.addListener(WS_EVENTS.ORDER_UPDATED, (order) => {
                setOrders(prev => prev.map(o => o.id === order.id ? order : o))
            }),
            DeviceEventEmitter.addListener(WS_EVENTS.ORDER_PAID, (data) => {
                // Remove paid orders from KDS
                setOrders(prev => prev.filter(o => o.id !== data.sale_id))
            }),
            DeviceEventEmitter.addListener(WS_EVENTS.ORDER_VOIDED, (data) => {
                setOrders(prev => prev.filter(o => o.id !== data.sale_id))
            }),
            DeviceEventEmitter.addListener(WS_EVENTS.ORDER_PREP_UPDATE, (data) => {
                setOrders(prev => prev.map(o => 
                    o.id === data.sale_id ? { ...o, preparation_status: data.status } : o
                ))
            })
        ]

        return () => {
            subs.forEach(s => s.remove())
            WebSocketService.disconnect()
        }
    }, [business?.id, fetchOrders])

    const handleUpdateStatus = async (orderId: string | number, currentStatus: PrepStatus) => {
        let nextStatus: PrepStatus = "PREPARING"
        if (currentStatus === "PENDING") nextStatus = "PREPARING"
        else if (currentStatus === "PREPARING") nextStatus = "READY"
        else if (currentStatus === "READY") nextStatus = "SERVED"
        else return

        try {
            await SalesService.updatePreparationStatus(orderId, nextStatus)
            // Local state will be updated via WS or we can optimistic update
            setOrders(prev => prev.map(o => 
                o.id === orderId ? { ...o, preparation_status: nextStatus } : o
            ))
        } catch (error) {
            Alert.alert("Error", "Failed to update status")
        }
    }

    const handlePrintDocket = async (order: KDSOrder) => {
        if (!business) return;
        try {
            // Map SaleItems to match the format ReceiptService expects (CartItem style)
            const printableOrder = {
                ...order,
                items: order.items.map(item => ({
                    product: {
                        name: item.product_name,
                        price: item.unit_price,
                    },
                    quantity: item.quantity,
                    discount: 0
                }))
            };
            
             await ReceiptService.printReceipt(printableOrder as any, business)
             Alert.alert("Done", "Docket sent to printer")
        } catch (error) {
            Alert.alert("Printer Error", "Could not reach printer")
        }
    }

    const renderOrderCard = ({ item }: { item: KDSOrder }) => {
        const status = item.preparation_status || "PENDING"
        const isReady = status === "READY"
        const isPreparing = status === "PREPARING"

        return (
            <View style={[
                styles.card, 
                isReady && styles.cardReady,
                isPreparing && styles.cardPreparing
            ]}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.orderNo}>Order #{item.id}</Text>
                        <Text style={styles.tableName}>
                            {item.table_number ? `Table ${item.table_number}` : (item.customer_name || "Guest")}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, styles[`badge${status}`]]}>
                        <Text style={styles.statusText}>{status}</Text>
                    </View>
                </View>

                <View style={styles.itemList}>
                    {item.items?.map((line, idx) => (
                        <View key={idx} style={styles.itemRow}>
                            <Text style={styles.itemQty}>{line.quantity}x</Text>
                            <Text style={styles.itemName}>{line.product_name}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity 
                        style={styles.printBtn} 
                        onPress={() => handlePrintDocket(item)}
                    >
                        <Ionicons name="print-outline" size={20} color={Colors.gray600} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.processBtn, isReady && styles.servedBtn]} 
                        onPress={() => handleUpdateStatus(item.id, status)}
                    >
                        <Text style={styles.processText}>
                            {status === "PENDING" && "Start Cook"}
                            {status === "PREPARING" && "Mark Ready"}
                            {status === "READY" && "Mark Served"}
                            {status === "SERVED" && "Completed"}
                        </Text>
                        <Ionicons 
                            name={isReady ? "checkmark-done" : "arrow-forward"} 
                            size={18} 
                            color={Colors.white} 
                        />
                    </TouchableOpacity>
                </View>

                <Text style={styles.timeAgo}>
                    {new Date(item.createdAt || item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Kitchen Display (KDS)</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity onPress={fetchOrders} style={styles.iconBtn}>
                        <Ionicons name="refresh" size={24} color={Colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={logout} style={styles.iconBtn}>
                        <Ionicons name="log-out-outline" size={24} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={Colors.teal} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrderCard}
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="restaurant-outline" size={80} color={Colors.gray700} />
                            <Text style={styles.emptyText}>No active orders. Kitchen is clear!</Text>
                        </View>
                    }
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212", // Dark background for kitchen
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: "#1f1f1f",
    },
    headerTitle: {
        fontSize: Typography.xl,
        fontWeight: Typography.bold,
        color: Colors.white,
    },
    headerRight: {
        flexDirection: "row",
        gap: 15,
    },
    iconBtn: {
        padding: 5,
    },
    list: {
        padding: 10,
    },
    card: {
        flex: 1,
        backgroundColor: "#2a2a2a",
        margin: 8,
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: "#333",
        minHeight: 200,
    },
    cardPreparing: {
        borderColor: Colors.warning,
        borderWidth: 2,
    },
    cardReady: {
        borderColor: Colors.success,
        borderWidth: 2,
        backgroundColor: "#1e2e1e",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 15,
    },
    orderNo: {
        color: Colors.gray400,
        fontSize: Typography.xs,
    },
    tableName: {
        color: Colors.white,
        fontSize: Typography.lg,
        fontWeight: Typography.bold,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgePENDING: { backgroundColor: Colors.gray700 },
    badgePREPARING: { backgroundColor: Colors.warning },
    badgeREADY: { backgroundColor: Colors.success },
    badgeSERVED: { backgroundColor: Colors.teal },
    statusText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: Typography.bold,
    },
    itemList: {
        flex: 1,
        marginBottom: 15,
    },
    itemRow: {
        flexDirection: "row",
        marginBottom: 5,
        alignItems: "center",
    },
    itemQty: {
        color: Colors.teal,
        fontWeight: Typography.bold,
        marginRight: 10,
        fontSize: Typography.base,
    },
    itemName: {
        color: Colors.gray200,
        fontSize: Typography.base,
    },
    cardActions: {
        flexDirection: "row",
        gap: 10,
    },
    printBtn: {
        padding: 10,
        backgroundColor: "#3a3a3a",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    processBtn: {
        flex: 1,
        backgroundColor: Colors.teal,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        paddingVertical: 10,
    },
    servedBtn: {
        backgroundColor: Colors.success,
    },
    processText: {
        color: Colors.white,
        fontWeight: Typography.bold,
        fontSize: Typography.sm,
    },
    timeAgo: {
        color: Colors.gray600,
        fontSize: 10,
        marginTop: 10,
        textAlign: "right",
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 100,
    },
    emptyText: {
        color: Colors.gray500,
        fontSize: Typography.lg,
        marginTop: 20,
    }
})
