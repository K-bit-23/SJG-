import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

const LoginForm = ({ onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role === 'admin') navigate('/admin');
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, password, rememberMe);
        if (!result.success) setError(result.error || 'Login failed.');
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        const result = await loginWithGoogle();
        if (!result.success) setError(result.error || 'Google login failed');
        setLoading(false);
    };

    return (
        <div className="auth-form-container">
            <div className="auth-header-section">
                <h2 className="auth-title">Login</h2>
                <p className="auth-subtitle">Get access to your Orders, Wishlist and Recommendations</p>
            </div>

            {error && <div className="auth-error-msg">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form-fields">
                <div className="input-group">
                    <label>Email Address</label>
                    <div className="fancy-input-wrapper">
                        <i className="fas fa-envelope input-icon"></i>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="mail@example.com"
                            required
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label>Password</label>
                    <div className="fancy-input-wrapper">
                        <i className="fas fa-lock input-icon"></i>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                        <i
                            className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
                            onClick={() => setShowPassword(!showPassword)}
                        ></i>
                    </div>
                </div>

                <div className="form-options-row">
                    <label className="custom-checkbox">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <span className="checkmark"></span>
                        <span className="label-text">Remember me</span>
                    </label>
                    <button type="button" className="forgot-pass-btn">Forgot?</button>
                </div>

                <button type="submit" className="funky-submit-btn" disabled={loading}>
                    {loading ? <i className="fas fa-spinner fa-spin"></i> : 'LOGIN'}
                </button>
            </form>

            <div className="auth-divider"><span>OR</span></div>

            <div className="social-login-buttons">
                <button className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
                    <i className="fab fa-google"></i>
                    <span>Continue with Google</span>
                </button>
            </div>

            <div className="auth-switch-wrapper">
                <span>New here?</span>
                <button onClick={onSwitchToRegister} className="switch-mode-link">Create an account</button>
            </div>
        </div>
    );
};

export default LoginForm;
