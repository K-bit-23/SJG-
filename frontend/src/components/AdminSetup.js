import React, { useState } from 'react';
import { createAdminUser } from '../utils/createAdminUser';
import { registerWithEmail } from '../services/firebaseAuth';

const AdminSetup = () => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [customAdmin, setCustomAdmin] = useState({
        email: 'sjgvxerox@gmail.com',
        password: 'password123',
        mobile: ''
    });

    const handleCreateAdmin = async () => {
        setLoading(true);
        const res = await createAdminUser();
        setResult(res);
        setLoading(false);
    };

    const handleCreateCustomAdmin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const res = await registerWithEmail(
            customAdmin.email,
            customAdmin.password,
            {
                mobile: customAdmin.mobile,
                role: 'admin'
            }
        );

        setResult(res);
        setLoading(false);
    };

    return (
        <div style={{
            padding: '30px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            margin: '20px auto',
            maxWidth: '600px',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            color: 'white'
        }}>
            <h2 style={{ marginBottom: '10px', fontSize: '2rem' }}>
                🔧 Admin Setup Tool
            </h2>
            <p style={{ marginBottom: '30px', opacity: 0.9 }}>
                Use this tool to create your admin account. Remove this component after setup is complete.
            </p>

            {/* Quick Setup */}
            <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '20px',
                borderRadius: '10px',
                marginBottom: '20px',
                backdropFilter: 'blur(10px)'
            }}>
                <h3 style={{ marginBottom: '15px' }}>Quick Setup (Default Admin)</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '15px', opacity: 0.9 }}>
                    Email: sjgvxerox@gmail.com<br />
                    Password: password123
                </p>
                <button
                    onClick={handleCreateAdmin}
                    disabled={loading}
                    style={{
                        background: 'white',
                        color: '#667eea',
                        border: 'none',
                        padding: '12px 30px',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        width: '100%',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {loading ? '⏳ Creating...' : '✨ Create Default Admin'}
                </button>
            </div>

            {/* Custom Admin */}
            <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '20px',
                borderRadius: '10px',
                backdropFilter: 'blur(10px)'
            }}>
                <h3 style={{ marginBottom: '15px' }}>Custom Admin Setup</h3>
                <form onSubmit={handleCreateCustomAdmin}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={customAdmin.email}
                            onChange={(e) => setCustomAdmin({ ...customAdmin, email: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={customAdmin.password}
                            onChange={(e) => setCustomAdmin({ ...customAdmin, password: e.target.value })}
                            required
                            minLength={6}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>
                            Mobile (Optional)
                        </label>
                        <input
                            type="tel"
                            value={customAdmin.mobile}
                            onChange={(e) => setCustomAdmin({ ...customAdmin, mobile: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: '#ffd700',
                            color: '#333',
                            border: 'none',
                            padding: '12px 30px',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            width: '100%',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {loading ? '⏳ Creating...' : '🚀 Create Custom Admin'}
                    </button>
                </form>
            </div>

            {/* Result Display */}
            {result && (
                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    borderRadius: '10px',
                    background: result.success ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)',
                    border: `2px solid ${result.success ? '#4CAF50' : '#f44336'}`
                }}>
                    {result.success ? (
                        <>
                            <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
                                ✅ Admin User Created Successfully!
                            </p>
                            <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                Email: {result.user?.email}
                            </p>
                            <p style={{ fontSize: '0.9rem', marginTop: '10px', fontWeight: 'bold' }}>
                                🎉 You can now login with these credentials!
                            </p>
                        </>
                    ) : (
                        <>
                            <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
                                ❌ Error Creating Admin
                            </p>
                            <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                {result.error}
                            </p>
                            {result.error?.includes('email-already-in-use') && (
                                <p style={{ fontSize: '0.9rem', marginTop: '10px', fontWeight: 'bold' }}>
                                    💡 This admin already exists. You can login directly!
                                </p>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Instructions */}
            <div style={{
                marginTop: '20px',
                padding: '15px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '10px',
                fontSize: '0.85rem',
                opacity: 0.8
            }}>
                <p style={{ marginBottom: '10px' }}>
                    <strong>📋 Instructions:</strong>
                </p>
                <ol style={{ paddingLeft: '20px', margin: 0 }}>
                    <li>Make sure Firebase Authentication is enabled in your Firebase Console</li>
                    <li>Enable Email/Password sign-in method</li>
                    <li>Click one of the buttons above to create admin</li>
                    <li>After successful creation, remove this component from your app</li>
                    <li>Login using the admin credentials</li>
                </ol>
            </div>
        </div>
    );
};

export default AdminSetup;
