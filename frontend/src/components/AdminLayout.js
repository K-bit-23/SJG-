import React, { useState } from 'react';
import AdminNavbar from './admin/AdminNavbar'; // Corrected import path

const AdminLayout = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="admin-layout">
            <AdminNavbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <div
                className="admin-page-content"
                style={{
                    marginLeft: isCollapsed ? '80px' : '250px',
                    transition: 'margin-left 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    width: 'auto',
                    minHeight: '100vh',
                    background: '#f8f9fa'
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default AdminLayout;
