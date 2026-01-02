import React from 'react';
import AdminNavbar from './admin/AdminNavbar'; // Corrected import path

const AdminLayout = ({ children }) => {
    return (
        <div className="admin-layout">
            <AdminNavbar />
            <div className="admin-page-content">
                {children}
            </div>
        </div>
    );
};

export default AdminLayout;
