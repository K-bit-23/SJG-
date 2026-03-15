import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Image, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { ShoppingBag, ArrowRight, Trash2, Minus, Plus, Tag, ShieldCheck, Truck, Gift, User } from 'lucide-react-native';
import { useCart } from '../../context/CartContext';
import { useUser } from '@clerk/clerk-expo';

export default function Cart() {
  const { user } = useUser();
  const router = useRouter();
  const { cart, removeFromCart, addToCart, decrementFromCart } = useCart();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = 0;
  const shipping = subtotal > 999 ? 0 : 50;
  const total = subtotal - discount + shipping;

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.welcomeText}>Your</Text>
          <Text style={styles.profileName}>Cart</Text>
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
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <Text style={styles.headerSubtitle}>{cart.length} items inside</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0a7ea4" />}
      >
        {cart.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <ShoppingBag size={40} color="#d4af37" />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyDesc}>Start adding items to your cart to fill it up!</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(tabs)/products')}>
              <Text style={styles.browseBtnText}>Start Shopping</Text>
              <ArrowRight size={18} color="#d4af37" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Free Shipping Banner */}
            {subtotal < 999 && (
              <View style={styles.shippingBanner}>
                <View style={styles.truckCircle}><Truck size={16} color="#d97706" /></View>
                <View style={{flex: 1}}>
                  <Text style={styles.shippingText}>Add <Text style={{fontWeight: 'bold'}}>₹{999 - subtotal}</Text> more for FREE shipping!</Text>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${(subtotal/999)*100}%` }]} />
                  </View>
                </View>
              </View>
            )}

            {/* Cart Items List */}
            <View style={styles.cartList}>
              {cart.map(item => (
                <View key={item.id} style={styles.cartItem}>
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <View style={styles.itemHeaderSec}>
                      <View>
                        <Text style={styles.itemCat}>{item.category}</Text>
                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                      </View>
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => removeFromCart(item.id)}>
                        <Trash2 size={16} color="#9ca3af" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.itemBottomSec}>
                      <View style={styles.qtyBox}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => decrementFromCart(item.id)}><Minus size={14} color="#666" /></TouchableOpacity>
                        <Text style={styles.qtyValue}>{item.quantity}</Text>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(item)}><Plus size={14} color="#666" /></TouchableOpacity>
                      </View>
                      <View style={{alignItems: 'flex-end'}}>
                        <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Order Summary */}
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              
              <View style={styles.couponRow}>
                <View style={styles.couponInputWrapper}>
                  <Tag size={16} color="#9ca3af" style={styles.couponIcon} />
                  <TextInput placeholder="Enter code" style={styles.couponInput} />
                </View>
                <TouchableOpacity style={styles.applyBtn}><Text style={styles.applyBtnText}>Apply</Text></TouchableOpacity>
              </View>

              <View style={styles.totalsGroup}>
                <View style={styles.totalRow}><Text style={styles.totalLabel}>Subtotal</Text><Text style={styles.totalVal}>₹{subtotal}</Text></View>
                <View style={styles.totalRow}><Text style={styles.totalLabel}>Shipping</Text><Text style={[styles.totalVal, shipping === 0 && {color: '#16a34a'}]}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</Text></View>
                <View style={[styles.totalRow, styles.grandTotalRow]}><Text style={styles.grandTotalLabel}>Total</Text><Text style={styles.grandTotalVal}>₹{total}</Text></View>
              </View>

              <Link href="/checkout" asChild>
                <TouchableOpacity style={styles.checkoutBtn}>
                  <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
                  <ArrowRight size={18} color="#d4af37" />
                </TouchableOpacity>
              </Link>

              {/* Trust Badges */}
              <View style={styles.trustBadges}>
                <View style={styles.trustItem}><ShieldCheck size={20} color="#9ca3af" /><Text style={styles.trustText}>Secure</Text></View>
                <View style={styles.trustItem}><Truck size={20} color="#9ca3af" /><Text style={styles.trustText}>Fast Delivery</Text></View>
                <View style={styles.trustItem}><Gift size={20} color="#9ca3af" /><Text style={styles.trustText}>Gift Wrap</Text></View>
              </View>
            </View>
          </>
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
  header: { backgroundColor: '#fff', paddingTop: 10, paddingBottom: 15, paddingHorizontal: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 3, zIndex: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  headerSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  scrollContent: { padding: 15, flexGrow: 1, paddingBottom: 50 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, marginTop: 40 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginBottom: 10 },
  emptyDesc: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 30, lineHeight: 20 },
  browseBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30, gap: 8 },
  browseBtnText: { color: '#d4af37', fontSize: 16, fontWeight: 'bold' },
  
  shippingBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffbeb', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#fde68a', marginBottom: 15, gap: 12 },
  truckCircle: { backgroundColor: '#fef3c7', padding: 8, borderRadius: 20 },
  shippingText: { fontSize: 13, color: '#92400e', marginBottom: 6 },
  progressBarBg: { height: 6, backgroundColor: '#fde68a', borderRadius: 3 },
  progressBarFill: { height: 6, backgroundColor: '#f59e0b', borderRadius: 3 },

  cartList: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3, elevation: 2, marginBottom: 20 },
  cartItem: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 15 },
  itemImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#f3f4f6' },
  itemInfo: { flex: 1, justifyContent: 'space-between' },
  itemHeaderSec: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemCat: { fontSize: 10, color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
  itemName: { fontSize: 14, fontWeight: 'bold', color: '#1f2937' },
  deleteBtn: { padding: 4 },
  itemBottomSec: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  qtyBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 20 },
  qtyBtn: { padding: 8 },
  qtyValue: { width: 24, textAlign: 'center', fontSize: 13, fontWeight: 'bold' },
  itemPrice: { fontSize: 16, fontWeight: '900', color: '#000' },

  summaryBox: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 15 },
  couponRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  couponInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12 },
  couponIcon: { marginRight: 8 },
  couponInput: { flex: 1, height: 44, fontSize: 14, color: '#333' },
  applyBtn: { backgroundColor: '#f3f4f6', justifyContent: 'center', paddingHorizontal: 16, borderRadius: 10 },
  applyBtnText: { fontWeight: '600', color: '#4b5563', fontSize: 14 },
  
  totalsGroup: { gap: 10, marginBottom: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { color: '#6b7280', fontSize: 14 },
  totalVal: { fontWeight: '600', color: '#374151', fontSize: 14 },
  grandTotalRow: { borderTopWidth: 1, borderTopColor: '#e5e7eb', borderStyle: 'dashed', paddingTop: 15, marginTop: 5 },
  grandTotalLabel: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  grandTotalVal: { fontSize: 20, fontWeight: '900', color: '#000' },
  
  checkoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', paddingVertical: 16, borderRadius: 12, gap: 10 },
  checkoutBtnText: { color: '#d4af37', fontSize: 16, fontWeight: 'bold' },

  trustBadges: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 20, marginTop: 20 },
  trustItem: { alignItems: 'center', gap: 4 },
  trustText: { fontSize: 10, color: '#9ca3af' }
});
