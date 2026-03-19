import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useLanguage } from '../../src/context/LanguageContext';

const Contact = () => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        try {
            await axios.post('/api/contact/', formData);
            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error("Error sending message:", error);
            setStatus('error');
        }
    };

    return (
        <div className="bg-background min-h-screen py-20 animate-fade-in">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16">

                {/* Contact Info */}
                <div>
                    <h1 className="text-4xl font-bold mb-6 text-primary">{t('getintouch')}</h1>
                    <p className="text-lg text-gray-600 mb-10">
                        {t('contact_desc')}
                    </p>

                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="p-4 bg-secondary/10 rounded-full text-secondary">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">{t('phone')}</h3>
                                <p className="text-gray-600">+91 93600 24821</p>
                                <p className="text-xs text-gray-500">Mon-Fri 9am-6pm</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-4 bg-secondary/10 rounded-full text-secondary">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">{t('email')}</h3>
                                <p className="text-gray-600">sjgvxerox@gmail.com</p>
                                <p className="text-xs text-gray-500">Online support 24/7</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-4 bg-secondary/10 rounded-full text-secondary">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">{t('visitus')}</h3>
                                <p className="text-gray-600">
                                    Sakthi Nagar, Thindal,<br />
                                    Erode - 638012.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white p-8 rounded-2xl shadow-soft">
                    <h2 className="text-2xl font-bold mb-6 text-primary">{t('sendmessage')}</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('fullname')}</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('emailaddress')}</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
                                placeholder="john@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('message')}</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="4"
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
                                placeholder="How can we help you?"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="w-full bg-secondary hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                        >
                            {status === 'sending' ? t('sending') : t('sendmessage')}
                            {!status && <Send size={18} />}
                        </button>

                        {status === 'success' && (
                            <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm text-center">
                                {t('msg_success')}
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm text-center">
                                {t('msg_error')}
                            </div>
                        )}
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Contact;
