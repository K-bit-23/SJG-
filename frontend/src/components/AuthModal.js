import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import './AuthModal.css';

const AuthModal = () => {
    const { isAuthModalOpen, closeAuthModal, modalView } = useAuth();
    const [currentView, setCurrentView] = useState(modalView);

    // Sync with context change when modal opens
    React.useEffect(() => {
        if (isAuthModalOpen) {
            setCurrentView(modalView);
        }
    }, [isAuthModalOpen, modalView]);

    if (!isAuthModalOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target.classList.contains('auth-modal-backdrop')) {
            closeAuthModal();
        }
    };

    return (
        <div className="auth-modal-backdrop" onClick={handleBackdropClick}>
            <div className="auth-modal-horizontal">
                {/* Logo at Top */}
                <img src="/sjg-logo.jpg" alt="SJG Logo" className="auth-logo-top" />

                <button className="auth-modal-close" onClick={closeAuthModal}>
                    <i className="fas fa-times"></i>
                </button>

                {/* Gradient Header */}
                <div className="auth-modal-left-side">
                    <div className="auth-branding">
                        <h2>{currentView === 'register' ? 'Register' : 'Login'}</h2>
                    </div>
                </div>

                {/* Form Section */}
                <div className="auth-modal-right-side">
                    {currentView === 'register' ? (
                        <RegisterForm onSwitchToLogin={() => setCurrentView('login')} />
                    ) : (
                        <LoginForm onSwitchToRegister={() => setCurrentView('register')} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
