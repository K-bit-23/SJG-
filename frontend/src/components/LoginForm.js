import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

const LoginForm = ({ onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginWithGoogle, loginWithBiometric } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password, rememberMe);

        if (!result.success) {
            setError(result.error || 'Login failed. Please try again.');
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
            <h2 className="auth-title">Welcome Back!</h2>
            <p className="auth-subtitle">Login to your account</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">
                        <i className="fas fa-envelope"></i>
                        Email Address
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
                            <span>Logging in...</span>
                        </>
                    ) : (
                        <>
                            <i className="fas fa-sign-in-alt"></i>
                            <span>Login</span>
                        </>
                    )}
                </button>
            </form>

            <div className="auth-divider">
                <span>OR</span>
            </div>

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

            <p className="auth-switch">
                Don't have an account?{' '}
                <button onClick={onSwitchToRegister} className="switch-link">
                    Register Now
                </button>
            </p>
        </div>
    );
};

export default LoginForm;
