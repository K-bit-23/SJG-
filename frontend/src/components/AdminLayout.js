import React from 'react';
import AdminDashboard from '../pages/admin/AdminDashboard';

const AdminLayout = ({ children }) => {
    return (
        <div className="admin-layout">
            <AdminDashboard />
            <div className="admin-page-content">
                {children}
            </div>
        </div>
    );
};

export default AdminLayout;
