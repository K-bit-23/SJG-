import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import { ArrowLeft, ShieldCheck, Lock, CreditCard, Smartphone, Truck, CheckCircle, Info } from 'lucide-react-native';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'COD'>('CARD');
  const [upiId, setUpiId] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 40;
  const total = subtotal + shipping;

  const handlePayment = async () => {
    if (paymentMethod === 'UPI' && !upiId.includes('@')) {
      Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID (e.g. user@okhdfc)');
      return;
    }

    if (paymentMethod === 'CARD') {
      Alert.alert(
        "Card Payment",
        "Stripe Checkout initiated! (Demo Mode: Processing mock payment sheet...)",
        [{ text: "Complete", onPress: () => finalizeOrder() }]
      );
    } else if (paymentMethod === 'UPI') {
      Alert.alert(
        "UPI Request Sent",
        `A payment request of ₹${total} has been sent to ${upiId}. Please approve it in your UPI app.`,
        [{ text: "I've Paid", onPress: () => finalizeOrder() }]
      );
    } else {
      Alert.alert(
        "Order Confirmed",
        `Your order of ₹${total} will be delivered shortly. Please keep the cash ready!`,
        [{ text: "Okay", onPress: () => finalizeOrder() }]
      );
    }
  };

  const finalizeOrder = () => {
    clearCart();
    router.replace('/(tabs)/orders');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review & Pay</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payable Amount</Text>
          <Text style={styles.priceText}>₹{total.toFixed(2)}</Text>
          <Text style={styles.itemCount}>{cart.length} items in cart</Text>
        </View>

        <Text style={styles.sectionTitle}>Select Payment Method</Text>
        
        <View style={styles.methodSelector}>
          <TouchableOpacity 
            style={[styles.methodBtn, paymentMethod === 'CARD' && styles.methodBtnActive]} 
            onPress={() => setPaymentMethod('CARD')}
          >
            <CreditCard size={20} color={paymentMethod === 'CARD' ? '#000' : '#6b7280'} />
            <Text style={[styles.methodText, paymentMethod === 'CARD' && styles.methodTextActive]}>Card</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.methodBtn, paymentMethod === 'UPI' && styles.methodBtnActive]} 
            onPress={() => setPaymentMethod('UPI')}
          >
            <Smartphone size={20} color={paymentMethod === 'UPI' ? '#000' : '#6b7280'} />
            <Text style={[styles.methodText, paymentMethod === 'UPI' && styles.methodTextActive]}>UPI</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.methodBtn, paymentMethod === 'COD' && styles.methodBtnActive]} 
            onPress={() => setPaymentMethod('COD')}
          >
            <Truck size={20} color={paymentMethod === 'COD' ? '#000' : '#6b7280'} />
            <Text style={[styles.methodText, paymentMethod === 'COD' && styles.methodTextActive]}>COD</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Payment UI */}
        <View style={styles.paymentBox}>
          {paymentMethod === 'CARD' && (
            <View style={styles.stripePlaceholder}>
              <View style={styles.mockInput}>
                <Text style={{color: '#9ca3af'}}>Card Number</Text>
                <Lock size={16} color="#9ca3af" />
              </View>
              <View style={{flexDirection: 'row', gap: 10}}>
                <View style={[styles.mockInput, {flex: 2}]}><Text style={{color: '#9ca3af'}}>MM / YY</Text></View>
                <View style={[styles.mockInput, {flex: 1}]}><Text style={{color: '#9ca3af'}}>CVC</Text></View>
              </View>
            </View>
          )}

          {paymentMethod === 'UPI' && (
            <View style={styles.upiBox}>
              <Text style={styles.inputTitle}>Quick Pay with App</Text>
              <View style={styles.quickUpiRow}>
                <TouchableOpacity style={styles.upiAppBtn} onPress={() => setUpiId('gpay@okaxis')}>
                  <View style={[styles.upiIconBox, {backgroundColor: '#e8f0fe'}]}>
                    <Smartphone size={20} color="#1a73e8" />
                  </View>
                  <Text style={styles.upiAppText}>GPay</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.upiAppBtn} onPress={() => setUpiId('phonepe@ybl')}>
                  <View style={[styles.upiIconBox, {backgroundColor: '#f3e5f5'}]}>
                    <Smartphone size={20} color="#7b1fa2" />
                  </View>
                  <Text style={styles.upiAppText}>PhonePe</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.upiAppBtn} onPress={() => setUpiId('paytm@paytm')}>
                  <View style={[styles.upiIconBox, {backgroundColor: '#e1f5fe'}]}>
                    <Smartphone size={20} color="#00baf2" />
                  </View>
                  <Text style={styles.upiAppText}>Paytm</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <Text style={styles.inputTitle}>Enter UPI ID</Text>
              <TextInput 
                placeholder="e.g. mobile-number@upi" 
                style={styles.upiInput}
                value={upiId}
                onChangeText={setUpiId}
                autoCapitalize="none"
              />
              <View style={styles.upiInfo}>
                <Info size={14} color="#6b7280" />
                <Text style={styles.upiInfoText}>A request will be sent to your UPI app</Text>
              </View>
            </View>
          )}

          {paymentMethod === 'COD' && (
            <View style={styles.codBox}>
              <CheckCircle size={32} color="#16a34a" />
              <Text style={styles.codTitle}>Cash on Delivery</Text>
              <Text style={styles.codDesc}>Pay with cash when your stationery arrives at your doorstep.</Text>
            </View>
          )}
        </View>

        <View style={styles.securityBox}>
          <ShieldCheck size={24} color="#16a34a" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.secTitle}>Guaranteed Safe Checkout</Text>
            <Text style={styles.secDesc}>Professional grade encryption and industry standard security protocols.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.payBtn} onPress={handlePayment}>
          <Lock size={18} color="#000" />
          <Text style={styles.payBtnText}>
            {paymentMethod === 'COD' ? 'Place Order' : `Pay ₹${total.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
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
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 25, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 13, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  priceText: { fontSize: 38, fontWeight: '900', color: '#000' },
  itemCount: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 0.5 },
  methodSelector: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  methodBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', paddingVertical: 12, borderRadius: 12, gap: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  methodBtnActive: { backgroundColor: '#d4af37', borderColor: '#d4af37' },
  methodText: { fontSize: 14, fontWeight: 'bold', color: '#6b7280' },
  methodTextActive: { color: '#000' },
  paymentBox: { marginBottom: 25 },
  stripePlaceholder: { backgroundColor: '#fff', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 1, gap: 12 },
  mockInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', height: 55, borderRadius: 10, paddingHorizontal: 15, borderWidth: 1, borderColor: '#f3f4f6' },
  upiBox: { backgroundColor: '#fff', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
  inputTitle: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 10 },
  upiInput: { backgroundColor: '#f9fafb', height: 55, borderRadius: 10, paddingHorizontal: 15, borderWidth: 1, borderColor: '#e5e7eb', fontSize: 16 },
  upiInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  upiInfoText: { fontSize: 12, color: '#6b7280' },
  codBox: { backgroundColor: '#fff', padding: 25, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
  codTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginTop: 12, marginBottom: 4 },
  codDesc: { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
  securityBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', padding: 18, borderRadius: 16, marginBottom: 25 },
  secTitle: { fontSize: 14, fontWeight: 'bold', color: '#166534', marginBottom: 2 },
  secDesc: { fontSize: 12, color: '#15803d', lineHeight: 18 },
  payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#d4af37', paddingVertical: 18, borderRadius: 14, gap: 10, shadowColor: '#d4af37', shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  payBtnText: { color: '#000', fontSize: 18, fontWeight: '900', textTransform: 'uppercase' },
  quickUpiRow: { flexDirection: 'row', gap: 15, marginBottom: 20, marginTop: 5 },
  upiAppBtn: { flex: 1, alignItems: 'center', gap: 8 },
  upiIconBox: { width: 55, height: 55, borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 },
  upiAppText: { fontSize: 12, color: '#374151', fontWeight: 'bold' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#f3f4f6' },
  dividerText: { fontSize: 10, color: '#9ca3af', fontWeight: 'bold' }
});
