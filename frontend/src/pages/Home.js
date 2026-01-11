import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Truck, ShieldCheck, Clock, ArrowRight, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

// Categories with modern icons/images
const CATEGORIES = [
    { name: "Notebooks", count: "120+ Products", img: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80" },
    { name: "Pens & Writing", count: "80+ Products", img: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=300&q=80" },
    { name: "Art Supplies", count: "200+ Products", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=300&q=80" },
    { name: "Office Desk", count: "50+ Products", img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=300&q=80" },
];

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

const Home = () => {
    const [bannerContent, setBannerContent] = useState(null);
    const [currentBanner, setCurrentBanner] = useState(0);
    const [banners, setBanners] = useState(DEFAULT_BANNERS);

    useEffect(() => {
        // Fetch dynamic home content if available
        axios.get('/api/content/home/')
            .then(res => {
                setBannerContent(res.data);
                if (res.data?.banners?.length) {
                    setBanners(res.data.banners);
                }
            })
            .catch(err => console.log("Using default static content"));
    }, []);

    // Auto-slide banners
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
            <section className="relative h-[500px] md:h-[550px] flex items-center bg-[#f0f2f5] overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0 transition-all duration-700">
                    <img
                        src={activeBanner.img}
                        alt="Hero"
                        className="w-full h-full object-cover"
                        key={activeBanner.id}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                    <div className="max-w-lg">
                        <span className="inline-block py-1.5 px-4 rounded-full bg-secondary/10 text-secondary text-xs font-bold tracking-wider mb-4 uppercase">
                            {activeBanner.subtitle}
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 text-primary">
                            {activeBanner.title}
                        </h1>
                        <p className="text-base md:text-lg text-gray-600 mb-6 leading-relaxed">
                            {activeBanner.description}
                        </p>
                        <Link
                            to={activeBanner.btnLink || "/products"}
                            className="inline-flex items-center gap-2 bg-secondary hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-secondary/30"
                        >
                            {activeBanner.btnText || "Shop Now"} <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>

                {/* Navigation Arrows */}
                <button
                    onClick={prevBanner}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
                >
                    <ChevronLeft size={24} className="text-gray-700" />
                </button>
                <button
                    onClick={nextBanner}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
                >
                    <ChevronRightIcon size={24} className="text-gray-700" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {banners.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentBanner(idx)}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentBanner ? 'bg-secondary w-8' : 'bg-gray-400/50 hover:bg-gray-400'
                                }`}
                        />
                    ))}
                </div>
            </section>

            {/* Features Strip */}
            <div className="border-b border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-full text-blue-600"><Truck size={22} /></div>
                        <div>
                            <h4 className="font-bold text-sm">Free Express Shipping</h4>
                            <p className="text-xs text-gray-500">On all orders over ₹999</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-full text-green-600"><ShieldCheck size={22} /></div>
                        <div>
                            <h4 className="font-bold text-sm">Secure Payment</h4>
                            <p className="text-xs text-gray-500">100% secure checkout process</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 rounded-full text-purple-600"><Clock size={22} /></div>
                        <div>
                            <h4 className="font-bold text-sm">24/7 Support</h4>
                            <p className="text-xs text-gray-500">Dedicated support team</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shop by Category */}
            <section className="py-16 max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-1">Shop by Category</h2>
                        <p className="text-gray-400 text-sm">Find exactly what you need</p>
                    </div>
                    <Link to="/products" className="text-secondary font-medium hover:underline flex items-center gap-1 text-sm">View All <ArrowRight size={16} /></Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {CATEGORIES.map((cat, idx) => (
                        <Link to={`/products?category=${cat.name}`} key={idx} className="group relative overflow-hidden rounded-xl cursor-pointer h-56 lg:h-64">
                            <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 text-white">
                                <h3 className="text-lg font-bold">{cat.name}</h3>
                                <p className="text-xs text-white/70">{cat.count}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Trust Badges */}
            <section className="bg-white py-12">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">Trusted by 10,000+ customers</h3>
                    <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
                        <span className="text-2xl font-bold text-gray-400">PayTM</span>
                        <span className="text-2xl font-bold text-gray-400">PhonePe</span>
                        <span className="text-2xl font-bold text-gray-400">GPay</span>
                        <span className="text-2xl font-bold text-gray-400">UPI</span>
                        <span className="text-2xl font-bold text-gray-400">Visa</span>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
