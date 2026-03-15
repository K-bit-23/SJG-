import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Trash2, ArrowLeft, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../src/context/CartContext';
import { useWishlist } from '../../src/context/WishlistContext';

const Wishlist = () => {
    const { wishlist, removeFromWishlist, clearWishlist, getProductId } = useWishlist();
    const { addToCart } = useCart();

    const moveToCart = (product) => {
        addToCart(product);
        removeFromWishlist(getProductId(product));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-16 z-30">
                <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <ArrowLeft size={20} className="text-gray-600" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Heart className="text-red-500" size={22} /> My Wishlist
                                </h1>
                                <p className="text-sm text-gray-500">{wishlist.length} items saved</p>
                            </div>
                        </div>
                        {wishlist.length > 0 && (
                            <button
                                onClick={clearWishlist}
                                className="text-sm text-red-500 hover:text-red-600 font-medium"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
                {wishlist.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart size={40} className="text-red-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">Save items you love by clicking the heart icon on products. They'll appear here!</p>
                        <Link to="/products" className="inline-flex items-center gap-2 bg-secondary text-white px-8 py-3.5 rounded-full font-semibold hover:bg-indigo-600 transition-all shadow-lg">
                            <ShoppingBag size={18} /> Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {wishlist.map(product => (
                            <div key={getProductId(product)} className="bg-white rounded-xl overflow-hidden shadow-sm hover-float hover-glow transition-all group border border-transparent">
                                {/* Image */}
                                <div className="relative h-48 bg-gray-100 overflow-hidden">
                                    <img
                                        src={product.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400'}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <button
                                        onClick={() => removeFromWishlist(getProductId(product))}
                                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={16} className="text-red-500" />
                                    </button>
                                    <span className="absolute top-2 left-2 bg-white/90 px-2 py-0.5 rounded-full text-xs font-medium">
                                        {product.category}
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-800 line-clamp-1 mb-1">{product.name}</h3>
                                    <div className="flex items-center gap-1 mb-3">
                                        <Star size={12} className="text-yellow-400 fill-current" />
                                        <span className="text-xs text-gray-500">{product.rating || 4.5}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-primary">₹{product.price}</span>
                                        <button
                                            onClick={() => moveToCart(product)}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-all"
                                        >
                                            <ShoppingBag size={14} /> Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Continue Shopping */}
                {wishlist.length > 0 && (
                    <div className="mt-6 text-center">
                        <Link to="/products" className="inline-flex items-center gap-2 text-secondary font-medium hover:underline">
                            <ArrowLeft size={16} /> Continue Shopping
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
