import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/ApiClient';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Tutorial {
    id: number;
    topic: string;
    title: string;
    content: string;
    display_order: number;
}

export const HowItWorksScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { business } = useAuth();
    const [tutorials, setTutorials] = useState<Tutorial[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTutorials = async () => {
        try {
            const response = await apiClient.get(`/tutorials?type=${business?.type || 'RETAIL'}`);
            if (response.data.success) {
                setTutorials(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch tutorials:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTutorials();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTutorials();
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.teal} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>How It Works</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.teal} />
                }
            >
                <View style={styles.introSection}>
                    <View style={styles.businessBadge}>
                        <Text style={styles.businessTypeText}>
                            {business?.type?.replace('_', ' ') || 'General Business'}
                        </Text>
                    </View>
                    <Text style={styles.introTitle}>Quick Guide</Text>
                    <Text style={styles.introSubtitle}>
                        Learn how BETADAY POS is tailored for your specific business needs.
                    </Text>
                </View>

                {tutorials.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="documents-outline" size={64} color={Colors.gray200} />
                        <Text style={styles.emptyText}>No tutorials found for your business type.</Text>
                    </View>
                ) : (
                    tutorials.map((item, index) => (
                        <View key={item.id} style={styles.tutorialCard}>
                            <View style={styles.topicHeader}>
                                <View style={styles.itemNumber}>
                                    <Text style={styles.numberText}>{index + 1}</Text>
                                </View>
                                <Text style={styles.topicText}>{item.topic}</Text>
                            </View>
                            <Text style={styles.titleText}>{item.title}</Text>
                            <Text style={styles.contentText}>{item.content}</Text>
                        </View>
                    ))
                )}
                
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Need more help? Contact our support team.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
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
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    introSection: {
        marginBottom: 32,
        alignItems: 'center',
    },
    businessBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: Colors.tealLight,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.teal,
        marginBottom: 16,
    },
    businessTypeText: {
        fontSize: Typography.xs,
        fontWeight: Typography.bold,
        color: Colors.teal,
        textTransform: 'uppercase',
    },
    introTitle: {
        fontSize: Typography.xxl,
        fontWeight: Typography.bold,
        color: Colors.gray900,
        marginBottom: 8,
    },
    introSubtitle: {
        fontSize: Typography.base,
        color: Colors.gray600,
        textAlign: 'center',
        lineHeight: 24,
    },
    tutorialCard: {
        backgroundColor: Colors.gray50,
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    topicHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.teal,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    numberText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    topicText: {
        fontSize: Typography.sm,
        fontWeight: Typography.bold,
        color: Colors.teal,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    titleText: {
        fontSize: Typography.lg,
        fontWeight: Typography.bold,
        color: Colors.gray900,
        marginBottom: 12,
    },
    contentText: {
        fontSize: Typography.base,
        color: Colors.gray700,
        lineHeight: 24,
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: Typography.sm,
        color: Colors.gray500,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontSize: Typography.base,
        color: Colors.gray400,
        marginTop: 16,
    },
});
