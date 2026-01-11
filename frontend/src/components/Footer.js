import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-[#0f172a] text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">

                {/* Brand & Stats */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="SJG" className="h-12 w-12 object-contain bg-white rounded-full p-1" />
                        <span className="text-2xl font-bold tracking-tighter">SJG<span className="text-secondary">.</span></span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Elevating your workspace with premium stationery.
                        Quality, aesthetics, and functionality in every product.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-lg font-bold mb-6">Quick Links</h3>
                    <ul className="space-y-3 text-gray-400 text-sm">
                        <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                        <li><Link to="/products" className="hover:text-white transition-colors">Shop All</Link></li>
                        <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                        <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                        <li><Link to="/admin" className="hover:text-white transition-colors">Admin Panel</Link></li>
                    </ul>
                </div>

                {/* Contact Info (Moved from Navbar) */}
                <div>
                    <h3 className="text-lg font-bold mb-6">Contact Us</h3>
                    <ul className="space-y-4 text-gray-400 text-sm">
                        <li className="flex items-start gap-3">
                            <MapPin size={18} className="text-secondary shrink-0 mt-0.5" />
                            <span>
                                Sakthi Nagar, Thindal,<br />
                                Erode - 638012.
                            </span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone size={18} className="text-secondary shrink-0" />
                            <a href="tel:9360024821" className="hover:text-white transition-colors">9360024821</a>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail size={18} className="text-secondary shrink-0" />
                            <a href="mailto:sjgvxerox@gmail.com" className="hover:text-white transition-colors">sjgvxerox@gmail.com</a>
                        </li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h3 className="text-lg font-bold mb-6">Stay Updated</h3>
                    <p className="text-gray-400 text-sm mb-4">Subscribe for exclusive offers and new arrivals.</p>
                    <form className="flex gap-2">
                        <input
                            type="email"
                            placeholder="Email"
                            className="bg-white/10 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-secondary w-full"
                        />
                        <button className="bg-secondary hover:bg-indigo-600 px-4 py-2 rounded text-sm font-bold transition-colors">
                            Join
                        </button>
                    </form>
                    <div className="flex gap-4 mt-6">
                        <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/20 transition-colors"><Facebook size={18} /></a>
                        <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/20 transition-colors"><Instagram size={18} /></a>
                        <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/20 transition-colors"><Twitter size={18} /></a>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-500 text-xs">© 2024 SJG Stationery. All rights reserved.</p>
                <div className="flex gap-6 text-gray-500 text-xs">
                    <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
                    <Link to="/terms" className="hover:text-white">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
