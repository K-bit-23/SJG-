import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useCart } from '../context/CartContext';
import { useNavigation } from '@react-navigation/native';

const CartScreen = () => {
    const { cart, removeFromCart, getCartTotal, getCartCount, addToCart, decrementFromCart } = useCart();
    const navigation = useNavigation();

    const renderCartItem = ({ item }) => (
        <View style={styles.cartItem}>
            <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => decrementFromCart(item.id)}
                    >
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => addToCart(item)}
                    >
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFromCart(item.id)}
            >
                <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
        </View>
    );

    if (cart.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Your cart is empty</Text>
                <TouchableOpacity
                    style={styles.shopButton}
                    onPress={() => navigation.navigate('Products')}
                >
                    <Text style={styles.shopButtonText}>Start Shopping</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Cart ({getCartCount()} items)</Text>

            <FlatList
                data={cart}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.cartList}
            />

            <View style={styles.footer}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalAmount}>₹{getCartTotal()}</Text>
                </View>
                <TouchableOpacity style={styles.checkoutButton}>
                    <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f3f6',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
    },
    shopButton: {
        backgroundColor: '#007bff',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 8,
    },
    shopButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        padding: 20,
        backgroundColor: 'white',
        color: '#333',
    },
    cartList: {
        padding: 10,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        marginBottom: 10,
        borderRadius: 10,
        padding: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    itemDetails: {
        flex: 1,
        marginLeft: 15,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    itemPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007bff',
        marginBottom: 10,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 30,
        height: 30,
        backgroundColor: '#f0f0f0',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    quantityText: {
        marginHorizontal: 15,
        fontSize: 16,
        fontWeight: 'bold',
    },
    removeButton: {
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    removeButtonText: {
        color: '#dc3545',
        fontSize: 14,
    },
    footer: {
        backgroundColor: 'white',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007bff',
    },
    checkoutButton: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CartScreen;