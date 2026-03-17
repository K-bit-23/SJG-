import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/clerk-react';

const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Simple Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative z-10 w-full max-w-fit animate-fade-in">
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute -top-10 -right-2 text-white hover:text-gray-300 p-2 transition-colors"
                    title="Close"
                >
                    <X size={24} />
                </button>

                {/* Clerk Components (Default Styling) */}
                <div className="flex flex-col items-center">
                    {isLogin ? (
                        <div className="flex flex-col items-center gap-4">
                            <SignIn 
                                routing="hash" 
                                signUpUrl="#"
                                fallbackRedirectUrl={window.location.pathname === '/checkout' ? '/checkout' : '/admin'}
                                forceRedirectUrl={window.location.pathname === '/checkout' ? '/checkout' : '/admin'}
                            />
                            {window.location.pathname.startsWith('/admin') && (
                                <div className="mt-4 text-center">
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Dev: Direct Admin Login Mode</p>
                                    <p className="text-[9px] text-white/20 mt-1 italic">Note: If another account is pre-filled, please sign out first.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <SignUp 
                            routing="hash" 
                            signInUrl="#"
                            fallbackRedirectUrl="/admin"
                            forceRedirectUrl="/admin"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
