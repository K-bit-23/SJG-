import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Search, ShoppingBag, Star, Grid, List, ChevronDown, X,
    SlidersHorizontal, Heart, Filter, Sparkles
} from 'lucide-react';
import { useCart } from '../../src/context/CartContext';
import { useWishlist } from '../../src/context/WishlistContext';
import api from '../../src/utils/api';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const { wishlist, addToWishlist, removeFromWishlist, isInWishlist, getProductId } = useWishlist();
    const { addToCart } = useCart();

    const toggleWishlist = (product) => {
        const productId = getProductId(product);
        if (isInWishlist(productId)) {
            removeFromWishlist(productId);
        } else {
            addToWishlist(product);
        }
    };

    // Filter & Sort States
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
    const [sortBy, setSortBy] = useState('featured');
    const [viewMode, setViewMode] = useState('grid');
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [addedItems, setAddedItems] = useState(new Set());
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    // Categories from products
    const categories = useMemo(() => {
        const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
        // Filter out "services" from customer view
        return ['all', ...cats.filter(cat => cat.toLowerCase() !== 'services')];
    }, [products]);

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const res = await api.get('/products/');
                if (Array.isArray(res.data)) {
                    setProducts(res.data);
                } else {
                    throw new Error("Invalid data format received from API");
                }
            } catch (err) {
                console.error("Error fetching products:", err);
                setProducts([]);
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
        } else {
            // Always exclude services from "All Products" view for regular users
            result = result.filter(p => p.category?.toLowerCase() !== 'services');
        }

        if (searchTerm) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.category?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        switch (sortBy) {
            case 'price-low': result.sort((a, b) => a.price - b.price); break;
            case 'price-high': result.sort((a, b) => b.price - a.price); break;
            case 'name-asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'rating': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
            default: break;
        }

        return result;
    }, [products, selectedCategory, searchTerm, sortBy]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams(searchTerm ? { search: searchTerm } : {});
    };

    const clearFilters = () => {
        setSelectedCategory('all');
        setSearchTerm('');
        setSortBy('featured');
        setSearchParams({});
    };

    const handleAddToCart = (product, e) => {
        e.stopPropagation();
        const productId = getProductId(product);
        addToCart(product);

        // Visual feedback
        setAddedItems(prev => new Set(prev).add(productId));
        setTimeout(() => {
            setAddedItems(prev => {
                const updated = new Set(prev);
                updated.delete(productId);
                return updated;
            });
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Search Header */}
            <div className="bg-white shadow-sm sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex-1 relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-gray-100 rounded-full text-sm outline-none focus:bg-white focus:ring-2 ring-secondary/20 transition-all"
                            />
                        </form>

                        {/* Filter Button */}
                        <button
                            onClick={() => setShowMobileFilter(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200 lg:hidden"
                        >
                            <Filter size={16} /> Filter
                        </button>

                        {/* Sort */}
                        <div className="hidden sm:block relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none pl-3 pr-8 py-2.5 bg-gray-100 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-200 outline-none"
                            >
                                <option value="featured">Featured</option>
                                <option value="price-low">Price: Low-High</option>
                                <option value="price-high">Price: High-Low</option>
                                <option value="name-asc">A-Z</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>

                        {/* View Toggle */}
                        <div className="hidden md:flex bg-gray-100 rounded-full p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white shadow text-secondary' : 'text-gray-500'}`}
                            >
                                <Grid size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-white shadow text-secondary' : 'text-gray-500'}`}
                            >
                                <List size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Category Pills */}
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cat === 'all' ? 'All Products' : cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Results Count */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500">
                        Showing <span className="font-bold text-gray-800">{filteredProducts.length}</span> products
                        {selectedCategory !== 'all' && <span> in <span className="text-secondary font-medium">{selectedCategory}</span></span>}
                    </p>
                    {(selectedCategory !== 'all' || searchTerm) && (
                        <button onClick={clearFilters} className="text-sm text-red-500 hover:underline">Clear filters</button>
                    )}
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-3 animate-pulse">
                                <div className="h-40 bg-gray-200 rounded-xl mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className={viewMode === 'grid'
                        ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                        : "space-y-3"
                    }>
                        {filteredProducts.map((product) => (
                            viewMode === 'grid' ? (
                                // Grid Card
                                <div key={getProductId(product)} className="group bg-white rounded-2xl overflow-hidden hover-float hover-glow border border-transparent shadow-sm">
                                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                                        <img
                                            src={product.image || "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400"}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        {/* Added Success Overlay */}
                                        {addedItems.has(getProductId(product)) && (
                                            <div className="absolute inset-0 bg-secondary/80 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-fade-in z-10">
                                                <div className="bg-white/20 p-3 rounded-full mb-2 animate-bounce-custom">
                                                    <Sparkles size={24} />
                                                </div>
                                                <span className="font-bold text-sm tracking-wider uppercase">Added!</span>
                                            </div>
                                        )}
                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}
                                                className="w-full py-2 bg-white/20 backdrop-blur-md text-white border border-white/40 rounded-xl text-xs font-bold hover:bg-white hover:text-primary transition-all flex items-center justify-center gap-2"
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={(e) => handleAddToCart(product, e)}
                                                className="w-full py-2.5 bg-white text-primary rounded-xl text-sm font-bold hover:bg-secondary hover:text-white transition-all flex items-center justify-center gap-2"
                                            >
                                                <ShoppingBag size={16} /> Add to Cart
                                            </button>
                                        </div>
                                        {/* Wishlist */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                                            className={`absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all ${isInWishlist(getProductId(product))
                                                ? 'bg-red-500 text-white'
                                                : 'bg-white/90 text-gray-500 hover:text-red-500'
                                                }`}
                                        >
                                            <Heart size={16} fill={isInWishlist(getProductId(product)) ? 'currentColor' : 'none'} />
                                        </button>
                                        {/* Category Badge */}
                                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold uppercase tracking-wide">
                                            {product.category}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1 min-h-[40px]">
                                            {product.name}
                                        </h3>
                                        
                                        {/* Stock Indicator */}
                                        <div className="mb-3">
                                            {product.stock <= 0 ? (
                                                <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Out of Stock</span>
                                            ) : product.stock < 10 ? (
                                                <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Only {product.stock} Left</span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">{product.stock} Units In Stock</span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-lg font-bold text-primary">₹{product.price}</span>
                                            </div>
                                            <button
                                                onClick={(e) => handleAddToCart(product, e)}
                                                disabled={product.stock <= 0}
                                                className={`p-2 rounded-full transition-all hover-scale shadow-lg ${product.stock <= 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-secondary text-white hover:bg-indigo-600 shadow-secondary/20'}`}
                                                title={product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                                            >
                                                <ShoppingBag size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // List Card
                                <div key={getProductId(product)} className="bg-white rounded-2xl p-4 flex gap-4 hover-float hover-glow border border-transparent shadow-sm">
                                    <div className="w-28 h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                        <img
                                            src={product.image || "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400"}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                         <div>
                                             <div className="flex items-center justify-between">
                                                 <span className="text-xs text-secondary font-medium">{product.category}</span>
                                                 {/* Stock Indicator */}
                                                 <div className="text-right">
                                                     {product.stock <= 0 ? (
                                                         <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Out of Stock</span>
                                                     ) : product.stock < 10 ? (
                                                         <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Only {product.stock} Left</span>
                                                     ) : (
                                                         <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">{product.stock} Units</span>
                                                     )}
                                                 </div>
                                             </div>
                                             <h3 className="font-semibold text-gray-800">{product.name}</h3>
                                         </div>
                                         <div className="flex items-center justify-between">
                                             <span className="text-xl font-bold text-primary">₹{product.price}</span>
                                             <div className="flex gap-2">
                                                 <button
                                                     onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                                                     className={`p-2 rounded-lg transition-all ${isInWishlist(getProductId(product)) ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500'}`}
                                                 >
                                                     <Heart size={18} fill={isInWishlist(getProductId(product)) ? 'currentColor' : 'none'} fillOpacity={isInWishlist(getProductId(product)) ? 1 : 0} />
                                                 </button>
                                                 <button
                                                     onClick={(e) => handleAddToCart(product, e)}
                                                     disabled={product.stock <= 0}
                                                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${product.stock <= 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-secondary text-white hover:bg-indigo-600'}`}
                                                 >
                                                     <ShoppingBag size={16} /> {product.stock <= 0 ? 'Sold Out' : 'Add'}
                                                 </button>
                                             </div>
                                         </div>
                                     </div>
                                </div>
                            )
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-400 mb-2">No products found</h3>
                        <p className="text-gray-400 mb-4">Try adjusting your filters</p>
                        <button onClick={clearFilters} className="px-6 py-2 bg-secondary text-white rounded-full text-sm font-medium">
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile Filter Drawer */}
            {showMobileFilter && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileFilter(false)}></div>
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[70vh] overflow-y-auto animate-slide-up">
                        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-bold">Filters</h2>
                            <button onClick={() => setShowMobileFilter(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-gray-800 mb-3">Categories</h3>
                            <div className="space-y-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => { setSelectedCategory(cat); setShowMobileFilter(false); }}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all ${selectedCategory === cat
                                            ? 'bg-secondary text-white'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {cat === 'all' ? 'All Products' : cat}
                                    </button>
                                ))}
                            </div>

                            <h3 className="font-bold text-gray-800 mt-6 mb-3">Sort By</h3>
                            <div className="space-y-2">
                                {[
                                    { value: 'featured', label: 'Featured' },
                                    { value: 'price-low', label: 'Price: Low to High' },
                                    { value: 'price-high', label: 'Price: High to Low' }
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => { setSortBy(opt.value); setShowMobileFilter(false); }}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all ${sortBy === opt.value
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => { clearFilters(); setShowMobileFilter(false); }}
                                className="w-full mt-6 py-3 border-2 border-gray-200 rounded-xl text-gray-600 font-medium"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick View Modal */}
            {quickViewProduct && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setQuickViewProduct(null)}></div>
                    <div className="bg-[#f8f9fa] rounded-3xl w-full max-w-md overflow-hidden relative z-10 animate-slide-up shadow-2xl">
                        <button 
                            onClick={() => setQuickViewProduct(null)} 
                            className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white backdrop-blur-md rounded-full text-gray-800 z-20 transition-colors shadow-sm"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="relative aspect-square bg-white">
                            <span className="absolute top-4 left-4 bg-[#ff4d4f] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                                {quickViewProduct.stock ? `Only ${quickViewProduct.stock} left!` : 'Limited Stock!'}
                            </span>
                            <img 
                                src={quickViewProduct.image || "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400"} 
                                alt={quickViewProduct.name}
                                className="w-full h-full object-contain p-8 mix-blend-multiply"
                            />
                        </div>
                        
                        <div className="p-6 text-center bg-white rounded-t-3xl border-t border-gray-100 -mt-6 relative z-10">
                            <h3 className="font-extrabold text-xl text-slate-800 mb-1">{quickViewProduct.name}</h3>
                            <p className="text-sm text-slate-500 mb-4">{quickViewProduct.category?.toLowerCase()}</p>
                            
                            <div className="text-3xl font-black text-[#0066FF] mb-6 tracking-tight">
                                ₹{quickViewProduct.price}
                            </div>
                            
                            <button
                                onClick={(e) => {
                                    handleAddToCart(quickViewProduct, e);
                                    setQuickViewProduct(null);
                                }}
                                className="w-full py-4 bg-[#0066FF] hover:bg-blue-700 text-white rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5"
                            >
                                <ShoppingBag size={20} /> Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
