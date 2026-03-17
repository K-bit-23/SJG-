import React, { useState, useEffect } from 'react';
import { 
    ShoppingBag, Truck, ShieldCheck, Clock, ArrowRight, ChevronLeft, 
    ChevronRight as ChevronRightIcon, Printer, FileText, Layers, 
    Copy, BookOpen, Palette, Sparkles, Zap, Star
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../src/utils/api';
import { useNotifications } from '../../src/context/NotificationContext';

// Categories with modern icons/images
const DEFAULT_CATEGORIES = [
    { name: "Notebooks", count: "120+ Products", img: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80" },
    { name: "Pens & Writing", count: "80+ Products", img: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=300&q=80" },
    { name: "Art Supplies", count: "200+ Products", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=300&q=80" },
    { name: "Office Desk", count: "50+ Products", img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=300&q=80" },
];

// Default banners — using higher-quality, reliable image sources
const DEFAULT_BANNERS = [
    {
        id: 1,
        title: "Crafting Your Creative Vision",
        subtitle: "The 2024 Collection",
        description: "Experience the fusion of artisan precision and modern design in our latest stationery series.",
        img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1600&q=80&auto=format&fit=crop",
        btnText: "Explore Collection",
        btnLink: "/products"
    },
    {
        id: 2,
        title: "Back to School, Redefined",
        subtitle: "Exclusive Academic Sale",
        description: "Empower your learning journey with professional-grade notebooks and organizational tools.",
        img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1600&q=80&auto=format&fit=crop",
        btnText: "Claim Your Discount",
        btnLink: "/products?category=notebooks"
    },
    {
        id: 3,
        title: "The Artist's Sanctuary",
        subtitle: "Professional Grade Tools",
        description: "Professional pigments and precision edges designed for those who dream in color.",
        img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&q=80&auto=format&fit=crop",
        btnText: "Discover Fine Art",
        btnLink: "/products?category=art"
    }
];

const Home = () => {
    const { showCallout } = useNotifications();
    const [bannerContent, setBannerContent] = useState(null);
    const [currentBanner, setCurrentBanner] = useState(0);
    const [banners, setBanners] = useState(DEFAULT_BANNERS);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/content/home/')
            .then(res => {
                setBannerContent(res.data);
                if (res.data?.banners?.length) setBanners(res.data.banners);
                if (res.data?.categories?.length) setCategories(res.data.categories);
            })
            .catch(err => console.error("Home content fetch failed:", err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % banners.length);
        }, 8000); // Slower, more elegant rotation
        return () => clearInterval(timer);
    }, [banners.length]);

    const nextBanner = () => setCurrentBanner(prev => (prev + 1) % banners.length);
    const prevBanner = () => setCurrentBanner(prev => (prev - 1 + banners.length) % banners.length);

    const services = (bannerContent?.services && bannerContent.services.length > 0) 
        ? bannerContent.services 
        : [
            { name: 'Digital Printing', icon: 'Printer', desc: 'High-fidelity color reproduction.', color: 'from-blue-500 to-indigo-600', price: 'Premium' },
            { name: 'Bulk Xerox', icon: 'Copy', desc: 'Efficiency at enterprise scale.', color: 'from-purple-500 to-pink-600', price: 'High-Speed' },
            { name: 'Lamination', icon: 'Layers', desc: 'Preserve and protect assets.', color: 'from-emerald-500 to-teal-600', price: 'Pro-Finish' },
            { name: 'Custom Binding', icon: 'BookOpen', desc: 'Bespoke finishing for architects.', color: 'from-orange-500 to-red-600', price: 'Bespoke' }
        ];

    const getIcon = (iconName) => {
        const icons = { Printer, Copy, Layers, BookOpen, FileText, Palette, Sparkles, Zap, Star, ShieldCheck, Truck, Clock };
        const IconComponent = icons[iconName] || Star;
        return <IconComponent size={28} />;
    };

    const activeBanner = banners[currentBanner] || DEFAULT_BANNERS[0];

    return (
        <div className="bg-background min-h-screen text-primary overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative h-[85vh] min-h-[500px] max-h-[800px] flex items-center overflow-hidden">
                {/* Background images */}
                <div className="absolute inset-0 z-0 bg-slate-900">
                    {banners.map((banner, idx) => (
                        <div 
                            key={banner.id || idx}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentBanner ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <img 
                                src={banner.img} 
                                alt=""
                                crossOrigin="anonymous"
                                onError={(e) => { e.target.style.display = 'none'; }}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-slate-900/20"></div>
                        </div>
                    ))}
                </div>

                {/* Text content — left-aligned, compact */}
                <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
                    <div className="max-w-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <Zap size={12} className="text-secondary animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-[0.35em] text-secondary/90">
                                {activeBanner.subtitle}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.08] mb-5 tracking-tight text-white">
                            {activeBanner.title}
                        </h1>
                        <p className="text-sm md:text-base text-white/70 mb-8 leading-relaxed font-medium max-w-sm">
                            {activeBanner.description}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                to={activeBanner.btnLink || "/products"}
                                className="group inline-flex items-center gap-2 bg-white text-secondary hover:bg-secondary hover:text-white px-7 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-black/20"
                            >
                                {activeBanner.btnText || "Shop Now"} 
                                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link 
                                to="/products"
                                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 px-7 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                            >
                                View Gallery
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Carousel indicators — bottom center */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6">
                    <button onClick={prevBanner} className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-all">
                        <ChevronLeft size={16} />
                    </button>
                    <div className="flex gap-2">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentBanner(idx)}
                                className={`h-1 rounded-full transition-all duration-500 ${idx === currentBanner ? 'bg-white w-10' : 'bg-white/30 w-3'}`}
                            />
                        ))}
                    </div>
                    <button onClick={nextBanner} className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-all">
                        <ChevronRightIcon size={16} />
                    </button>
                </div>
            </section>

            {/* Trust Strip - Modern Floating Design */}
            <div className="relative z-20 -mt-16 max-w-7xl mx-auto px-6 mb-20">
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 p-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x border border-indigo-50">
                    <div className="flex items-center gap-6 group px-4">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                            <Truck size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider mb-1">Global Logistics</h4>
                            <p className="text-xs font-bold text-slate-400">Free priority on ₹999+</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 group px-4">
                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider mb-1">Quantum Security</h4>
                            <p className="text-xs font-bold text-slate-400">Escrow encrypted banking</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 group px-4">
                        <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                            <Star size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider mb-1">Elite Support</h4>
                            <p className="text-xs font-bold text-slate-400">Concierge level assistance</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Services - High Polish Section */}
            <section className="py-20 max-w-7xl mx-auto px-6 overflow-hidden relative">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-[2px] bg-secondary"></div>
                            <span className="text-xs font-black text-secondary uppercase tracking-[0.3em]">Signature Services</span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Professional Solutions.</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((srv, i) => (
                        <div key={i} className="premium-card p-10 group hover-glow border-indigo-50/50">
                            <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${srv.color || 'from-indigo-500 to-indigo-600'} flex items-center justify-center text-white mb-8 shadow-lg shadow-black/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                                {getIcon(srv.icon)}
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-3">{srv.name}</h3>
                            <p className="text-sm font-bold text-slate-400 mb-6 leading-relaxed">{srv.desc}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{srv.price}</span>
                                <button className="text-xs font-black text-secondary flex items-center gap-2 group-hover:gap-4 transition-all uppercase tracking-widest">
                                    Book <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>


            {/* Categories Section */}
            <section className="py-24 bg-white rounded-[4rem] mx-4 my-8 md:mx-6 md:my-12 px-6 lg:px-12 border border-slate-100 shadow-xl shadow-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><ShoppingBag size={20} /></div>
                                <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">Curation</span>
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Shop by Workspace.</h2>
                        </div>
                        <Link to="/products" className="group flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-secondary transition-all">
                            Explore All Archive <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-secondary transition-all"><ArrowRight size={16} /></div>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {categories.map((cat, idx) => (
                            <Link to={`/products?category=${cat.name}`} key={idx} className="group relative h-[450px] rounded-[2.5rem] overflow-hidden hover-glow transition-all duration-700">
                                <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/90 flex flex-col justify-end p-8">
                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">{cat.count}</span>
                                    <h3 className="text-2xl font-black text-white mb-4 group-hover:translate-x-2 transition-transform duration-500">{cat.name}</h3>
                                    <div className="w-0 group-hover:w-full h-[2px] bg-secondary transition-all duration-500"></div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
