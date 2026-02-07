import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Truck, ShieldCheck, Clock, ArrowRight, ChevronLeft, ChevronRight as ChevronRightIcon, Printer, FileText, Layers, Copy, BookOpen, Palette, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

// Categories with modern icons/images
const CATEGORIES = [
    { name: "Notebooks", count: "120+ Products", img: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80" },
    { name: "Pens & Writing", count: "80+ Products", img: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=300&q=80" },
    { name: "Art Supplies", count: "200+ Products", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=300&q=80" },
    { name: "Office Desk", count: "50+ Products", img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=300&q=80" },
];

// Services offered
const SERVICES = [
    {
        name: "Lamination",
        desc: "Professional document lamination",
        icon: Layers,
        color: "from-blue-500 to-blue-600",
        price: "From ₹10"
    },
    {
        name: "Xerox / Photocopy",
        desc: "High quality copies at best rates",
        icon: Copy,
        color: "from-green-500 to-green-600",
        price: "From ₹1/page"
    },
    {
        name: "Printing",
        desc: "Color & B/W printing services",
        icon: Printer,
        color: "from-purple-500 to-purple-600",
        price: "From ₹5/page"
    },
    {
        name: "Binding",
        desc: "Spiral, comb & perfect binding",
        icon: BookOpen,
        color: "from-orange-500 to-orange-600",
        price: "From ₹30"
    },
    {
        name: "Typing & Docs",
        desc: "Professional document typing",
        icon: FileText,
        color: "from-teal-500 to-teal-600",
        price: "From ₹20/page"
    },
    {
        name: "Design Services",
        desc: "Banners, cards & invitations",
        icon: Palette,
        color: "from-pink-500 to-pink-600",
        price: "Custom pricing"
    },
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
    const [bannerContent, setBannerContent] = useState(null);
    const [currentBanner, setCurrentBanner] = useState(0);
    const [banners, setBanners] = useState(DEFAULT_BANNERS);
    const [services, setServices] = useState(SERVICES);

    useEffect(() => {
        axios.get('/api/content/home/')
            .then(res => {
                setBannerContent(res.data);
                if (res.data?.banners?.length) {
                    setBanners(res.data.banners);
                }
                if (res.data?.services?.length) {
                    setServices(res.data.services);
                }
            })
            .catch(err => console.log("Using default static content"));
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
                    {CATEGORIES.map((cat, idx) => (
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

            {/* 2. SERVICES SECTION */}
            <section className="py-10 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Sparkles size={20} className="text-purple-500" />
                            <span className="text-xs font-bold text-purple-500 uppercase tracking-wide">Our Services</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-1">Print & Document Services</h2>
                        <p className="text-gray-500 text-sm max-w-md mx-auto">Professional services at affordable prices</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {services.map((service, idx) => {
                            const IconComponent = typeof service.icon === 'string' ? (ICON_MAP[service.icon] || Sparkles) : service.icon;
                            return (
                                <div key={idx} className="group bg-white rounded-xl p-4 text-center hover-float hover-glow transition-all border border-gray-100 hover:border-secondary/20 shadow-sm">
                                    <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform shadow-md`}>
                                        <IconComponent size={20} />
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-xs mb-1">{service.name}</h3>
                                    <p className="text-[10px] text-gray-500 mb-1 line-clamp-2">{service.desc}</p>
                                    <span className="text-[10px] font-bold text-secondary">{service.price}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 3. ONLINE SERVICES BANNER - Redesigned */}
            <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-secondary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                            {/* Left Content */}
                            <div className="text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/20 rounded-full mb-4">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-bold text-secondary uppercase tracking-wide">Now Available Online</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                                    Order Online, <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-purple-400">Pick Up In-Store</span>
                                </h2>
                                <p className="text-gray-400 text-sm md:text-base max-w-lg mb-6">
                                    Upload your documents online, make secure payment, and collect your prints from our store. Fast, easy, and convenient!
                                </p>

                                {/* Features */}
                                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-6">
                                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <span className="text-green-400 text-xs">✓</span>
                                        </div>
                                        Same Day Delivery
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <span className="text-green-400 text-xs">✓</span>
                                        </div>
                                        Secure Payment
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <span className="text-green-400 text-xs">✓</span>
                                        </div>
                                        Quality Assured
                                    </div>
                                </div>

                                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                                    <Link to="/products" className="px-6 py-3 bg-gradient-to-r from-secondary to-indigo-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-secondary/30 transition-all text-sm flex items-center gap-2">
                                        <ShoppingBag size={16} /> Shop Products
                                    </Link>
                                    <Link to="/contact" className="px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all border border-white/20 text-sm">
                                        Contact Us
                                    </Link>
                                </div>
                            </div>

                            {/* Right - Service Cards */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center hover:bg-white/15 hover-float transition-all cursor-default">
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                                        <Printer size={20} className="text-blue-400" />
                                    </div>
                                    <h4 className="text-white font-bold text-sm">Printing</h4>
                                    <p className="text-gray-400 text-xs">From ₹5/page</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center hover:bg-white/15 hover-float transition-all cursor-default">
                                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                                        <Copy size={20} className="text-green-400" />
                                    </div>
                                    <h4 className="text-white font-bold text-sm">Xerox</h4>
                                    <p className="text-gray-400 text-xs">From ₹1/page</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center hover:bg-white/15 hover-float transition-all cursor-default">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                                        <Layers size={20} className="text-purple-400" />
                                    </div>
                                    <h4 className="text-white font-bold text-sm">Lamination</h4>
                                    <p className="text-gray-400 text-xs">From ₹10</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center hover:bg-white/15 hover-float transition-all cursor-default">
                                    <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                                        <BookOpen size={20} className="text-orange-400" />
                                    </div>
                                    <h4 className="text-white font-bold text-sm">Binding</h4>
                                    <p className="text-gray-400 text-xs">From ₹30</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


        </div>
    );
};

export default Home;
