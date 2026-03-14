import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home, Loader2 } from 'lucide-react';
import axios from 'axios';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('order_id') || '';
    const sessionId = searchParams.get('session_id') || '';
    const [countdown, setCountdown] = useState(10);
    const [status, setStatus] = useState('confirming'); // confirming, success, error

    useEffect(() => {
        const confirmPayment = async () => {
            if (sessionId) {
                try {
                    await axios.post('/api/confirm-stripe-session/', {
                        session_id: sessionId,
                        order_id: orderId
                    });
                    setStatus('success');
                } catch (err) {
                    console.error('Confirmation error:', err);
                    setStatus('error');
                }
            } else {
                setStatus('success');
            }
        };

        confirmPayment();

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [navigate, sessionId, orderId]);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                background: 'white',
                borderRadius: '24px',
                boxShadow: '0 25px 80px rgba(0,0,0,0.12)',
                padding: '60px 48px',
                maxWidth: '520px',
                width: '100%',
                textAlign: 'center',
                animation: 'fadeSlideUp 0.6s ease-out'
            }}>
                {/* Success Icon with pulse ring */}
                <div style={{ position: 'relative', display: 'inline-flex', marginBottom: '32px' }}>
                    <div style={{
                        width: '100px', height: '100px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(34,197,94,0.4)',
                        animation: 'successPulse 2s ease-in-out infinite'
                    }}>
                        {status === 'confirming' ? (
                            <Loader2 size={52} color="white" strokeWidth={2.5} className="animate-spin" />
                        ) : status === 'error' ? (
                            <Package size={52} color="white" strokeWidth={2.5} />
                        ) : (
                            <CheckCircle size={52} color="white" strokeWidth={2.5} />
                        )}
                    </div>
                </div>

                <h1 style={{
                    fontSize: '32px', fontWeight: '800',
                    color: status === 'error' ? '#dc2626' : '#15803d', marginBottom: '8px', lineHeight: 1.2
                }}>
                    {status === 'confirming' ? 'Confirming Payment...' : 
                     status === 'error' ? 'Payment Verification Failed' : 
                     'Payment Successful! 🎉'}
                </h1>

                <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '32px', lineHeight: 1.6 }}>
                    {status === 'confirming' ? 'Please wait while we verify your transaction with Stripe.' :
                     status === 'error' ? 'There was a problem verifying your payment. Please contact support if your account was debited.' :
                     "Your order has been confirmed and is now being processed. You'll receive an email confirmation shortly (within 30 seconds)."}
                </p>

                {orderId && (
                    <div style={{
                        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                        border: '1.5px solid #86efac',
                        borderRadius: '16px',
                        padding: '20px 28px',
                        marginBottom: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Package size={20} color="#16a34a" />
                            <span style={{ color: '#374151', fontSize: '14px', fontWeight: '600' }}>Order ID</span>
                        </div>
                        <span style={{
                            color: '#15803d', fontWeight: '700', fontSize: '15px',
                            fontFamily: 'monospace', letterSpacing: '0.5px'
                        }}>
                            {orderId}
                        </span>
                    </div>
                )}

                {/* What's next */}
                <div style={{
                    background: '#f9fafb',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    marginBottom: '32px',
                    textAlign: 'left'
                }}>
                    <p style={{ fontWeight: '700', color: '#374151', marginBottom: '12px', fontSize: '14px' }}>
                        What happens next?
                    </p>
                    {[
                        '✅ Order confirmation email sent',
                        '📦 Your order is being packed',
                        '🚚 Delivery within 3–5 business days',
                    ].map((step, i) => (
                        <p key={i} style={{ color: '#6b7280', fontSize: '13px', margin: '6px 0' }}>{step}</p>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => navigate('/profile')}
                        style={{
                            flex: 1, padding: '14px 20px',
                            borderRadius: '12px', border: '2px solid #16a34a',
                            background: 'transparent', color: '#16a34a',
                            fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = '#f0fdf4'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                        <Package size={16} /> My Orders
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            flex: 1, padding: '14px 20px',
                            borderRadius: '12px', border: 'none',
                            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                            color: 'white', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            boxShadow: '0 4px 16px rgba(34,197,94,0.35)',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <Home size={16} /> Go Home <ArrowRight size={14} />
                    </button>
                </div>

                <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '24px' }}>
                    Auto-redirecting in {countdown}s...
                </p>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes successPulse {
                    0%, 100% { box-shadow: 0 8px 32px rgba(34,197,94,0.4); }
                    50% { box-shadow: 0 8px 48px rgba(34,197,94,0.7); }
                }
            `}</style>
        </div>
    );
};

export default PaymentSuccess;
