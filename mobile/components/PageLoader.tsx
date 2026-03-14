import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';

const PageLoader = () => {
  return (
    <View style={styles.container}>
      <View style={styles.loaderCard}>
        <View style={styles.logoContainer}>
          <ShoppingBag size={48} color="#d4af37" />
        </View>
        <Text style={styles.title}>SJG Stationery</Text>
        <Text style={styles.subtitle}>Loading your experience...</Text>
        <ActivityIndicator size="large" color="#d4af37" style={styles.spinner} />
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f3f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    minWidth: 300,
  },
  logoContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#d4af37',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  spinner: {
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#d4af37',
    borderRadius: 2,
    width: '70%', // Fixed progress for loading animation
  },
});

export default PageLoader;