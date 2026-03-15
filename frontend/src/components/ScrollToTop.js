import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Smooth scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <div className="fixed bottom-8 left-8 z-50">
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white shadow-2xl hover:bg-blue-700 rounded-full transform hover:translate-y-[-4px] active:scale-95 transition-all duration-300 group ring-2 ring-white"
          aria-label="Scroll to top"
        >
          <ChevronUp 
            size={20} 
            strokeWidth={2.5} 
            className="group-hover:translate-y-[-2px] transition-transform duration-300" 
          />
        </button>
      )}
    </div>
  );
};

export default ScrollToTop;
