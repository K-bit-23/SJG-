import { Tabs, useRouter } from 'expo-router';
import { Home, User, ShoppingCart, Grid, Heart, Package, Settings, Plus } from 'lucide-react-native';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useCart } from '../../context/CartContext';
import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export default function TabLayout() {
  const { cartCount } = useCart();
  const router = useRouter();
  const [showFAB, setShowFAB] = useState(false);

  useEffect(() => {
    const checkSettings = async () => {
      try {
        const stored = await SecureStore.getItemAsync('user_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          setShowFAB(parsed.floatingEnabled || false);
        }
      } catch (e) {}
    };
    checkSettings();
    const interval = setInterval(checkSettings, 5000); // Poll every 5 seconds instead of 2
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Tabs screenOptions={{ tabBarActiveTintColor: '#d4af37', tabBarShowLabel: true }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="products"
          options={{
            title: 'Shop',
            tabBarIcon: ({ color }) => <Grid size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="wishlist"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Cart',
            tabBarIcon: ({ color }) => <ShoppingCart size={24} color={color} />,
            tabBarBadge: cartCount > 0 ? cartCount : undefined,
            tabBarBadgeStyle: { backgroundColor: '#d4af37', color: '#000', fontWeight: 'bold' }
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Orders',
            tabBarIcon: ({ color }) => <Package size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <User size={24} color={color} />,
            href: null,
            headerShown: false,
          }}
        />
      </Tabs>

      {showFAB && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => router.push('/(tabs)/settings')}
        >
          <Settings size={28} color="#000" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#d4af37',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#fff',
  }
});
