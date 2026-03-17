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
        <div className="min-h-screen text-primary overflow-x-hidden">

            {/* ── Hero Banner — starts at y=0, fills behind navbar ── */}
            <section className="relative h-[calc(65vh+4rem)] min-h-[480px] max-h-[700px] flex items-end overflow-hidden">
                <div className="absolute inset-0 z-0 bg-slate-900">
                    {banners.map((banner, idx) => (
                        <div key={banner.id || idx} className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentBanner ? 'opacity-100' : 'opacity-0'}`}>
                            <img src={banner.img} alt="" crossOrigin="anonymous" onError={(e) => { e.target.style.display = 'none'; }} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/50 to-slate-900/10"></div>
                        </div>
                    ))}
                </div>

                <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full pb-12 pt-20">
                    <div className="max-w-md">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap size={11} className="text-secondary animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-[0.35em] text-secondary/90">{activeBanner.subtitle}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[1.1] mb-4 tracking-tight text-white">
                            {activeBanner.title}
                        </h1>
                        <p className="text-sm text-white/70 mb-6 leading-relaxed font-medium max-w-xs">
                            {activeBanner.description}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link to={activeBanner.btnLink || "/products"} className="group inline-flex items-center gap-2 bg-white text-secondary hover:bg-secondary hover:text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-black/20">
                                {activeBanner.btnText || "Shop Now"} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/products" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                                View Gallery
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Carousel dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
                    <button onClick={prevBanner} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/10 transition-all"><ChevronLeft size={15} /></button>
                    <div className="flex gap-1.5">
                        {banners.map((_, idx) => (
                            <button key={idx} onClick={() => setCurrentBanner(idx)} className={`h-1 rounded-full transition-all duration-500 ${idx === currentBanner ? 'bg-white w-8' : 'bg-white/30 w-2.5'}`} />
                        ))}
                    </div>
                    <button onClick={nextBanner} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/10 transition-all"><ChevronRightIcon size={15} /></button>
                </div>
            </section>

            {/* ── Services ── */}
            <section className="py-12 max-w-7xl mx-auto px-6 bg-background">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-[2px] bg-secondary"></div>
                            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Signature Services</span>
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Professional Solutions.</h2>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {services.map((srv, i) => (
                        <div key={i} className="premium-card p-6 group hover-glow border-indigo-50/50">
                            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${srv.color || 'from-indigo-500 to-indigo-600'} flex items-center justify-center text-white mb-5 shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                                {getIcon(srv.icon)}
                            </div>
                            <h3 className="text-base font-black text-slate-900 mb-1.5">{srv.name}</h3>
                            <p className="text-xs font-bold text-slate-400 mb-4 leading-relaxed">{srv.desc}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{srv.price}</span>
                                <button className="text-[10px] font-black text-secondary flex items-center gap-1 group-hover:gap-2 transition-all uppercase tracking-widest">
                                    Book <ArrowRight size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Categories ── */}
            <section className="py-10 bg-white rounded-3xl mx-4 md:mx-6 mb-10 px-6 lg:px-10 border border-slate-100 shadow-lg shadow-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600"><ShoppingBag size={16} /></div>
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Curation</span>
                            </div>
                            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Shop by Workspace.</h2>
                        </div>
                        <Link to="/products" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-secondary transition-all">
                            View All <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-secondary transition-all"><ArrowRight size={13} /></div>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {categories.map((cat, idx) => (
                            <Link to={`/products?category=${cat.name}`} key={idx} className="group relative h-[280px] rounded-3xl overflow-hidden hover-glow transition-all duration-700">
                                <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/85 flex flex-col justify-end p-5">
                                    <span className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-0.5">{cat.count}</span>
                                    <h3 className="text-lg font-black text-white mb-2 group-hover:translate-x-1 transition-transform duration-500">{cat.name}</h3>
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

