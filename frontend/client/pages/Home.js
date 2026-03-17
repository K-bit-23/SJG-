import React, { useState, useEffect } from 'react';
import {
    ShoppingBag, Truck, ShieldCheck, Clock, ArrowRight, ChevronLeft,
    ChevronRight as ChevronRightIcon, Printer, FileText, Layers,
    Copy, BookOpen, Palette, Sparkles, Zap, Star, Package, Phone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../src/utils/api';

const DEFAULT_CATEGORIES = [
    { name: "Notebooks", count: "120+ Products", img: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80" },
    { name: "Pens & Writing", count: "80+ Products", img: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=600&q=80" },
    { name: "Art Supplies", count: "200+ Products", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80" },
    { name: "Office Desk", count: "50+ Products", img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80" },
];

const DEFAULT_BANNERS = [
    {
        id: 1,
        title: "Crafting Your Creative Vision",
        subtitle: "New Collection 2024",
        description: "Premium stationery and art supplies for creators, students, and professionals.",
        img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1600&q=80&auto=format&fit=crop",
        btnText: "Shop Now",
        btnLink: "/products"
    },
    {
        id: 2,
        title: "Back to School, Ready to Excel",
        subtitle: "Academic Sale",
        description: "Everything you need for a productive semester — notebooks, pens, and more.",
        img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1600&q=80&auto=format&fit=crop",
        btnText: "View Offers",
        btnLink: "/products?category=notebooks"
    },
    {
        id: 3,
        title: "Tools for Every Artist",
        subtitle: "Art Supplies",
        description: "Professional pigments, brushes, and precision tools for those who dream in color.",
        img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&q=80&auto=format&fit=crop",
        btnText: "Explore Art",
        btnLink: "/products?category=art"
    }
];

const DEFAULT_SERVICES = [
    { name: 'Digital Printing', icon: 'Printer', desc: 'High-quality color prints for any document or design.', color: 'from-blue-500 to-indigo-600' },
    { name: 'Bulk Xerox', icon: 'Copy', desc: 'Fast, affordable copying for large volumes.', color: 'from-purple-500 to-pink-600' },
    { name: 'Lamination', icon: 'Layers', desc: 'Protect and finish your documents professionally.', color: 'from-emerald-500 to-teal-600' },
    { name: 'Custom Binding', icon: 'BookOpen', desc: 'Perfect binding for reports, books, and presentations.', color: 'from-orange-500 to-red-600' },
];

const TRUST_ITEMS = [
    { icon: Truck, label: 'Free Delivery', sub: 'On orders above ₹499' },
    { icon: ShieldCheck, label: 'Secure Payments', sub: 'UPI, Cards & more' },
    { icon: Package, label: 'Easy Returns', sub: '7-day return policy' },
    { icon: Phone, label: '24/7 Support', sub: 'Chat or call anytime' },
];

const Home = () => {
    const [bannerContent, setBannerContent] = useState(null);
    const [currentBanner, setCurrentBanner] = useState(0);
    const [banners, setBanners] = useState(DEFAULT_BANNERS);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/content/home/')
            .then(res => {
                setBannerContent(res.data);
                if (res.data?.banners?.length) setBanners(res.data.banners);
                if (res.data?.categories?.length) setCategories(res.data.categories);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % banners.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [banners.length]);

    const next = () => setCurrentBanner(prev => (prev + 1) % banners.length);
    const prev = () => setCurrentBanner(prev => (prev - 1 + banners.length) % banners.length);

    const services = (bannerContent?.services?.length) ? bannerContent.services : DEFAULT_SERVICES;

    const getIcon = (name) => {
        const map = { Printer, Copy, Layers, BookOpen, FileText, Palette, Sparkles, Zap, Star, ShieldCheck, Truck, Clock };
        const Icon = map[name] || Star;
        return <Icon size={22} />;
    };

    const active = banners[currentBanner] || DEFAULT_BANNERS[0];

    return (
        <div className="min-h-screen bg-white text-gray-900">

            {/* ── Hero Banner ── */}
            <section className="relative w-full overflow-hidden" style={{ height: '80vh', minHeight: 480, maxHeight: 700 }}>

                {/* Background Images */}
                <div className="absolute inset-0 bg-gray-900">
                    {banners.map((b, i) => (
                        <div
                            key={b.id || i}
                            className="absolute inset-0 transition-opacity duration-1000"
                            style={{ opacity: i === currentBanner ? 1 : 0 }}
                        >
                            <img
                                src={b.img}
                                alt=""
                                className="w-full h-full object-cover"
                                crossOrigin="anonymous"
                                onError={e => { e.target.style.display = 'none'; }}
                            />
                        </div>
                    ))}
                    {/* Light Gradient overlay for dark text */}
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-gray-50/90 to-transparent md:w-[60%]" />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex items-center">
                    <div className="max-w-7xl mx-auto px-6 md:px-12 w-full pt-8">
                        <div className="max-w-lg">

                            {/* Tag */}
                            <div className="inline-block bg-indigo-100/80 text-indigo-600 rounded-full px-3 py-1 mb-6">
                                <span className="text-xs font-bold tracking-wider uppercase">{active.subtitle || "New Collection 2024"}</span>
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl md:text-5xl xl:text-6xl font-black text-slate-900 leading-[1.1] mb-5 tracking-tight">
                                {active.title}
                            </h1>

                            {/* Description */}
                            <p className="text-slate-600 text-base md:text-lg mb-8 leading-relaxed">
                                {active.description}
                            </p>

                            {/* Buttons */}
                            <div className="flex">
                                <Link
                                    to={active.btnLink || '/products'}
                                    className="inline-flex items-center justify-center gap-2 bg-[#5e6ad2] hover:bg-indigo-600 text-white font-semibold px-8 py-3 rounded-full transition-all shadow-md shadow-indigo-200"
                                >
                                    {active.btnText || 'Shop Now'}
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Carousel Navigation Arrows */}
                <button onClick={prev} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-white text-gray-800 rounded-full shadow-lg hover:scale-105 transition-transform">
                    <ChevronLeft size={20} />
                </button>
                <button onClick={next} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-white text-gray-800 rounded-full shadow-lg hover:scale-105 transition-transform">
                    <ChevronRightIcon size={20} />
                </button>

                {/* Carousel Pagination Dots */}
                <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center items-center gap-2">
                    {banners.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentBanner(i)}
                            className={`transition-all duration-300 rounded-full h-1.5 ${i === currentBanner ? 'bg-[#5e6ad2] w-6' : 'bg-gray-300 w-1.5'}`}
                        />
                    ))}
                </div>
            </section>

            {/* ── Trust Bar ────────────────────────────────── */}
            <section className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TRUST_ITEMS.slice(0, 3).map(({ icon: Icon, label, sub }, index) => {
                        const colors = ['text-blue-500 bg-blue-50', 'text-emerald-500 bg-emerald-50', 'text-purple-500 bg-purple-50'];
                        return (
                            <div key={label} className="flex items-center justify-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colors[index]}`}>
                                    <Icon size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 leading-tight">{label}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── Categories ───────────────────────────────── */}
            <section className="py-16 px-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-2">
                            <ShoppingBag size={14} /> PRODUCTS
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Shop by Category</h2>
                    </div>
                    <Link to="/products" className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                        View All <ArrowRight size={15} />
                    </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {categories.map((cat, i) => (
                        <Link
                            to={`/products?category=${cat.name}`}
                            key={i}
                            className="group relative rounded-2xl overflow-hidden bg-gray-100 cursor-pointer"
                            style={{ height: 260 }}
                        >
                            <img
                                src={cat.img}
                                alt={cat.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <p className="text-white/70 text-xs font-medium mb-0.5">{cat.count}</p>
                                <h3 className="text-white text-base font-bold leading-tight">{cat.name}</h3>
                            </div>
                            <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:-translate-y-0.5">
                                <ArrowRight size={14} className="text-white" />
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── Featured Banner ──────────────────────────── */}
            <section className="mx-6 md:mx-auto max-w-7xl mb-16">
                <div
                    className="rounded-3xl overflow-hidden relative"
                    style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)', minHeight: 200 }}
                >
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 right-20 w-64 h-64 rounded-full bg-white/30 blur-3xl" />
                        <div className="absolute bottom-4 left-20 w-48 h-48 rounded-full bg-indigo-300/30 blur-2xl" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-10 py-10 gap-6">
                        <div>
                            <p className="text-indigo-300 text-sm font-semibold mb-2">Limited Time Offer</p>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                                Get 20% off on your first order
                            </h2>
                            <p className="text-white/60 text-sm max-w-sm">
                                Use code <span className="text-yellow-400 font-bold">SJG20</span> at checkout. Valid on all products.
                            </p>
                        </div>
                        <Link
                            to="/products"
                            className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-all shadow-lg"
                        >
                            Shop Now <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Services ─────────────────────────────────── */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-10">
                        <p className="text-indigo-600 font-bold text-sm mb-1">What We Offer</p>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Our Services</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {services.map((srv, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${srv.color || 'from-indigo-500 to-indigo-600'} flex items-center justify-center text-white mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                    {getIcon(srv.icon)}
                                </div>
                                <h3 className="font-bold text-gray-900 text-base mb-1.5">{srv.name}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed mb-4">{srv.desc}</p>
                                <Link
                                    to="/products"
                                    className="inline-flex items-center gap-1 text-indigo-600 text-xs font-bold hover:gap-2 transition-all"
                                >
                                    Learn more <ArrowRight size={13} />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Strip ────────────────────────────────── */}
            <section className="py-16 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
                        Ready to stock up?
                    </h2>
                    <p className="text-gray-500 text-base mb-8 max-w-xl mx-auto">
                        Browse our full range of stationery, art supplies, and office essentials. Fast delivery across Tamil Nadu.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/25 hover:-translate-y-0.5"
                        >
                            <ShoppingBag size={18} /> Browse Products
                        </Link>
                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold px-8 py-3.5 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-all"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
