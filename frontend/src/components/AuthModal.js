import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import './AuthModal.css';

const AuthModal = () => {
    // We derive local view from context, but we need to track if we switched *within* the modal so we might need local state initialized from props, 
    // or just rely on the context's modalView if we move setModalView to context.
    // For simplicity, let's sync local state with context on open, or just use context state if we want persistence.
    // Actually, `isLogin` was local. Let's start using strictly the context or just local state initialized by context.

    // Better approach: Let AuthContext control the view entirely? Or just initial view?
    // Let's use local state for immediate toggles, initialized from context.
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
                <button className="auth-modal-close" onClick={closeAuthModal}>
                    <i className="fas fa-times"></i>
                </button>

                <div className="auth-modal-content">
                    {currentView === 'register' ? (
                        <RegisterForm onSwitchToLogin={() => setCurrentView('login')} />
                    ) : (
                        <LoginForm
                            isAdmin={currentView === 'admin'}
                            onSwitchToRegister={() => setCurrentView('register')}
                            onSwitchToUserLogin={() => setCurrentView('login')} // For traversing back from admin
                            onSwitchToAdminLogin={() => setCurrentView('admin')}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
