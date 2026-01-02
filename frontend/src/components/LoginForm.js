import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

const LoginForm = ({ onSwitchToRegister, isAdmin, onSwitchToUserLogin, onSwitchToAdminLogin }) => {
    // ... state ...
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, login, loginWithGoogle, loginWithBiometric } = useAuth(); // Removed openAuthModal
    const navigate = useNavigate();

    // ... useEffect and handlers ...
    useEffect(() => {
        if (user) {
            if (isAdmin && user.role !== 'admin') {
                setError('Access Denied: You are not an admin.');
            } else if (user.role === 'admin') {
                navigate('/admin');
            }
        }
    }, [user, navigate, isAdmin]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password, rememberMe);

        if (!result.success) {
            setError(result.error || 'Login failed. Please try again.');
        } else {
            if (isAdmin && result.user.role !== 'admin') {
                setError('Access Denied: You are not an admin.');
            }
        }

        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        const result = await loginWithGoogle();
        if (!result.success) {
            setError(result.error || 'Google login failed');
        }
        setLoading(false);
    };

    const handleBiometricLogin = async () => {
        setError('');
        setLoading(true);
        const result = await loginWithBiometric();
        if (!result.success) {
            setError(result.error || 'Biometric authentication failed');
        }
        setLoading(false);
    };

    return (
        <div className="auth-form">
            <div className="role-toggle">
                <div className="toggle-buttons" style={{ display: 'flex', background: '#f0f0f0', borderRadius: '12px', padding: '5px', marginBottom: '20px' }}>
                    <button
                        type="button"
                        onClick={onSwitchToUserLogin}
                        className={`toggle-btn ${!isAdmin ? 'active' : ''}`}
                        style={{ flex: 1, border: 'none', background: !isAdmin ? 'white' : 'transparent', boxShadow: !isAdmin ? '0 2px 5px rgba(0,0,0,0.1)' : 'none', color: !isAdmin ? '#333' : '#666', borderRadius: '10px' }}
                    >
                        <i className="fas fa-user" style={{ marginRight: '8px' }}></i> User
                    </button>
                    <button
                        type="button"
                        onClick={onSwitchToAdminLogin}
                        className={`toggle-btn ${isAdmin ? 'active' : ''}`}
                        style={{ flex: 1, border: 'none', background: isAdmin ? 'white' : 'transparent', boxShadow: isAdmin ? '0 2px 5px rgba(0,0,0,0.1)' : 'none', color: isAdmin ? '#333' : '#666', borderRadius: '10px' }}
                    >
                        <i className="fas fa-shield-alt" style={{ marginRight: '8px' }}></i> Admin
                    </button>
                </div>
            </div>

            <h2 className="auth-title" style={{ fontSize: '1.8rem' }}>{isAdmin ? 'Admin Portal' : 'Welcome Back!'}</h2>
            <p className="auth-subtitle">{isAdmin ? 'Manage your store' : 'Login to your account'}</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">
                        <i className="fas fa-envelope"></i>
                        {isAdmin ? 'Admin Email' : 'Email Address'}
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">
                        <i className="fas fa-lock"></i>
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                </div>

                <div className="form-options">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <span>Remember me</span>
                    </label>
                    <a href="#forgot" className="forgot-link">Forgot Password?</a>
                </div>

                <button type="submit" className="btn-auth-primary" disabled={loading}>
                    {loading ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            <span>{isAdmin ? 'Verifying...' : 'Logging in...'}</span>
                        </>
                    ) : (
                        <>
                            <i className="fas fa-sign-in-alt"></i>
                            <span>{isAdmin ? 'Access Dashboard' : 'Login'}</span>
                        </>
                    )}
                </button>
            </form>

            <div className="auth-divider">
                <span>OR</span>
            </div>

            {!isAdmin && (
                <div className="social-auth">
                    <button className="btn-google" onClick={handleGoogleLogin} disabled={loading}>
                        <i className="fab fa-google"></i>
                        <span>Continue with Google</span>
                    </button>
                    <button className="btn-biometric" onClick={handleBiometricLogin} disabled={loading}>
                        <i className="fas fa-fingerprint"></i>
                        <span>Use Biometric</span>
                    </button>
                </div>
            )}

            {isAdmin && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <button
                        type="button"
                        onClick={() => login('sjgvxerox@gmail.com', 'password123')}
                        style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8rem' }}
                    >
                        Auto-fill Dev Admin
                    </button>
                </div>
            )}

            <p className="auth-switch">
                {!isAdmin && (
                    <>
                        Don't have an account?{' '}
                        <button onClick={onSwitchToRegister} className="switch-link">
                            Register Now
                        </button>
                    </>
                )}
            </p>
        </div>
    );
};

export default LoginForm;
