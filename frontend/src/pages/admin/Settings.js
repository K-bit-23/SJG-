import React, { useState } from 'react';
import './AdminDashboard.css';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');

    return (
        <div className="admin-content">
            <div className="admin-header">
                <h1>Admin Settings</h1>
                <p>Manage your store preferences</p>
            </div>

            <div className="settings-container" style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <div className="settings-tabs" style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    <button
                        onClick={() => setActiveTab('general')}
                        style={{
                            padding: '10px 20px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'general' ? '2px solid #6e8efb' : '2px solid transparent',
                            color: activeTab === 'general' ? '#6e8efb' : '#666',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab('payment')}
                        style={{
                            padding: '10px 20px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'payment' ? '2px solid #6e8efb' : '2px solid transparent',
                            color: activeTab === 'payment' ? '#6e8efb' : '#666',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Payment Methods
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        style={{
                            padding: '10px 20px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'notifications' ? '2px solid #6e8efb' : '2px solid transparent',
                            color: activeTab === 'notifications' ? '#6e8efb' : '#666',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Notifications
                    </button>
                </div>

                {activeTab === 'general' && (
                    <div className="settings-section">
                        <h3>Store Information</h3>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#444' }}>Store Name</label>
                            <input type="text" defaultValue="SJG Stationary & Xerox" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#444' }}>Contact Email</label>
                            <input type="email" defaultValue="admin@sjg.com" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                        </div>
                        <button className="btn-save" style={{ padding: '10px 20px', background: '#6e8efb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save Changes</button>
                    </div>
                )}

                {activeTab === 'payment' && (
                    <div className="settings-section">
                        <h3>Payment Configuration</h3>
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input type="checkbox" defaultChecked /> Enable Cash on Delivery
                            </label>
                        </div>
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input type="checkbox" defaultChecked /> Enable UPI Payments
                            </label>
                        </div>
                        <button className="btn-save" style={{ padding: '10px 20px', background: '#6e8efb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}>Save Changes</button>
                    </div>
                )}
                {activeTab === 'notifications' && (
                    <div className="settings-section">
                        <h3>Notification Preferences</h3>
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input type="checkbox" defaultChecked /> Email on New Order
                            </label>
                        </div>
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input type="checkbox" defaultChecked /> Email on Low Stock
                            </label>
                        </div>
                        <button className="btn-save" style={{ padding: '10px 20px', background: '#6e8efb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}>Save Changes</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
