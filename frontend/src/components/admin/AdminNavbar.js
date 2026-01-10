import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminNavbar.css';

const AdminNavbar = ({ isCollapsed, setIsCollapsed }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <nav className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            {/* Header / Toggle */}
            <div className="admin-sidebar-header">
                <div className="brand-logo">
                    <img src="/sjg-logo.jpg" alt="Logo" className="logo-img" />
                    {!isCollapsed && <span className="logo-text">Admin Panel</span>}
                </div>
                <button className="toggle-btn" onClick={toggleSidebar}>
                    <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
                </button>
            </div>

            {/* Navigation Links */}
            <div className="admin-sidebar-links">
                <NavLink to="/admin" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <span className="icon-box"><i className="fas fa-chart-line"></i></span>
                    <span className="link-text">Dashboard</span>
                    {isCollapsed && <span className="tooltip">Dashboard</span>}
                </NavLink>

                <div className="nav-section-label">{!isCollapsed && "Management"}</div>

                <NavLink to="/admin/inventory" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <span className="icon-box"><i className="fas fa-box"></i></span>
                    <span className="link-text">Inventory</span>
                    {isCollapsed && <span className="tooltip">Inventory</span>}
                </NavLink>

                <NavLink to="/admin/orders" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <span className="icon-box"><i className="fas fa-shopping-bag"></i></span>
                    <span className="link-text">Orders</span>
                    {isCollapsed && <span className="tooltip">Orders</span>}
                </NavLink>

                <NavLink to="/admin/users" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <span className="icon-box"><i className="fas fa-users"></i></span>
                    <span className="link-text">Users</span>
                    {isCollapsed && <span className="tooltip">Users</span>}
                </NavLink>

                <div className="nav-section-label">{!isCollapsed && "Store"}</div>

                <NavLink to="/products" className="nav-item">
                    <span className="icon-box"><i className="fas fa-shopping-cart"></i></span>
                    <span className="link-text">Shop Products</span>
                    {isCollapsed && <span className="tooltip">Shop Products</span>}
                </NavLink>

                <div className="nav-section-label">{!isCollapsed && "Sales"}</div>

                <NavLink to="/admin/billing" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <span className="icon-box"><i className="fas fa-file-invoice-dollar"></i></span>
                    <span className="link-text">Offline Billing</span>
                    {isCollapsed && <span className="tooltip">Offline Billing</span>}
                </NavLink>

                <div className="nav-section-label">{!isCollapsed && "CMS"}</div>

                <NavLink to="/admin/content/home" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <span className="icon-box"><i className="fas fa-home"></i></span>
                    <span className="link-text">Edit Home Page</span>
                    {isCollapsed && <span className="tooltip">Edit Home</span>}
                </NavLink>

                <NavLink to="/admin/chatbot" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <span className="icon-box"><i className="fas fa-robot"></i></span>
                    <span className="link-text">Chat Bot Config</span>
                    {isCollapsed && <span className="tooltip">Chat Bot</span>}
                </NavLink>
            </div>

            {/* User Footer */}
            <div className="admin-sidebar-footer">
                <div className="user-profile" onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <div className="user-avatar-icon">
                        <i className="fas fa-user-shield"></i>
                    </div>
                    {!isCollapsed && (
                        <div className="user-details">
                            <div className="user-name">{user?.name}</div>
                            <div className="user-role">Admin</div>
                        </div>
                    )}
                </div>

                {/* Footer Actions (Logout only) */}
                <div className="footer-actions">
                    <button onClick={handleLogout} className="footer-action-btn logout" title="Logout">
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default AdminNavbar;
