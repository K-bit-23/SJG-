import React from 'react';
import { Loader2 } from 'lucide-react';

const PageLoader = ({ open }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-lg">
            <div className="relative flex items-center justify-center">
                {/* Outer Ring */}
                <div className="w-28 h-28 border-[3px] border-gray-100 rounded-full shadow-inner"></div>
                
                {/* Rotating Ring */}
                <div className="absolute w-28 h-28 border-[3px] border-transparent border-t-secondary rounded-full animate-spin"></div>
                
                {/* Logo with pulse */}
                <div className="absolute flex items-center justify-center bg-white rounded-full p-2 shadow-lg border border-gray-50">
                    <img 
                        src="/logo.png" 
                        alt="SJG" 
                        className="w-14 h-14 object-contain"
                        onError={(e) => e.target.style.display = 'none'} 
                    />
                </div>

                {/* Ambient Glow */}
                <div className="absolute inset-0 bg-secondary/5 rounded-full blur-3xl animate-pulse -z-10 scale-150"></div>
            </div>
        </div>
    );
};

export default PageLoader;
