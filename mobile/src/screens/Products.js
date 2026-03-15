import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useCart } from '../context/CartContext';

const ProductsScreen = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        // Load sample products
        setProducts([
            {
                id: 1,
                name: 'Premium Notebook',
                price: 299,
            },
            {
                id: 2,
                name: 'Gel Pen Set',
                price: 149,
            },
            {
                id: 3,
                name: 'Art Supplies Kit',
                price: 599,
            }
        ]);
        setLoading(false);
    }, []);

    const renderProduct = ({ item }) => (
        <View style={styles.productCard}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>₹{item.price}</Text>
            <TouchableOpacity
                style={styles.addToCartButton}
                onPress={() => addToCart(item)}
            >
                <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <Text>Loading products...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Our Products</Text>
            <FlatList
                data={products}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.productList}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    productList: {
        paddingBottom: 20,
    },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    productPrice: {
        fontSize: 16,
        color: '#e74c3c',
        fontWeight: 'bold',
        marginBottom: 12,
    },
    addToCartButton: {
        backgroundColor: '#3498db',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    addToCartText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ProductsScreen;
                numColumns={2}
                contentContainerStyle={styles.productList}
                showsVerticalScrollIndicator={false}
            />
        </View>
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
    },
    header: {
        padding: 15,
        backgroundColor: 'white',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    productList: {
        padding: 10,
    },
    productCard: {
        flex: 1,
        backgroundColor: 'white',
        margin: 5,
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    productImage: {
        width: '100%',
        height: 150,
    },
    productInfo: {
        padding: 10,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007bff',
        marginBottom: 10,
    },
    addToCartButton: {
        backgroundColor: '#007bff',
        padding: 8,
        borderRadius: 5,
        alignItems: 'center',
    },
    addToCartText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default ProductsScreen;