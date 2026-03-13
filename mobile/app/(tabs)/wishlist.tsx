import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Heart, Trash2, ShoppingBag, Star, Settings, Package, User } from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';

const DUMMY_WISHLIST = [
  { id: '1', name: 'Premium Notebook Set', price: 299, category: 'Notebooks', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400', rating: 4.5 },
];

export default function Wishlist() {
  const { user } = useUser();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [wishlist, setWishlist] = useState(DUMMY_WISHLIST);

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
          <Text style={styles.welcomeText}>Saved</Text>
          <Text style={styles.profileName}>Wishlist</Text>
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
        <View>
          <Text style={styles.headerTitle}>My Wishlist</Text>
          <Text style={styles.headerSubtitle}>{wishlist.length} items saved</Text>
        </View>
        <View style={styles.headerActions}>
          <Link href="/(tabs)/orders" asChild>
            <TouchableOpacity style={styles.headerBtn}>
              <Package size={22} color="#4b5563" />
            </TouchableOpacity>
          </Link>
          <Link href={"/(tabs)/settings" as any} asChild>
            <TouchableOpacity style={styles.headerBtn}>
              <Settings size={22} color="#4b5563" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0a7ea4" />}
      >
        {wishlist.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Heart size={40} color="#fca5a5" />
            </View>
            <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
            <Text style={styles.emptyDesc}>Save items you love by clicking the heart icon on products. They'll appear here!</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(tabs)/products')}>
              <ShoppingBag size={18} color="#d4af37" />
              <Text style={styles.browseBtnText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {wishlist.map(product => (
              <View key={product.id} style={styles.card}>
                <View style={styles.imageContainer}>
                  <Image source={{ uri: product.image }} style={styles.image} />
                  <TouchableOpacity style={styles.trashBtn}>
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{product.category}</Text>
                  </View>
                </View>
                
                <View style={styles.details}>
                  <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
                  <View style={styles.ratingRow}>
                    <Star size={12} color="#fbbf24" fill="#fbbf24" />
                    <Text style={styles.ratingText}>{product.rating}</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{product.price}</Text>
                    <TouchableOpacity style={styles.moveToCartBtn}>
                      <ShoppingBag size={14} color="#fff" />
                      <Text style={styles.moveToCartText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', paddingTop: 10, paddingBottom: 15, paddingHorizontal: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 3, zIndex: 10 },
  headerActions: { flexDirection: 'row', gap: 10 },
  headerBtn: { padding: 8, backgroundColor: '#f3f4f6', borderRadius: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  headerSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  scrollContent: { padding: 15, flexGrow: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, marginTop: 40 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginBottom: 10 },
  emptyDesc: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 30, lineHeight: 20 },
  browseBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30, gap: 8 },
  browseBtnText: { color: '#d4af37', fontSize: 16, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 16, marginBottom: 15, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  imageContainer: { width: '100%', height: 160, backgroundColor: '#eee', position: 'relative' },
  image: { width: '100%', height: '100%' },
  trashBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: '#fff', padding: 6, borderRadius: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 3 },
  badge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  details: { padding: 12 },
  name: { fontSize: 14, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  ratingText: { fontSize: 12, color: '#666' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: '900', color: '#000' },
  moveToCartBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 4 },
  moveToCartText: { color: '#d4af37', fontSize: 12, fontWeight: 'bold' }
});
