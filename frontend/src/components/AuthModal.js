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
            <div className="auth-modal">
                <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                    <img src="/sjg-logo.jpg" alt="SJG" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }} />
                </div>
                <button className="auth-modal-close" onClick={closeAuthModal}>
                    <i className="fas fa-times"></i>
                </button>

                <div className="auth-modal-content">
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
