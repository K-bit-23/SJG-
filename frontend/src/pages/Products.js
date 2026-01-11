import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import {
    Filter, Search, ShoppingBag, Star, Grid, List, ChevronDown, X,
    SlidersHorizontal, Heart, ChevronRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const { addToCart } = useCart();

    // Helper to get product ID (handles both id and _id from MongoDB)
    const getProductId = (product) => product.id || product._id;

    // Wishlist State
    const [wishlist, setWishlist] = useState(() => {
        const saved = localStorage.getItem('wishlist');
        return saved ? JSON.parse(saved) : [];
    });

    const toggleWishlist = (product) => {
        const productId = getProductId(product);
        const isInList = wishlist.some(p => getProductId(p) === productId);
        let updated;
        if (isInList) {
            updated = wishlist.filter(p => getProductId(p) !== productId);
        } else {
            updated = [...wishlist, { ...product, id: productId }];
        }
        setWishlist(updated);
        localStorage.setItem('wishlist', JSON.stringify(updated));
        // Trigger storage event for other components
        window.dispatchEvent(new Event('storage'));
    };

    const isInWishlist = (product) => {
        const productId = getProductId(product);
        return wishlist.some(p => getProductId(p) === productId);
    };

    // Filter & Sort States
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
    const [sortBy, setSortBy] = useState('featured');
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [viewMode, setViewMode] = useState('grid');
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);

    // Categories from products
    const categories = useMemo(() => {
        const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
        return ['all', ...cats];
    }, [products]);

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const res = await axios.get('/api/products/');
                setProducts(res.data);
            } catch (err) {
                console.error("Error fetching products:", err);
                setProducts([
                    { id: 1, name: 'Premium Notebook Set', price: 299, category: 'Notebooks', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400', stock: 25, rating: 4.5 },
                    { id: 2, name: 'Executive Pen Collection', price: 599, category: 'Pens', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400', stock: 50, rating: 4.8 },
                    { id: 3, name: 'Art Supplies Bundle', price: 1299, category: 'Art Supplies', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400', stock: 15, rating: 4.2 },
                    { id: 4, name: 'Scientific Calculator', price: 899, category: 'Electronics', image: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400', stock: 30, rating: 4.6 },
                    { id: 5, name: 'Desk Organizer Pro', price: 449, category: 'Office', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', stock: 20, rating: 4.3 },
                    { id: 6, name: 'Highlighter Pack (12)', price: 199, category: 'Markers', image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400', stock: 100, rating: 4.7 },
                    { id: 7, name: 'Premium Sketchbook A4', price: 399, category: 'Notebooks', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400', stock: 40, rating: 4.4 },
                    { id: 8, name: 'Fountain Pen Classic', price: 1499, category: 'Pens', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400', stock: 10, rating: 4.9 },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Filtered & Sorted Products
    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (selectedCategory !== 'all') {
            result = result.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
        }

        if (searchTerm) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.category?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

        switch (sortBy) {
            case 'price-low': result.sort((a, b) => a.price - b.price); break;
            case 'price-high': result.sort((a, b) => b.price - a.price); break;
            case 'name-asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'name-desc': result.sort((a, b) => b.name.localeCompare(a.name)); break;
            case 'rating': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
            default: break;
        }

        return result;
    }, [products, selectedCategory, searchTerm, priceRange, sortBy]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams(searchTerm ? { search: searchTerm } : {});
    };

    const clearFilters = () => {
        setSelectedCategory('all');
        setSearchTerm('');
        setPriceRange([0, 10000]);
        setSortBy('featured');
        setSearchParams({});
    };

    // Filter Sidebar Component
    const FilterSidebar = ({ isMobile = false }) => (
        <div className={`${isMobile ? '' : 'sticky top-24'}`}>
            <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Filter size={16} /> Categories
                </h3>
                <div className="space-y-1">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => { setSelectedCategory(cat); if (isMobile) setShowMobileFilter(false); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${selectedCategory === cat
                                ? 'bg-secondary text-white font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <span>{cat === 'all' ? 'All Products' : cat}</span>
                            <ChevronRight size={14} className={selectedCategory === cat ? 'text-white' : 'text-gray-400'} />
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3">Price Range</h3>
                <div className="px-2">
                    <input
                        type="range"
                        min="0"
                        max="10000"
                        step="100"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                        className="w-full accent-secondary"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>₹0</span>
                        <span className="font-medium text-secondary">₹{priceRange[1]}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={clearFilters}
                className="w-full py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-all text-sm font-medium"
            >
                Clear All Filters
            </button>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen pt-4">
            <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
                {/* Top Search Bar */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        {/* Big Search Bar */}
                        <form onSubmit={handleSearch} className="flex-1 w-full">
                            <div className="relative">
                                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search for products, categories..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-secondary/30 focus:bg-white outline-none text-sm transition-all"
                                />
                            </div>
                        </form>

                        {/* Controls */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Toggle Filters - Desktop */}
                            <button
                                onClick={() => setShowSidebar(!showSidebar)}
                                className={`hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${showSidebar ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <SlidersHorizontal size={16} />
                                {showSidebar ? 'Hide Filters' : 'Show Filters'}
                            </button>

                            {/* Mobile Filter */}
                            <button
                                onClick={() => setShowMobileFilter(true)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-lg text-sm font-medium"
                            >
                                <SlidersHorizontal size={16} /> Filters
                            </button>

                            {/* Sort */}
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none pl-3 pr-8 py-2.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200 outline-none"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="name-asc">Name: A-Z</option>
                                    <option value="rating">Top Rated</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>

                            {/* View Mode */}
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-secondary' : 'text-gray-500'}`}
                                >
                                    <Grid size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-secondary' : 'text-gray-500'}`}
                                >
                                    <List size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Layout */}
                <div className="flex gap-6">
                    {/* Desktop Sidebar */}
                    {showSidebar && (
                        <aside className="hidden lg:block w-64 flex-shrink-0">
                            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
                                <FilterSidebar />
                            </div>
                        </aside>
                    )}

                    {/* Products Grid */}
                    <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-4">
                            Showing <strong className="text-primary">{filteredProducts.length}</strong> products
                            {selectedCategory !== 'all' && <span> in <strong className="text-secondary">{selectedCategory}</strong></span>}
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                                        <div className="h-40 bg-gray-200 rounded-lg mb-3"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className={viewMode === 'grid'
                                ? `grid grid-cols-2 ${showSidebar ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4`
                                : "flex flex-col gap-3"
                            }>
                                {filteredProducts.map((product) => (
                                    viewMode === 'grid' ? (
                                        <div key={product.id || product._id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
                                            <div className="relative h-48 bg-gray-100 overflow-hidden">
                                                <img
                                                    src={product.image || "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400"}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                {/* Wishlist Button */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                                                    className={`absolute top-2 right-2 p-2.5 rounded-full shadow-md transition-all ${isInWishlist(product)
                                                        ? 'bg-red-500 text-white scale-110'
                                                        : 'bg-white text-gray-400 hover:text-red-500 hover:scale-110'
                                                        }`}
                                                >
                                                    <Heart size={16} fill={isInWishlist(product) ? 'currentColor' : 'none'} />
                                                </button>
                                                {/* Add to Cart on Hover */}
                                                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                                                    <button
                                                        onClick={() => addToCart(product)}
                                                        className="w-full py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <ShoppingBag size={16} /> Add to Cart
                                                    </button>
                                                </div>
                                                <span className="absolute top-2 left-2 bg-white/90 px-2 py-0.5 rounded-full text-xs font-medium">
                                                    {product.category}
                                                </span>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold text-gray-800 group-hover:text-secondary transition-colors line-clamp-1 text-sm">
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-lg font-bold text-primary">₹{product.price}</span>
                                                    <div className="flex items-center gap-1 text-yellow-400 text-xs">
                                                        <Star size={12} fill="currentColor" />
                                                        <span className="text-gray-500">{product.rating || 4.5}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div key={product.id || product._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex overflow-hidden">
                                            <div className="w-32 h-32 bg-gray-100 flex-shrink-0">
                                                <img
                                                    src={product.image || "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400"}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 p-4 flex flex-col justify-between">
                                                <div>
                                                    <span className="text-xs text-secondary font-medium">{product.category}</span>
                                                    <h3 className="font-semibold text-gray-800 mt-1">{product.name}</h3>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-lg font-bold text-primary">₹{product.price}</span>
                                                    <button
                                                        onClick={() => addToCart(product)}
                                                        className="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-all"
                                                    >
                                                        Add to Cart
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-xl">
                                <ShoppingBag size={48} className="mx-auto text-gray-200 mb-3" />
                                <h3 className="text-lg font-bold text-gray-400 mb-2">No products found</h3>
                                <button onClick={clearFilters} className="px-4 py-2 bg-secondary text-white rounded-lg text-sm">
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            {showMobileFilter && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilter(false)}></div>
                    <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] bg-white shadow-xl p-5 overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold">Filters</h2>
                            <button onClick={() => setShowMobileFilter(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <FilterSidebar isMobile={true} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
