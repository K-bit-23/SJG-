import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Users, PackageOpen, LayoutDashboard, Truck } from 'lucide-react-native';

export default function AdminDashboard() {
  const router = useRouter();

  const MENU = [
    { title: 'Overview', icon: <LayoutDashboard size={24} color="#0a7ea4" /> },
    { title: 'Manage Users', icon: <Users size={24} color="#0a7ea4" /> },
    { title: 'Inventory', icon: <PackageOpen size={24} color="#0a7ea4" /> },
    { title: 'Active Orders', icon: <Truck size={24} color="#0a7ea4" /> },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Hub</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Sales</Text>
            <Text style={styles.statValue}>₹45,210</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pending Orders</Text>
            <Text style={styles.statValue}>12</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Users</Text>
            <Text style={styles.statValue}>1,402</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Status</Text>
            <Text style={[styles.statValue, {color: '#16a34a'}]}>Live</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Management Menu</Text>
        
        <View style={styles.menuGrid}>
          {MENU.map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.menuCard}>
              <View style={styles.iconCircle}>{item.icon}</View>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    backgroundColor: '#fff', 
    paddingTop: 60, 
    paddingBottom: 15, 
    paddingHorizontal: 20, 
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 3, zIndex: 10 
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  content: { flex: 1, padding: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
  statCard: { width: '48%', backgroundColor: '#000', padding: 15, borderRadius: 12, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  statLabel: { color: '#9ca3af', fontSize: 12, textTransform: 'uppercase', marginBottom: 4, fontWeight: 'bold' },
  statValue: { color: '#d4af37', fontSize: 22, fontWeight: '900' },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', marginBottom: 15 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  menuCard: { width: '48%', backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#e0f2fe', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  menuTitle: { fontSize: 14, fontWeight: '600', color: '#1f2937' }
});
