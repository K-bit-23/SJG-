import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Mail, Phone, MapPin, Send, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import api from '../utils/api';

const Contact = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setStatus('sending');
    try {
      await api.post('/contact/', formData);
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      Alert.alert('Success', 'Message sent successfully! We&apos;ll get back to you soon.');
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus('error');
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
      </View>

      <View style={styles.content}>
        {/* Contact Info */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>Get in Touch</Text>
          <Text style={styles.subtitle}>
            Have questions about our products or need a custom order?
            We&apos;re here to help you elevate your workspace.
          </Text>

          <View style={styles.contactItems}>
            <View style={styles.contactItem}>
              <View style={styles.iconContainer}>
                <Phone size={24} color="#d4af37" />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactTitle}>Phone</Text>
                <Text style={styles.contactValue}>+91 93600 24821</Text>
                <Text style={styles.contactSubtext}>Mon-Fri 9am-6pm</Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <View style={styles.iconContainer}>
                <Mail size={24} color="#d4af37" />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactTitle}>Email</Text>
                <Text style={styles.contactValue}>sjgvxerox@gmail.com</Text>
                <Text style={styles.contactSubtext}>Online support 24/7</Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <View style={styles.iconContainer}>
                <MapPin size={24} color="#d4af37" />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactTitle}>Visit Us</Text>
                <Text style={styles.contactValue}>
                  Sakthi Nagar, Thindal,{'\n'}Erode - 638012.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Form */}
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Send Message</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleChange('name', value)}
              placeholder="John Doe"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              placeholder="john@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.message}
              onChangeText={(value) => handleChange('message', value)}
              placeholder="How can we help you?"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, status === 'sending' && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={status === 'sending'}
          >
            <Text style={styles.submitText}>
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </Text>
            {status !== 'sending' && <Send size={18} color="#fff" />}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f3f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 20,
  },
  infoSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#d4af37',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  contactItems: {
    gap: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  contactSubtext: {
    fontSize: 14,
    color: '#999',
  },
  formSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d4af37',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#d4af37',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Contact;