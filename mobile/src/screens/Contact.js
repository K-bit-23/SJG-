import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';

const ContactScreen = () => {
    const handleCall = () => {
        Linking.openURL('tel:+919876543210');
    };

    const handleEmail = () => {
        Linking.openURL('mailto:contact@sjg.com');
    };

    const handleWhatsApp = () => {
        Linking.openURL('whatsapp://send?phone=+919876543210');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Contact Us</Text>
                <Text style={styles.subtitle}>Get in touch with our team</Text>
            </View>

            <View style={styles.contactInfo}>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>+91 98765 43210</Text>
                    <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                        <Text style={styles.actionButtonText}>Call Now</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>contact@sjg.com</Text>
                    <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
                        <Text style={styles.actionButtonText}>Send Email</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>WhatsApp</Text>
                    <Text style={styles.infoValue}>+91 98765 43210</Text>
                    <TouchableOpacity style={[styles.actionButton, styles.whatsappButton]} onPress={handleWhatsApp}>
                        <Text style={styles.actionButtonText}>Chat on WhatsApp</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.services}>
                <Text style={styles.sectionTitle}>Our Services</Text>

                <View style={styles.serviceList}>
                    <View style={styles.serviceItem}>
                        <Text style={styles.serviceName}>Lamination</Text>
                        <Text style={styles.serviceDesc}>Professional document lamination</Text>
                        <Text style={styles.servicePrice}>From ₹10</Text>
                    </View>

                    <View style={styles.serviceItem}>
                        <Text style={styles.serviceName}>Xerox / Photocopy</Text>
                        <Text style={styles.serviceDesc}>High quality copies at best rates</Text>
                        <Text style={styles.servicePrice}>From ₹1/page</Text>
                    </View>

                    <View style={styles.serviceItem}>
                        <Text style={styles.serviceName}>Printing</Text>
                        <Text style={styles.serviceDesc}>Color & B/W printing services</Text>
                        <Text style={styles.servicePrice}>From ₹5/page</Text>
                    </View>

                    <View style={styles.serviceItem}>
                        <Text style={styles.serviceName}>Binding</Text>
                        <Text style={styles.serviceDesc}>Spiral, comb & perfect binding</Text>
                        <Text style={styles.servicePrice}>From ₹30</Text>
                    </View>
                </View>
            </View>

            <View style={styles.address}>
                <Text style={styles.sectionTitle}>Visit Our Store</Text>
                <Text style={styles.addressText}>
                    SJG Stationery & Services
                    123 Main Street
                    City Name, State - 123456
                    India
                </Text>
                <Text style={styles.hoursTitle}>Business Hours:</Text>
                <Text style={styles.hoursText}>Monday - Saturday: 9:00 AM - 8:00 PM</Text>
                <Text style={styles.hoursText}>Sunday: 10:00 AM - 6:00 PM</Text>
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
        backgroundColor: 'white',
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    contactInfo: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
    },
    infoItem: {
        marginBottom: 20,
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    infoValue: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    actionButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    whatsappButton: {
        backgroundColor: '#25d366',
    },
    services: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    serviceList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    serviceItem: {
        width: '48%',
        marginBottom: 15,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    serviceDesc: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    servicePrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#007bff',
    },
    address: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
    },
    addressText: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
        marginBottom: 15,
    },
    hoursTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    hoursText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
});

export default ContactScreen;