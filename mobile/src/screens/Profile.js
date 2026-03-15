import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
    const { user, logout } = useAuth();
    const navigation = useNavigation();

    const handleLogout = async () => {
        await logout();
    };

    if (!user) {
        return (
            <View style={styles.center}>
                <Text style={styles.title}>Please sign in to view your profile</Text>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Sign In</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcome}>Welcome back!</Text>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.email}>{user.email}</Text>
            </View>

            <View style={styles.menu}>
                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuText}>My Orders</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuText}>Wishlist</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuText}>Address Book</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuText}>Payment Methods</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuText}>Contact Us</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuText}>Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.menuItem, styles.logoutButton]}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f3f6',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#007bff',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    header: {
        backgroundColor: 'white',
        padding: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    welcome: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    email: {
        fontSize: 16,
        color: '#666',
    },
    menu: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 10,
        overflow: 'hidden',
    },
    menuItem: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuText: {
        fontSize: 16,
        color: '#333',
    },
    logoutButton: {
        borderBottomWidth: 0,
    },
    logoutText: {
        fontSize: 16,
        color: '#dc3545',
        fontWeight: 'bold',
    },
});

export default ProfileScreen;