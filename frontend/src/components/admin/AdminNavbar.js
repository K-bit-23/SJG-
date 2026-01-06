import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminNavbar.css';

const AdminNavbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/'); // Redirect to home after logout
    };

    return (
        <nav className="admin-navbar">
            <div className="admin-navbar-brand">
                <NavLink to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/sjg-logo.jpg" alt="Logo" style={{ height: '35px', borderRadius: '50%' }} />
                    <span>Admin Panel</span>
                </NavLink>
            </div>
            <div className="admin-navbar-links">
                <NavLink to="/admin" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <i className="fas fa-chart-line"></i> Dashboard
                </NavLink>
                <NavLink to="/admin/inventory" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <i className="fas fa-box"></i> Inventory
                </NavLink>
                <NavLink to="/admin/orders" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <i className="fas fa-shopping-bag"></i> Orders
                </NavLink>
                <NavLink to="/admin/users" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <i className="fas fa-users"></i> Users
                </NavLink>
                <NavLink to="/admin/billing" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <i className="fas fa-file-invoice-dollar"></i> Billing (POS)
                </NavLink>
            </div>
            <div className="admin-navbar-user" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
                {user && (
                    <>
                        <div className="user-info">
                            <img src={user.avatar} alt={user.name} className="user-avatar" />
                            <span>{user.name}</span>
                            <i className="fas fa-chevron-down"></i>
                        </div>
                        {dropdownOpen && (
                            <div className="user-dropdown">
                                <NavLink to="/" className="dropdown-item">
                                    <i className="fas fa-home"></i> Back to Store
                                </NavLink>
                                <button onClick={handleLogout} className="dropdown-item logout">
                                    <i className="fas fa-sign-out-alt"></i> Logout
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </nav>
    );
};

export default AdminNavbar;
