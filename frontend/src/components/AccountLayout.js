import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    User, Package, LogOut, Settings, Camera, Mail, Phone
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';

const AccountLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [profileData, setProfileData] = useState({
        fullName: '',
        email: '',
        phone: '',
        photoURL: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await api.get(`/profile/${encodeURIComponent(user.emailAddresses ? user.emailAddresses[0].emailAddress : user.email || '')}/`);
                const data = res.data;
                setProfileData({
                    fullName: data.fullName || user.fullName || user.name || '',
                    email: data.email || (user.emailAddresses ? user.emailAddresses[0].emailAddress : user.email) || '',
                    phone: data.phone || '',
                    photoURL: data.photoURL || user.imageUrl || user.photoURL || ''
                });
            } catch (error) {
                console.error("Error fetching profile layout:", error);
                setProfileData({
                    fullName: user.fullName || user.name || '',
                    email: (user.emailAddresses ? user.emailAddresses[0].emailAddress : user.email) || '',
                    phone: '',
                    photoURL: user.imageUrl || user.photoURL || ''
                });
            }
        };

        fetchProfile();
    }, [user, navigate]);

    if (!user) return null;

    const getAvatarColor = (name) => {
        const colors = ['from-blue-500 to-blue-600', 'from-purple-500 to-purple-600', 'from-green-500 to-green-600', 'from-orange-500 to-orange-600', 'from-pink-500 to-pink-600', 'from-indigo-500 to-indigo-600'];
        const index = name ? name.charCodeAt(0) % colors.length : 0;
        return colors[index];
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: User, path: '/profile' },
        { id: 'orders', label: 'Orders', icon: Package, path: '/orders' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 lg:px-6">
            <div className="max-w-5xl mx-auto">
                {/* Main Content Area */}
                <div className="animate-fade-in-up">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AccountLayout;
