import React from 'react';
import { Loader2 } from 'lucide-react';

const PageLoader = ({ open }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 backdrop-blur-md">
            <div className="relative flex items-center justify-center">
                {/* Circular Loader Track */}
                <div className="w-24 h-24 border-4 border-gray-100 rounded-full"></div>
                
                {/* Spinning Accent */}
                <div className="absolute w-24 h-24 border-4 border-transparent border-t-secondary rounded-full animate-spin"></div>
                
                {/* Logo in center */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <img 
                        src="/logo.png" 
                        alt="SJG" 
                        className="w-12 h-12 object-contain animate-pulse"
                        onError={(e) => e.target.style.display = 'none'} 
                    />
                </div>

                {/* Optional: Glowing effect behind */}
                <div className="absolute inset-0 bg-secondary/10 rounded-full blur-2xl animate-pulse -z-10 scale-150"></div>
            </div>
        </div>
    );
};

export default PageLoader;
