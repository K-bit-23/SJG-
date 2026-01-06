import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './UserManagement.css';

const UserManagement = () => {
    const { users, updateUserRole, deleteUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        role: ''
    });

    const handleOpenModal = (user) => {
        setEditingUser(user);
        setFormData({ role: user.role });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateUserRole(editingUser.id, formData.role);
        handleCloseModal();
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            deleteUser(id);
        }
    };

    const filteredUsers = (users || []).filter(user =>
        (user.displayName || user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>User Management</h1>
            </div>

            <div className="search-bar">
                <i className="fas fa-search"></i>
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="users-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Avatar</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt={user.displayName || user.email} className="user-thumb" />
                                        ) : (
                                            <div className="user-thumb user-avatar-placeholder">
                                                <i className="fas fa-user"></i>
                                            </div>
                                        )}
                                    </td>
                                    <td>{user.displayName || user.email?.split('@')[0] || 'N/A'}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`role-badge ${(user.role || 'user').toLowerCase()}`}>
                                            {user.role || 'User'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-edit" onClick={() => handleOpenModal(user)}>
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button className="btn-delete" onClick={() => handleDelete(user.id)}>
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                    <i className="fas fa-users" style={{ fontSize: '3rem', color: '#ddd', marginBottom: '1rem' }}></i>
                                    <p>No users found</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Edit User Role</h2>
                            <button className="btn-close" onClick={handleCloseModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Customer">Customer</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save">
                                    Update Role
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
