import React, { useState, useEffect } from 'react';
import { ShoppingBag, Truck, ShieldCheck, Clock, ArrowRight, ChevronLeft, ChevronRight as ChevronRightIcon, Printer, FileText, Layers, Copy, BookOpen, Palette, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../src/utils/api';
import { useNotifications } from '../../src/context/NotificationContext';

// Categories with modern icons/images
// Default categories if backend is empty
const DEFAULT_CATEGORIES = [
    { name: "Notebooks", count: "120+ Products", img: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80" },
    { name: "Pens & Writing", count: "80+ Products", img: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=300&q=80" },
    { name: "Art Supplies", count: "200+ Products", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=300&q=80" },
    { name: "Office Desk", count: "50+ Products", img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=300&q=80" },
];

// Banners, categories, and other constants remain...

// Default banners
const DEFAULT_BANNERS = [
    {
        id: 1,
        title: "Elevate Your Workspace",
        subtitle: "New Collection 2024",
        description: "Discover premium stationery designed for creators, thinkers, and professionals.",
        img: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1600&q=80",
        btnText: "Shop Now",
        btnLink: "/products"
    },
    {
        id: 2,
        title: "Back to School Sale",
        subtitle: "Up to 50% Off",
        description: "Get ready for the new academic year with our premium notebooks and supplies.",
        img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80",
        btnText: "Shop Sale",
        btnLink: "/products?category=notebooks"
    },
    {
        id: 3,
        title: "Art Supplies Collection",
        subtitle: "For Creative Minds",
        description: "Explore our curated collection of professional art supplies and tools.",
        img: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1600&q=80",
        btnText: "Explore Art",
        btnLink: "/products?category=art"
    }
];

// Icon mapping for dynamic content from backend
const ICON_MAP = {
    Layers,
    Copy,
    Printer,
    BookOpen,
    FileText,
    Palette,
    Sparkles,
    ShoppingBag,
    Truck,
    ShieldCheck,
    Clock
};

const Home = () => {
    const { showCallout } = useNotifications();
    const [bannerContent, setBannerContent] = useState(null);
    const [currentBanner, setCurrentBanner] = useState(0);
    const [banners, setBanners] = useState(DEFAULT_BANNERS);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Show premium welcome callout
        showCallout("Free delivery on orders above ₹1000! 🚚 Shop the new 2024 collection now.", "premium", "Exclusive Offer");
    }, []);


    useEffect(() => {
        api.get('/content/home/')
            .then(res => {
                setBannerContent(res.data);
                if (res.data?.banners?.length) {
                    setBanners(res.data.banners);
                }
                if (res.data?.categories?.length) {
                    setCategories(res.data.categories);
                }

            })
            .catch(err => {
                console.error("Home content fetch failed:", err);
                setError('Failed to load home content');
            });
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [banners.length]);

    const nextBanner = () => setCurrentBanner(prev => (prev + 1) % banners.length);
    const prevBanner = () => setCurrentBanner(prev => (prev - 1 + banners.length) % banners.length);

    const activeBanner = banners[currentBanner];

    return (
        <div className="bg-background min-h-screen font-sans text-primary">

            {/* Hero Section with Carousel */}
            <section className="relative h-[400px] md:h-[450px] flex items-center bg-[#f0f2f5] overflow-hidden">
                <div className="absolute inset-0 z-0 transition-all duration-700">
                    <img
                        src={activeBanner.img}
                        alt="Hero"
                        className="w-full h-full object-cover"
                        key={activeBanner.id}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                    <div className="max-w-lg">
                        <span className="inline-block py-1.5 px-4 rounded-full bg-secondary/10 text-secondary text-xs font-bold tracking-wider mb-3 uppercase">
                            {activeBanner.subtitle}
                        </span>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3 text-primary">
                            {activeBanner.title}
                        </h1>
                        <p className="text-sm md:text-base text-gray-600 mb-5 leading-relaxed">
                            {activeBanner.description}
                        </p>
                        <Link
                            to={activeBanner.btnLink || "/products"}
                            className="inline-flex items-center gap-2 bg-secondary hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-lg text-sm"
                        >
                            {activeBanner.btnText || "Shop Now"} <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>

                <button onClick={prevBanner} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all">
                    <ChevronLeft size={20} className="text-gray-700" />
                </button>
                <button onClick={nextBanner} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all">
                    <ChevronRightIcon size={20} className="text-gray-700" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {banners.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentBanner(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${idx === currentBanner ? 'bg-secondary w-6' : 'bg-gray-400/50'
                                }`}
                        />
                    ))}
                </div>
            </section>

            {/* Features Strip */}
            <div className="border-b border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-full text-blue-600"><Truck size={18} /></div>
                        <div>
                            <h4 className="font-bold text-sm">Free Shipping</h4>
                            <p className="text-xs text-gray-500">On orders over ₹999</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-full text-green-600"><ShieldCheck size={18} /></div>
                        <div>
                            <h4 className="font-bold text-sm">Secure Payment</h4>
                            <p className="text-xs text-gray-500">100% secure checkout</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 rounded-full text-purple-600"><Clock size={18} /></div>
                        <div>
                            <h4 className="font-bold text-sm">24/7 Support</h4>
                            <p className="text-xs text-gray-500">Dedicated team</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 1. PRODUCTS SECTION - Shop by Category */}
            <section className="py-10 max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ShoppingBag size={20} className="text-secondary" />
                            <span className="text-xs font-bold text-secondary uppercase tracking-wide">Products</span>
                        </div>
                        <h2 className="text-2xl font-bold">Shop by Category</h2>
                    </div>
                    <Link to="/products" className="text-secondary font-medium hover:underline flex items-center gap-1 text-sm">
                        View All <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {categories.map((cat, idx) => (
                        <Link to={`/products?category=${cat.name}`} key={idx} className="group relative overflow-hidden rounded-xl cursor-pointer h-44 lg:h-52 hover-scale hover-glow">
                            <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 text-white">
                                <h3 className="font-bold">{cat.name}</h3>
                                <p className="text-xs text-white/70">{cat.count}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>




        </div>
    );
};

export default Home;
