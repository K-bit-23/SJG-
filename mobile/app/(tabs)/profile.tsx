import { useUser, useAuth } from '@clerk/clerk-expo';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Package, Heart, Settings, ShieldCheck, LogOut, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useState, useCallback } from 'react';

export default function Profile() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);
  const { user } = useUser();
  const router = useRouter();


  const menuItems = [
    { title: 'My Orders', icon: <Package size={22} color="#4b5563" />, route: '/(tabs)/orders' },
    { title: 'Wishlist', icon: <Heart size={22} color="#4b5563" />, route: '/(tabs)/wishlist' },
    { title: 'Settings', icon: <Settings size={22} color="#4b5563" />, route: '/(tabs)/settings' as any },
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0a7ea4" />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
      </View>
      
      {user && (
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.fullName ? user.fullName[0] : 'U'}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.fullName || 'User'}</Text>
            <Text style={styles.userEmail}>{user.primaryEmailAddress?.emailAddress}</Text>
          </View>
        </View>
      )}

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.menuItem} 
            onPress={() => router.push(item.route as any)}
          >
            <View style={styles.menuItemLeft}>
              {item.icon}
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}

        {user?.publicMetadata?.role === 'admin' && (
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin' as any)}>
            <View style={styles.menuItemLeft}>
              <ShieldCheck size={22} color="#0a7ea4" />
              <Text style={[styles.menuItemText, { color: '#0a7ea4' }]}>Admin Dashboard</Text>
            </View>
            <ChevronRight size={20} color="#0a7ea4" />
          </TouchableOpacity>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#4b5563',
    marginLeft: 15,
    fontWeight: '500',
  },

});
