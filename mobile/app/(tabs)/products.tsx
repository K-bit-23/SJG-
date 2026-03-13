import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Image, TouchableOpacity, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { Search, ShoppingBag, Heart, Star, Sparkles, Filter, User } from 'lucide-react-native';
import { useCart } from '../../context/CartContext';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import api from '../../utils/api';
import * as SecureStore from 'expo-secure-store';

const CATEGORIES = ['all', 'Notebooks', 'Pens', 'Art Supplies', 'Electronics', 'Office'];

export default function Products() {
  const { user } = useUser();
  const router = useRouter();
  const { addToCart } = useCart();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const fetchProducts = async () => {
    try {
      // 1. Try to load from cache first for instant UI
      const cached = await SecureStore.getItemAsync('cached_products');
      if (cached) {
        setProducts(JSON.parse(cached));
        setLoading(false);
      } else {
        setLoading(true);
      }

      // 2. Fetch fresh data from API
      const res = await api.get('/products/');
      if (Array.isArray(res.data)) {
        setProducts(res.data);
        // Save to cache for next time
        await SecureStore.setItemAsync('cached_products', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCat = activeCategory === 'all' || (p.category && p.category === activeCategory);
    const matchesSearch = p.name ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    return matchesCat && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.welcomeText}>Shop</Text>
          <Text style={styles.profileName}>{user?.firstName || 'Guest'}</Text>
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
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={18} color="#9ca3af" />
            <TextInput 
              placeholder="Search products..." 
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Filter size={20} color="#4b5563" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.catBadge, activeCategory === cat && styles.catBadgeActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>
                {cat === 'all' ? 'All Products' : cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item: any) => (item.id || item._id).toString()}
        numColumns={2}
        contentContainerStyle={styles.scrollContent}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0a7ea4" />}
        ListEmptyComponent={
          loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
              <ActivityIndicator size="large" color="#d4af37" />
            </View>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
              <Text style={{ color: '#6b7280' }}>No products found</Text>
            </View>
          )
        }
        ListHeaderComponent={
          <View style={styles.statsRow}>
            <Text style={styles.statsText}>Showing <Text style={{fontWeight: 'bold'}}>{filteredProducts.length}</Text> products</Text>
          </View>
        }
        renderItem={({ item: product }) => (
          <View style={styles.card}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: product.image || 'https://via.placeholder.com/400' }} style={styles.image} />
              <TouchableOpacity style={styles.heartBtn}>
                <Heart size={16} color="#9ca3af" />
              </TouchableOpacity>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{product.category}</Text>
              </View>
            </View>
            
            <View style={styles.details}>
              <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
              
              <View style={styles.priceRow}>
                <Text style={styles.price}>₹{product.price}</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(product)}>
                  <ShoppingBag size={14} color="#fff" />
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
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
  header: { backgroundColor: '#fff', paddingTop: 10, paddingBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 3, zIndex: 10 },
  searchRow: { flexDirection: 'row', paddingHorizontal: 15, marginBottom: 15, gap: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 20, paddingHorizontal: 15, height: 40 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333' },
  filterBtn: { width: 40, height: 40, backgroundColor: '#f3f4f6', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  categories: { paddingHorizontal: 15 },
  catBadge: { paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#f3f4f6', borderRadius: 20, marginRight: 8 },
  catBadgeActive: { backgroundColor: '#000' },
  catText: { fontSize: 12, fontWeight: '600', color: '#666' },
  catTextActive: { color: '#d4af37' },
  scrollContent: { padding: 15 },
  columnWrapper: { justifyContent: 'space-between' },
  statsRow: { marginBottom: 15 },
  statsText: { fontSize: 12, color: '#6b7280' },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 16, marginBottom: 15, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  imageContainer: { width: '100%', height: 150, backgroundColor: '#eee', position: 'relative' },
  image: { width: '100%', height: '100%' },
  heartBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: '#fff', padding: 6, borderRadius: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  badge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  details: { padding: 12 },
  name: { fontSize: 13, fontWeight: 'bold', color: '#1f2937', marginBottom: 10, height: 36 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: '900', color: '#000' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 4 },
  addBtnText: { color: '#d4af37', fontSize: 12, fontWeight: 'bold' }
});
