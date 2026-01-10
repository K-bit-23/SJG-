import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './UserProfile.css';

const UserProfile = () => {
    const { user, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();

    // Tab State
    const [activeTab, setActiveTab] = useState('profile'); // profile, orders, addresses
    const [userForm, setUserForm] = useState({
        displayName: '',
        phone: '',
        email: ''
    });

    // For Demo: Address List (Mock or Persistent)
    // Ideally this comes from User.addresses in MongoDB
    const [addresses, setAddresses] = useState([
        { id: 1, type: 'Home', text: '123 Main Street, Erode', isDefault: true }
    ]);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        } else if (user) {
            setUserForm({
                displayName: user.displayName || user.name || '',
                phone: user.phone || '', // Need to ensure User model has phone
                email: user.email || ''
            });
        }
    }, [user, authLoading, navigate]);

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        alert("Profile Update Logic would call API here.");
        // await axios.put(...)
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (authLoading || !user) return <div className="loading-screen">Loading Profile...</div>;

    return (
        <div className="profile-page-wrapper">
            <div className="profile-container">

                {/* Sidebar */}
                <div className="profile-sidebar">
                    <div className="user-short-info">
                        <img src={user.photoURL || "/default-avatar.png"} alt="User" className="profile-avatar-lg" />
                        <h3>{user.displayName || user.name || 'User'}</h3>
                        <span>{user.email}</span>
                    </div>

                    <nav className="profile-nav">
                        <button
                            className={activeTab === 'profile' ? 'active' : ''}
                            onClick={() => setActiveTab('profile')}
                        >
                            <i className="fas fa-user-circle"></i> Profile Details
                        </button>
                        <button
                            className={activeTab === 'orders' ? 'active' : ''}
                            onClick={() => setActiveTab('orders')}
                        >
                            <i className="fas fa-shopping-bag"></i> My Orders
                        </button>
                        <button
                            className={activeTab === 'addresses' ? 'active' : ''}
                            onClick={() => setActiveTab('addresses')}
                        >
                            <i className="fas fa-map-marker-alt"></i> Addresses
                        </button>
                        <button onClick={handleLogout} className="logout-btn">
                            <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </nav>
                </div>

                {/* Content Area */}
                <div className="profile-content">

                    {/* --- Profile Tab --- */}
                    {activeTab === 'profile' && (
                        <div className="tab-pane fade-in">
                            <h2>My Profile</h2>
                            <form className="profile-form" onSubmit={handleUpdateProfile}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        value={userForm.displayName}
                                        onChange={(e) => setUserForm({ ...userForm, displayName: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={userForm.email}
                                        disabled
                                        className="disabled-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        value={userForm.phone}
                                        placeholder="+91 00000 00000"
                                        onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="save-btn">Save Changes</button>
                            </form>
                        </div>
                    )}

                    {/* --- Orders Tab (Using simple list or component) --- */}
                    {activeTab === 'orders' && (
                        <div className="tab-pane fade-in">
                            <h2>Order History</h2>
                            <div className="orders-placeholder">
                                <p>You can view your detailed order history in the dedicated orders page.</p>
                                <button onClick={() => navigate('/my-orders')} className="view-orders-btn">
                                    Go to My Orders
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- Addresses Tab --- */}
                    {activeTab === 'addresses' && (
                        <div className="tab-pane fade-in">
                            <div className="tab-header">
                                <h2>Saved Addresses</h2>
                                <button className="add-btn">+ Add New</button>
                            </div>

                            <div className="address-list">
                                {addresses.map(addr => (
                                    <div key={addr.id} className="address-card">
                                        <div className="addr-icon"><i className="fas fa-home"></i></div>
                                        <div className="addr-details">
                                            <h4>{addr.type} {addr.isDefault && <span className="badge">Default</span>}</h4>
                                            <p>{addr.text}</p>
                                        </div>
                                        <div className="addr-actions">
                                            <button><i className="fas fa-pencil-alt"></i></button>
                                            <button><i className="fas fa-trash"></i></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
