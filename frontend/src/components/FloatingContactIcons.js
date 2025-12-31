import React from 'react';
import './FloatingContactIcons.css';

const FloatingContactIcons = () => {
    return (
        <div className="floating-contact-icons">
            <a
                href="mailto:sjgvxerox@gmail.com"
                className="floating-icon email-icon"
                aria-label="Send Email"
                title="Email Us"
            >
                <i className="fas fa-envelope"></i>
            </a>
            <a
                href="https://wa.me/919360024821"
                target="_blank"
                rel="noopener noreferrer"
                className="floating-icon whatsapp-icon"
                aria-label="WhatsApp"
                title="Chat on WhatsApp"
            >
                <i className="fab fa-whatsapp"></i>
            </a>
        </div>
    );
};

export default FloatingContactIcons;
