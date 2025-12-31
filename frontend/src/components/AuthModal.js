import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import './AuthModal.css';

const AuthModal = () => {
    const [isLogin, setIsLogin] = useState(true);
    const { isAuthModalOpen, closeAuthModal } = useAuth();

    if (!isAuthModalOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target.classList.contains('auth-modal-backdrop')) {
            closeAuthModal();
        }
    };

    const switchToRegister = () => {
        setIsLogin(false);
    };

    const switchToLogin = () => {
        setIsLogin(true);
    };

    return (
        <div className="auth-modal-backdrop" onClick={handleBackdropClick}>
            <div className="auth-modal">
                <button className="auth-modal-close" onClick={closeAuthModal}>
                    <i className="fas fa-times"></i>
                </button>

                <div className="auth-modal-content">
                    {isLogin ? (
                        <LoginForm onSwitchToRegister={switchToRegister} />
                    ) : (
                        <RegisterForm onSwitchToLogin={switchToLogin} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
