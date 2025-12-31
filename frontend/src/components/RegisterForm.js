import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

const RegisterForm = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        mobile: '',
        role: 'user',
        acceptTerms: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');
    const { register, loginWithGoogle } = useAuth();

    const calculatePasswordStrength = (password) => {
        if (password.length === 0) return '';
        if (password.length < 6) return 'weak';
        if (password.length < 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 'medium';
        if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) return 'strong';
        return 'medium';
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (name === 'password') {
            setPasswordStrength(calculatePasswordStrength(value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!formData.acceptTerms) {
            setError('Please accept the terms and conditions');
            return;
        }

        if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        setLoading(true);
        const result = await register(formData);

        if (!result.success) {
            setError(result.error || 'Registration failed. Please try again.');
        }

        setLoading(false);
    };

    const handleGoogleRegister = async () => {
        setError('');
        setLoading(true);
        const result = await loginWithGoogle();
        if (!result.success) {
            setError(result.error || 'Google registration failed');
        }
        setLoading(false);
    };

    return (
        <div className="auth-form">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Join us today!</p>

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
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="mobile">
                        <i className="fas fa-phone"></i>
                        Mobile Number
                    </label>
                    <input
                        type="tel"
                        id="mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="Enter 10-digit mobile number"
                        pattern="[0-9]{10}"
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
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        required
                    />
                    {passwordStrength && (
                        <div className={`password-strength ${passwordStrength}`}>
                            <div className="strength-bar"></div>
                            <span className="strength-text">{passwordStrength}</span>
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">
                        <i className="fas fa-lock"></i>
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                    />
                </div>

                <div className="role-toggle">
                    <label className="toggle-label">Account Type:</label>
                    <div className="toggle-buttons">
                        <button
                            type="button"
                            className={`toggle-btn ${formData.role === 'user' ? 'active' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, role: 'user' }))}
                        >
                            <i className="fas fa-user"></i>
                            User
                        </button>
                        <button
                            type="button"
                            className={`toggle-btn ${formData.role === 'admin' ? 'active' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
                        >
                            <i className="fas fa-user-shield"></i>
                            Admin
                        </button>
                    </div>
                </div>

                <label className="checkbox-label terms-label">
                    <input
                        type="checkbox"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleChange}
                    />
                    <span>I accept the <a href="#terms">Terms & Conditions</a></span>
                </label>

                <button type="submit" className="btn-auth-primary" disabled={loading}>
                    {loading ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            <span>Creating Account...</span>
                        </>
                    ) : (
                        <>
                            <i className="fas fa-user-plus"></i>
                            <span>Register</span>
                        </>
                    )}
                </button>
            </form>

            <div className="auth-divider">
                <span>OR</span>
            </div>

            <div className="social-auth">
                <button className="btn-google" onClick={handleGoogleRegister} disabled={loading}>
                    <i className="fab fa-google"></i>
                    <span>Register with Google</span>
                </button>
            </div>

            <p className="auth-switch">
                Already have an account?{' '}
                <button onClick={onSwitchToLogin} className="switch-link">
                    Login Now
                </button>
            </p>
        </div>
    );
};

export default RegisterForm;
