import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

const RegisterForm = ({ onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, loginWithGoogle } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }
        setLoading(true);
        const result = await register({ name, email, password });
        if (!result.success) {
            setError(result.error || 'Registration failed.');
            setLoading(false);
        } else {
            setLoading(false);
        }
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
                <h2 className="auth-title">Sign Up</h2>
                <p className="auth-subtitle">Join us to get exclusive offers and track your orders easily</p>
            </div>

            {error && <div className="auth-error-msg">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form-fields">
                <div className="input-group">
                    <label>Full Name</label>
                    <div className="fancy-input-wrapper">
                        <i className="fas fa-user input-icon"></i>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            required
                        />
                    </div>
                </div>

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
                            placeholder="Create password"
                            required
                        />
                        <i
                            className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
                            onClick={() => setShowPassword(!showPassword)}
                        ></i>
                    </div>
                </div>

                <div className="input-group">
                    <label>Confirm Password</label>
                    <div className="fancy-input-wrapper">
                        <i className="fas fa-lock input-icon"></i>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            required
                        />
                        <i
                            className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        ></i>
                    </div>
                </div>

                <button type="submit" className="funky-submit-btn" disabled={loading}>
                    {loading ? <i className="fas fa-spinner fa-spin"></i> : 'REGISTER'}
                </button>
            </form>

            <div className="auth-divider"><span>OR</span></div>

            <div className="social-login-buttons">
                <button className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
                    <i className="fab fa-google"></i>
                    <span>Sign up with Google</span>
                </button>
            </div>

            <div className="auth-switch-wrapper">
                <span>Already have an account?</span>
                <button onClick={onSwitchToLogin} className="switch-mode-link">Login here</button>
            </div>
        </div>
    );
};

export default RegisterForm;
