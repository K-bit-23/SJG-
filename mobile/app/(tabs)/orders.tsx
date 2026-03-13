import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Package, ChevronRight, Clock, CheckCircle2, User } from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';
import { Image } from 'react-native';

const DUMMY_ORDERS = [
  { id: 'ORD-2024-9182', date: 'March 10, 2024', status: 'Delivered', total: 1299, items: 3 },
  { id: 'ORD-2024-8842', date: 'March 05, 2024', status: 'Processing', total: 450, items: 1 },
];

export default function Orders() {
  const { user } = useUser();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.welcomeText}>Order</Text>
          <Text style={styles.profileName}>History</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileCircle}
          onPress={() => router.push('/(tabs)/profile')}
        >
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} style={styles.profileImg} />
          ) : (
            <User size={24} color="#0a7ea4" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSubtitle}>{DUMMY_ORDERS.length} past orders</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0a7ea4" />}
      >
        {DUMMY_ORDERS.map((order) => (
          <TouchableOpacity key={order.id} style={styles.orderCard}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Package size={20} color="#4b5563" />
                <Text style={styles.orderId}>{order.id}</Text>
              </View>
              <View style={[styles.statusBadge, order.status === 'Delivered' ? styles.statusDelivered : styles.statusProcessing]}>
                {order.status === 'Delivered' ? (
                  <CheckCircle2 size={12} color="#16a34a" />
                ) : (
                  <Clock size={12} color="#d97706" />
                )}
                <Text style={[styles.statusText, order.status === 'Delivered' ? {color: '#16a34a'} : {color: '#d97706'}]}>
                  {order.status}
                </Text>
              </View>
            </View>
            
            <View style={styles.cardBody}>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{order.date}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Items</Text>
                <Text style={styles.infoValue}>{order.items} items</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Total</Text>
                <Text style={[styles.infoValue, {fontWeight: '900', color: '#000'}]}>₹{order.total}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.viewDetailsText}>View Order Details</Text>
              <ChevronRight size={16} color="#d4af37" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  profileCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  profileImg: {
    width: '100%',
    height: '100%',
  },
  header: { backgroundColor: '#fff', paddingTop: 10, paddingBottom: 15, paddingHorizontal: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 3, zIndex: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  headerSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  scrollContent: { padding: 15, flexGrow: 1 },
  orderCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 15, padding: 15, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusDelivered: { backgroundColor: '#dcfce7' },
  statusProcessing: { backgroundColor: '#fef3c7' },
  statusText: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  infoCol: { gap: 4 },
  infoLabel: { fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' },
  infoValue: { fontSize: 14, color: '#4b5563', fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', padding: 12, borderRadius: 10 },
  viewDetailsText: { fontSize: 13, fontWeight: 'bold', color: '#1f2937' }
});
