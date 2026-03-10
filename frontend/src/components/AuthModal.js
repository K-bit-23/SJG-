import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Fingerprint } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // Form States - Pre-filled with admin credentials for easy access
    const [email, setEmail] = useState('admin@sjg.com');
    const [password, setPassword] = useState('admin123');
    const [name, setName] = useState('Admin User');

    const { login, register, googleLogin, biometricLogin } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            let result;
            if (isLogin) {
                result = await login(email, password);
            } else {
                result = await register(name, email, password);
            }
            onClose();
            // Redirect admin to admin dashboard
            if (result?.user?.role === 'admin' || email === 'admin@sjg.com') {
                navigate('/admin');
            }
        } catch (err) {
            const errorMessage = err.message || 'Authentication failed';
            // Clean up Firebase error messages
            setError(errorMessage.replace('Firebase: ', '').replace(/\(auth\/[^)]+\)/g, ''));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            await googleLogin();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBiometricLogin = async () => {
        try {
            setLoading(true);
            await biometricLogin();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            {/* Modal Container */}
            <div className="relative bg-white w-full max-w-[360px] rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up transform transition-all">

                {/* Header Gradient */}
                <div className="bg-gradient-to-r from-primary to-secondary p-6 text-center text-white relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                    <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-lg">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                    </div>
                    <h2 className="text-2xl font-bold">{isLogin ? 'Welcome Back' : 'Join Us'}</h2>
                    <p className="text-white/80 text-sm mt-1">
                        {isLogin ? 'Login to continue shopping' : 'Create an account to get started'}
                    </p>
                </div>

                {/* Form Section */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-500 text-xs rounded-lg border border-red-100 flex items-center">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:bg-white transition-all text-sm font-medium"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={18} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:bg-white transition-all text-sm font-medium"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:bg-white transition-all text-sm font-medium"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded text-secondary focus:ring-secondary" />
                                <span>Remember me</span>
                            </label>
                            {isLogin && <button type="button" className="hover:text-secondary">Forgot Password?</button>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Login' : 'create Account')}
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Or continue with</span></div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            type="button"
                            className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                            <span>Google</span>
                        </button>

                        <button
                            onClick={handleBiometricLogin}
                            disabled={loading}
                            type="button"
                            className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Fingerprint className="text-primary w-5 h-5" />
                            <span>Biometric</span>
                        </button>
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        {isLogin ? "New here? " : "Already have an account? "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-secondary font-bold hover:underline"
                        >
                            {isLogin ? "Create an account" : "Login"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
