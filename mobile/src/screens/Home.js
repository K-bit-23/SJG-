import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HomeScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>SJG Mobile App</Text>
            <Text style={styles.subtitle}>Welcome to SJG Stationery</Text>
            <Text style={styles.description}>Your one-stop shop for all stationery needs</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f3f6',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#007bff',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 20,
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default HomeScreen;