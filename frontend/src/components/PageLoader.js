import React from 'react';
import { Loader2 } from 'lucide-react';

const PageLoader = ({ open }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white backdrop-blur-sm">
            <div className="relative flex flex-col items-center">
                {/* Logo with animations */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-secondary/20 rounded-full blur-2xl animate-pulse transform scale-150"></div>
                    <div className="relative z-10 w-28 h-28 bg-white rounded-full shadow-2xl flex items-center justify-center p-4 border border-gray-100">
                        <img 
                            src="/logo.png" 
                            alt="SJG Logo" 
                            className="w-full h-full object-contain animate-pulse"
                            style={{ animationDuration: '2s' }}
                        />
                    </div>
                </div>
                
                {/* Branding Text */}
                <div className="flex flex-col items-center mb-6">
                    <h1 className="text-3xl font-extrabold tracking-tight text-primary mb-1">SJG<span className="text-secondary">.</span></h1>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Premium Shopping</p>
                </div>
                
                {/* Modern Loader */}
                <div className="flex items-center gap-3 bg-gray-50 px-6 py-3 rounded-full border border-gray-100 shadow-sm">
                    <Loader2 className="w-5 h-5 animate-spin text-secondary" />
                    <span className="text-sm font-bold text-gray-700 tracking-wider">Preparing your experience...</span>
                </div>
            </div>
        </div>
    );
};

export default PageLoader;
