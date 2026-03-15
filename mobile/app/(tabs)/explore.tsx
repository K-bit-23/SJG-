import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Layers, Copy, Printer, BookOpen, FileText, ArrowRight } from 'lucide-react-native';

const SERVICES = [
  {
    name: "Lamination",
    desc: "Professional document lamination services",
    icon: Layers,
    color: "from-blue-500 to-blue-600",
    price: "From ₹10",
    image: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Xerox / Photocopy",
    desc: "High quality copies at best rates",
    icon: Copy,
    color: "from-green-500 to-green-600",
    price: "From ₹1/page",
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Printing",
    desc: "Color & B/W printing services",
    icon: Printer,
    color: "from-purple-500 to-purple-600",
    price: "From ₹5/page",
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Binding",
    desc: "Spiral, comb & perfect binding",
    icon: BookOpen,
    color: "from-orange-500 to-orange-600",
    price: "From ₹30",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Typing & Docs",
    desc: "Professional document typing services",
    icon: FileText,
    color: "from-teal-500 to-teal-600",
    price: "From ₹20/page",
    image: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=400&q=80"
  },
];

export default function Services() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Our Services</Text>
        <Text style={styles.subtitle}>
          Professional printing and document services at your fingertips
        </Text>
      </View>

      <View style={styles.servicesGrid}>
        {SERVICES.map((service, index) => (
          <TouchableOpacity key={index} style={styles.serviceCard}>
            <Image source={{ uri: service.image }} style={styles.serviceImage} />
            <View style={styles.serviceContent}>
              <View style={styles.serviceIcon}>
                <service.icon size={24} color="#d4af37" />
              </View>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDesc}>{service.desc}</Text>
              <Text style={styles.servicePrice}>{service.price}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Need a Custom Service?</Text>
        <Text style={styles.contactDesc}>
          Contact us for bulk orders, special requests, or custom printing solutions.
        </Text>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => router.push('/contact')}
        >
          <Text style={styles.contactButtonText}>Get in Touch</Text>
          <ArrowRight size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f3f6',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#d4af37',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  servicesGrid: {
    padding: 16,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  serviceImage: {
    width: '100%',
    height: 150,
  },
  serviceContent: {
    padding: 16,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  serviceDesc: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d4af37',
  },
  contactSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  contactDesc: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  contactButton: {
    backgroundColor: '#d4af37',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
