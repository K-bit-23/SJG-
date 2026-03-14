import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CheckCircle, Package, ArrowRight, Home, XCircle } from 'lucide-react-native';
import api from '../utils/api';

const PaymentSuccess = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.order_id || '';
  const sessionId = params.session_id || '';
  const [countdown, setCountdown] = useState(10);
  const [status, setStatus] = useState('confirming'); // confirming, success, error

  useEffect(() => {
    const confirmPayment = async () => {
      if (sessionId) {
        try {
          await api.post('/confirm-stripe-session/', {
            session_id: sessionId,
            order_id: orderId
          });
          setStatus('success');
        } catch (err) {
          console.error('Confirmation error:', err);
          setStatus('error');
        }
      } else {
        setStatus('success');
      }
    };

    confirmPayment();

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.replace('/(tabs)');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router, sessionId, orderId]);

  const getStatusColor = () => {
    switch (status) {
      case 'confirming': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#22c55e';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'confirming': return <ActivityIndicator size="large" color="#fff" />;
      case 'error': return <XCircle size={52} color="#fff" />;
      default: return <CheckCircle size={52} color="#fff" />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Success Icon with pulse ring */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconBackground, { backgroundColor: getStatusColor() }]}>
            {getStatusIcon()}
          </View>
        </View>

        <Text style={[styles.title, { color: getStatusColor() }]}>
          {status === 'confirming' ? 'Confirming Payment...' : 
           status === 'error' ? 'Payment Verification Failed' : 
           'Payment Successful! 🎉'}
        </Text>

        <Text style={styles.subtitle}>
          {status === 'confirming' ? 'Please wait while we verify your transaction with Stripe.' :
           status === 'error' ? 'There was a problem verifying your payment. Please contact support if your account was debited.' :
           "Your order has been confirmed and is now being processed. You'll receive an email confirmation shortly (within 30 seconds)."}
        </Text>

        {orderId ? (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Package size={20} color="#16a34a" />
              <Text style={styles.orderLabel}>Order ID</Text>
            </View>
            <Text style={styles.orderId}>{orderId}</Text>
          </View>
        ) : null}

        {/* What's next */}
        <View style={styles.nextSteps}>
          <Text style={styles.nextStepsTitle}>What happens next?</Text>
          {[
            '✅ Order confirmation email sent',
            '📦 Your order is being packed',
            '🚚 Delivery within 3–5 business days',
          ].map((step, i) => (
            <Text key={i} style={styles.stepText}>{step}</Text>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(tabs)/orders')}
          >
            <Package size={16} color="#16a34a" />
            <Text style={styles.secondaryButtonText}>My Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Home size={16} color="#fff" />
            <Text style={styles.primaryButtonText}>Go Home</Text>
            <ArrowRight size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.countdown}>
          Auto-redirecting in {countdown}s...
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 40,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.12,
    shadowRadius: 80,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 34,
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  orderCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#86efac',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orderLabel: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  orderId: {
    color: '#15803d',
    fontWeight: '700',
    fontSize: 15,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  nextSteps: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    width: '100%',
  },
  nextStepsTitle: {
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    fontSize: 14,
  },
  stepText: {
    color: '#6b7280',
    fontSize: 13,
    marginVertical: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    flexWrap: 'wrap',
  },
  secondaryButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#16a34a',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 120,
  },
  secondaryButtonText: {
    color: '#16a34a',
    fontWeight: '700',
    fontSize: 14,
  },
  primaryButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    minWidth: 120,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  countdown: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 24,
    textAlign: 'center',
  },
});

export default PaymentSuccess;