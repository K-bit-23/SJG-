import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { ShoppingBag, Truck, ShieldCheck, Clock, ArrowRight, Printer, FileText, Layers, Copy, BookOpen, Palette, Sparkles, MapPin, Bell, User } from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { name: "Notebooks", count: "120+ Products", img: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80" },
  { name: "Pens & Writing", count: "80+ Products", img: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=300&q=80" },
  { name: "Art Supplies", count: "200+ Products", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=300&q=80" },
  { name: "Office Desk", count: "50+ Products", img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=300&q=80" },
];

const SERVICES = [
  { name: "Lamination", desc: "Professional document lamination", icon: Layers, price: "From ₹10" },
  { name: "Xerox", desc: "High quality copies", icon: Copy, price: "From ₹1/page" },
  { name: "Printing", desc: "Color & B/W printing", icon: Printer, price: "From ₹5/page" },
  { name: "Binding", desc: "Spiral & perfect binding", icon: BookOpen, price: "From ₹30" },
];

export default function Home() {
  const router = useRouter();
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string>('');

  const fetchLocation = async () => {
    try {
      // Use cached location if available for speed
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        status = (await Location.requestForegroundPermissionsAsync()).status;
      }
      
      if (status === 'granted') {
        // Optimized: request location once but don't block the UI
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
    // Simulate push token registration
    setExpoPushToken('ExponentPushToken[...]');
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLocation();
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0a7ea4" />}
    >
      {/* Custom Header with Profile icon near title */}
      <View style={styles.topHeader}>
        <View style={styles.titleArea}>
          <Text style={styles.welcomeText}>SJG Stationery</Text>
          <View style={styles.profileRow}>
            <Text style={styles.profileName}>{user?.firstName || 'Guest'} 👋</Text>
            <TouchableOpacity 
              style={styles.headerProfileIcon}
              onPress={() => router.push('/(tabs)/profile')}
            >
              {user?.imageUrl ? (
                <Image source={{ uri: user.imageUrl }} style={styles.profileImg} />
              ) : (
                <User size={18} color="#0a7ea4" />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
           <Bell size={24} color="#1f2937" />
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Image 
          source={{ uri: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80" }}
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroBadge}>New Collection 2024</Text>
          <Text style={styles.heroTitle}>Elevate Your Workspace</Text>
          <Text style={styles.heroDesc}>Premium stationery for professionals.</Text>
          <TouchableOpacity style={styles.heroBtn} onPress={() => router.push('/(tabs)/products')}>
            <Text style={styles.heroBtnText}>Shop Now</Text>
            <ArrowRight size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Features Strip */}
      <View style={styles.featuresStrip}>
        <View style={styles.featureItem}>
          <View style={styles.featureIconBg}><Truck size={16} color="#4f46e5" /></View>
          <Text style={styles.featureText}>Free Shipping</Text>
        </View>
        <View style={styles.featureItem}>
          <View style={[styles.featureIconBg, {backgroundColor: '#dcfce7'}]}><ShieldCheck size={16} color="#16a34a" /></View>
          <Text style={styles.featureText}>Secure Pay</Text>
        </View>
        <View style={styles.featureItem}>
          <View style={[styles.featureIconBg, {backgroundColor: '#f3e8ff'}]}><Clock size={16} color="#9333ea" /></View>
          <Text style={styles.featureText}>24/7 Support</Text>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <ShoppingBag size={20} color="#000" />
            <Text style={styles.sectionTitle}>Shop by Category</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/products')}>
            <Text style={styles.viewAllBtn}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {CATEGORIES.map((cat, idx) => (
            <TouchableOpacity key={idx} style={styles.catCard} onPress={() => router.push('/(tabs)/products')}>
              <Image source={{ uri: cat.img }} style={styles.catImage} />
              <View style={styles.catOverlay}>
                <Text style={styles.catName}>{cat.name}</Text>
                <Text style={styles.catCount}>{cat.count}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Services */}
      <View style={[styles.section, { backgroundColor: '#f9fafb', paddingBottom: 30 }]}>
        <View style={[styles.sectionHeader, { justifyContent: 'center', marginBottom: 20 }]}>
          <Sparkles size={20} color="#9333ea" />
          <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>Print & Docs</Text>
        </View>

        <View style={styles.servicesGrid}>
          {SERVICES.map((srv, idx) => {
            const IconComponent = srv.icon;
            return (
              <View key={idx} style={styles.serviceCard}>
                <View style={styles.srvIconContainer}>
                  <IconComponent size={24} color="#4f46e5" />
                </View>
                <Text style={styles.srvName}>{srv.name}</Text>
                <Text style={styles.srvPrice}>{srv.price}</Text>
              </View>
            );
          })}
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
  titleArea: {
    flex: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  headerProfileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
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
