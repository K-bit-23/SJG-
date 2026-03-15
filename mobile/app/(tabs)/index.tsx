import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Image, TouchableOpacity, Dimensions, TextInput, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingBag, Truck, ShieldCheck, Clock, ArrowRight, Printer, FileText, Layers, Copy, BookOpen, Search, MapPin, Bell, User, Star, Heart } from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { name: "Notebooks", count: "120+ Products", img: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80", color: "#FF6B6B" },
  { name: "Pens & Writing", count: "80+ Products", img: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=300&q=80", color: "#4ECDC4" },
  { name: "Art Supplies", count: "200+ Products", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=300&q=80", color: "#45B7D1" },
  { name: "Office Desk", count: "50+ Products", img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=300&q=80", color: "#96CEB4" },
];

const SERVICES = [
  { name: "Lamination", desc: "Professional document lamination", icon: Layers, price: "From ₹10", color: "#FF9FF3" },
  { name: "Xerox", desc: "High quality copies", icon: Copy, price: "From ₹1/page", color: "#54A0FF" },
  { name: "Printing", desc: "Color & B/W printing", icon: Printer, price: "From ₹5/page", color: "#5F27CD" },
  { name: "Binding", desc: "Spiral & perfect binding", icon: BookOpen, price: "From ₹30", color: "#00D2D3" },
  { name: "Typing & Docs", desc: "Professional document typing", icon: FileText, price: "From ₹20/page", color: "#FF9F43" },
];

const FEATURED_PRODUCTS = [
  { id: 1, name: "Premium Notebook", price: "₹299", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80", rating: 4.5 },
  { id: 2, name: "Artist Sketch Pad", price: "₹199", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=300&q=80", rating: 4.8 },
  { id: 3, name: "Gel Pen Set", price: "₹149", image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=300&q=80", rating: 4.3 },
];

export default function Home() {
  const router = useRouter();
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const fetchLocation = async () => {
    try {
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        status = (await Location.requestForegroundPermissionsAsync()).status;
      }

      if (status === 'granted') {
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low })
          .then(loc => setLocation(loc))
          .catch(() => console.log('Background location fetch failed'));
      }
    } catch (e) {
      console.log('Failed to fetch location');
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const renderCategory = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <TouchableOpacity
      style={[styles.categoryCard, { borderLeftColor: item.color }]}
      onPress={() => router.push('/(tabs)/products')}
    >
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <View style={styles.categoryOverlay}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryCount}>{item.count}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderService = ({ item }: { item: typeof SERVICES[0] }) => (
    <TouchableOpacity style={styles.serviceCard}>
      <View style={[styles.serviceIcon, { backgroundColor: item.color }]}>
        <item.icon size={24} color="#fff" />
      </View>
      <View style={styles.serviceContent}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceDesc}>{item.desc}</Text>
        <Text style={styles.servicePrice}>{item.price}</Text>
      </View>
      <ArrowRight size={20} color="#666" />
    </TouchableOpacity>
  );

  const renderFeaturedProduct = ({ item }: { item: typeof FEATURED_PRODUCTS[0] }) => (
    <TouchableOpacity style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.productMeta}>
          <View style={styles.rating}>
            <Star size={14} color="#FFD700" fill="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.productPrice}>{item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.location}>
            <MapPin size={16} color="#666" />
            <Text style={styles.locationText}>Erode, Tamil Nadu</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Bell size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <Text style={styles.greeting}>
          {user ? `Hello, ${user.firstName}!` : 'Welcome to SJG Stationery'}
        </Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, services..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => router.push('/(tabs)/products')}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Banner */}
        <TouchableOpacity style={styles.heroBanner} onPress={() => router.push('/(tabs)/products')}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=800&q=80' }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Back to School Sale!</Text>
            <Text style={styles.heroSubtitle}>Up to 50% off on all stationery</Text>
            <View style={styles.heroButton}>
              <Text style={styles.heroButtonText}>Shop Now</Text>
              <ArrowRight size={16} color="#d4af37" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/products')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategory}
            keyExtractor={(item) => item.name}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/products')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={FEATURED_PRODUCTS}
            renderItem={renderFeaturedProduct}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
          />
        </View>

        {/* Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Our Services</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={SERVICES}
            renderItem={renderService}
            keyExtractor={(item) => item.name}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.servicesList}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/contact')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#FF6B6B' }]}>
              <User size={24} color="#fff" />
            </View>
            <Text style={styles.quickActionText}>Contact Us</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/(tabs)/orders')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#4ECDC4' }]}>
              <Truck size={24} color="#fff" />
            </View>
            <Text style={styles.quickActionText}>Track Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/(tabs)/wishlist')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#FF9FF3' }]}>
              <Heart size={24} color="#fff" />
            </View>
            <Text style={styles.quickActionText}>Wishlist</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  scrollView: {
    flex: 1,
  },
  heroBanner: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    height: 180,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
    opacity: 0.9,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 8,
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d4af37',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#d4af37',
    fontWeight: '600',
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    width: 140,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    borderLeftWidth: 4,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  productsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  productCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  servicesList: {
    paddingHorizontal: 20,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceContent: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  serviceDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d4af37',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickAction: {
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
});
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  notificationBtn: {
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  heroSection: {
    height: 350,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  heroBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#000',
    marginBottom: 8,
    width: '80%',
  },
  heroDesc: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    alignSelf: 'flex-start',
    gap: 8,
  },
  heroBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  featuresStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureIconBg: {
    backgroundColor: '#e0e7ff',
    padding: 6,
    borderRadius: 20,
  },
  featureText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  viewAllBtn: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  catCard: {
    width: (width - 50) / 2,
    height: 160,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  catImage: {
    width: '100%',
    height: '100%',
  },
  catOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  catName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  catCount: {
    color: '#eee',
    fontSize: 12,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: (width - 50) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  srvIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#f5f3ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  srvName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  srvPrice: {
    fontSize: 12,
    color: '#000',
    fontWeight: 'bold',
  },
});
