import React from 'react';
import { Loader2 } from 'lucide-react';

const PageLoader = ({ open }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="relative">
                {/* Minimalist Circle Loader */}
                <div className="w-16 h-16 border-4 border-gray-100 border-t-secondary rounded-full animate-spin"></div>
                
                {/* Optional: Glowing effect behind the circle */}
                <div className="absolute inset-0 bg-secondary/20 rounded-full blur-xl animate-pulse -z-10 transform scale-150"></div>
            </div>
        </div>
    );
};

export default PageLoader;
