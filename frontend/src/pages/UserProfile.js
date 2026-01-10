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
    const [activeTab, setActiveTab] = useState('profile');
    const [userForm, setUserForm] = useState({
        displayName: '',
        phone: '',
        email: ''
    });

    // MongoDB user details
    const [userDetails, setUserDetails] = useState(null);
    const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, completed: 0 });
    const [loading, setLoading] = useState(true);

    // For Demo: Address List
    const [addresses, setAddresses] = useState([
        { id: 1, type: 'Home', text: '123 Main Street, Erode', isDefault: true }
    ]);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        } else if (user) {
            fetchUserDetails();
            fetchOrderStats();
        }
    }, [user, authLoading, navigate]);

    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/users/${user.uid}/`);
            setUserDetails(response.data);
            setUserForm({
                displayName: response.data.display_name || user.displayName || user.name || '',
                phone: response.data.mobile || '',
                email: response.data.email || user.email || ''
            });
        } catch (error) {
            console.error('Error fetching user details:', error);
            // Fallback to auth context user
            setUserForm({
                displayName: user.displayName || user.name || '',
                phone: user.mobile || '',
                email: user.email || ''
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderStats = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/orders/`);
            const userOrders = response.data.filter(order => order.user_email === user.email);
            setOrderStats({
                total: userOrders.length,
                pending: userOrders.filter(o => o.status === 'pending').length,
                completed: userOrders.filter(o => o.status === 'completed').length
            });
        } catch (error) {
            console.error('Error fetching order stats:', error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        // Validation
        if (!userForm.displayName.trim()) {
            alert('Please enter your name');
            return;
        }

        if (userForm.phone && !/^\+?[\d\s-()]+$/.test(userForm.phone)) {
            alert('Please enter a valid phone number');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.put(`${API_BASE_URL}/api/users/${user.uid}/`, {
                display_name: userForm.displayName,
                mobile: userForm.phone
            });

            // Update successful
            alert('✅ Profile updated successfully!');

            // Refresh user details from MongoDB
            await fetchUserDetails();

            // Optional: Update AuthContext if needed
            // This ensures the navbar also shows updated name
            if (window.location.reload) {
                // You might want to implement a soft refresh of auth context instead
                console.log('Profile updated in database');
            }

        } catch (error) {
            console.error('Error updating profile:', error);
            const errorMessage = error.response?.data?.error || 'Failed to update profile. Please try again.';
            alert('❌ ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (authLoading || loading || !user) return <div className="loading-screen">Loading Profile...</div>;

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

                            {/* Account Stats */}
                            <div className="account-stats">
                                <div className="stat-card">
                                    <i className="fas fa-shopping-bag"></i>
                                    <div>
                                        <h3>{orderStats.total}</h3>
                                        <p>Total Orders</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <i className="fas fa-clock"></i>
                                    <div>
                                        <h3>{orderStats.pending}</h3>
                                        <p>Pending</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <i className="fas fa-check-circle"></i>
                                    <div>
                                        <h3>{orderStats.completed}</h3>
                                        <p>Completed</p>
                                    </div>
                                </div>
                            </div>

                            {/* Account Information */}
                            <div className="info-section">
                                <h3>Account Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>User ID</label>
                                        <p>{userDetails?.uid?.substring(0, 12)}...</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Account Type</label>
                                        <p className="role-badge">{userDetails?.role || 'user'}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Member Since</label>
                                        <p>{userDetails?.created_at ? new Date(userDetails.created_at).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Last Updated</label>
                                        <p>{userDetails?.updated_at ? new Date(userDetails.updated_at).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Edit Profile Form */}
                            <form className="profile-form" onSubmit={handleUpdateProfile}>
                                <h3>Edit Profile</h3>
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
                                    <small>Email cannot be changed</small>
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
                                <button type="submit" className="save-btn" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i> Updating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save"></i> Save Changes
                                        </>
                                    )}
                                </button>
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
