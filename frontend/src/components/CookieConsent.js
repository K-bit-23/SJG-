import React, { useState, useEffect } from 'react';
import './CookieConsent.css';

const CookieConsent = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('sjg_cookie_consent');
        if (!consent) {
            setTimeout(() => setVisible(true), 2000);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('sjg_cookie_consent', 'true');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="cookie-banner-container">
            <div className="cookie-content">
                <div className="cookie-icon">
                    <i className="fas fa-cookie-bite"></i>
                </div>
                <div className="cookie-text">
                    <h4>We use Cookies</h4>
                    <p>We use cookies to improve your experience and track sessions.</p>
                </div>
            </div>
            <button className="cookie-btn" onClick={handleAccept}>
                Accept & Continue
            </button>
        </div>
    );
};

export default CookieConsent;
