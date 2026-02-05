
import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { useCart } from "../../contexts/CartContext"
import { DraftService, DraftOrder } from "../../services/DraftService"
import { Colors } from "../../constants/Colors"
import { Typography } from "../../constants/Typography"
import { formatCurrency } from "../../utils/Formatter"

export const DraftOrdersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { business, user } = useAuth()
    const { clearCart, addItem } = useCart()
    const [drafts, setDrafts] = useState<DraftOrder[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchDrafts()
    }, [])

    const fetchDrafts = async () => {
        setLoading(true)
        try {
            const data = await DraftService.listDrafts()
            setDrafts(data)
        } catch (error) {
            console.error(error)
             // Silent fail or toast
        } finally {
            setLoading(false)
        }
    }

    const handleResume = (draft: DraftOrder) => {
        const isOtherCashier = draft.cashier_id && user?.id && draft.cashier_id !== user.id
        const cashierName = draft.cashier_name || "another user"

        const resumeAction = async () => {
            try {
                setLoading(true)
                clearCart()
                
                draft.items.forEach((item: any) => {
                     if (item.product_id) {
                        const product = {
                            id: item.product_id,
                            name: item.product_name,
                            price: item.unit_price,
                            stock: 999,
                        }
                        addItem(product as any, item.quantity)
                     }
                })
                
                await DraftService.deleteDraft(draft.id)
                navigation.navigate("Cart")
            } catch (e) {
                Alert.alert("Error", "Failed to resume order")
            } finally {
                setLoading(false)
            }
        }

        if (isOtherCashier) {
            Alert.alert(
                "Resume Colleague's Order", 
                `This order was saved by ${cashierName}. Do you want to take over and resume it?`, 
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Yes, Resume", onPress: resumeAction }
                ]
            )
            return
        }

        Alert.alert("Resume Order", "This will replace your current cart. Continue?", [
            { text: "Cancel", style: "cancel" },
            { text: "Resume", onPress: resumeAction }
        ])
    }

    const handleDelete = (id: number) => {
         Alert.alert("Delete Draft", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Delete", 
                style: "destructive",
                onPress: async () => {
                    try {
                        await DraftService.deleteDraft(id)
                        fetchDrafts()
                    } catch(e) {
                         Alert.alert("Error", "Failed to delete draft")
                    }
                }
            }
         ])
    }

    const renderItem = ({ item }: { item: DraftOrder }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.customerName}>
                        {item.customer_name || `Order #${item.id}`}
                    </Text>
                    {item.table_number && (
                         <View style={styles.tableBadge}>
                             <Text style={styles.tableText}>Table {item.table_number}</Text>
                         </View>
                    )}
                </View>
                <Text style={styles.date}>
                    {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.cardBody}>
                <View>
                    <Text style={styles.itemCount}>{item.items?.length || 0} Items</Text>
                    <Text style={styles.savedBy}>Saved by {item.cashier_name || "Unknown"}</Text>
                </View>
                <Text style={styles.total}>{formatCurrency(item.total, business?.currency)}</Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={20} color={Colors.error} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.resumeBtn} onPress={() => handleResume(item)}>
                    <Text style={styles.resumeText}>Resume Order</Text>
                    <Ionicons name="arrow-forward" size={16} color={Colors.white} />
                </TouchableOpacity>
            </View>
        </View>
    )

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Draft Orders</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={drafts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDrafts} />}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.empty}>
                            <Ionicons name="documents-outline" size={64} color={Colors.gray300} />
                            <Text style={styles.emptyText}>No draft orders found</Text>
                        </View>
                    ) : null
                }
            />
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
        padding: 8,
    },
    headerTitle: {
        fontSize: Typography.lg,
        fontWeight: Typography.bold,
        color: Colors.gray900,
    },
    list: {
        padding: 20,
        gap: 16,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    customerName: {
        fontSize: Typography.base,
        fontWeight: Typography.bold,
        color: Colors.gray900,
    },
    tableBadge: {
        backgroundColor: Colors.teal50,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
        alignSelf: "flex-start",
    },
    tableText: {
        fontSize: Typography.xs,
        color: Colors.teal,
        fontWeight: Typography.semibold,
    },
    date: {
        fontSize: Typography.xs,
        color: Colors.gray500,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.gray100,
        marginBottom: 12,
    },
    cardBody: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    itemCount: {
        fontSize: Typography.sm,
        color: Colors.gray600,
    },
    savedBy: {
        fontSize: Typography.xs,
        color: Colors.gray400,
        fontStyle: "italic",
        marginTop: 2,
    },
    total: {
        fontSize: Typography.lg,
        fontWeight: Typography.bold,
        color: Colors.gray900,
    },
    actions: {
        flexDirection: "row",
        gap: 12,
    },
    deleteBtn: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: Colors.red50,
        alignItems: "center",
        justifyContent: "center",
    },
    resumeBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.teal,
        borderRadius: 8,
        paddingVertical: 10,
        gap: 8,
    },
    resumeText: {
        color: Colors.white,
        fontWeight: Typography.semibold,
        fontSize: Typography.sm,
    },
    empty: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 80,
    },
    emptyText: {
        marginTop: 16,
        color: Colors.gray400,
        fontSize: Typography.base,
    }
})
