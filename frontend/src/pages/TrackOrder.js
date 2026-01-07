import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './TrackOrder.css';

const TrackOrder = () => {
    const [orderId, setOrderId] = useState('');
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!orderId.trim()) return;

        setLoading(true);
        setError('');
        setStatus(null);

        try {
            // Fetch order details from API
            const response = await axios.get(`${API_BASE_URL}/api/orders/${orderId}/`);
            const order = response.data;

            setStatus({
                id: order.order_id || order.id,
                state: order.status || 'Pending',
                date: new Date(order.updated_at || order.created_at).toLocaleString(),
                details: order
            });
        } catch (err) {
            console.error(err);
            setError('Order not found. Please check your Order ID.');
        } finally {
            setLoading(false);
        }
    };

    const getTimelineClass = (step) => {
        if (!status) return '';
        const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
        const currentIdx = steps.indexOf(status.state);
        const stepIdx = steps.indexOf(step);

        if (stepIdx < currentIdx) return 'timeline-step completed';
        if (stepIdx === currentIdx) return 'timeline-step active';
        return 'timeline-step';
    };

    return (
        <div className="track-order-page">
            <div className="track-order-container">
                <h2>Track Your Order</h2>
                <p>Enter your Order ID (e.g., ORD-2024...) to see the current status.</p>

                <form onSubmit={handleTrack} className="track-form">
                    <input
                        type="text"
                        placeholder="Enter Order ID"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Tracking...' : 'Track Status'}
                    </button>
                </form>

                {error && <div className="error-message">{error}</div>}

                {status && (
                    <div className="track-result fade-in">
                        <div className="result-header">
                            <span className="status-label">Status:</span>
                            <span className={`status-value ${status.state.toLowerCase()}`}>{status.state}</span>
                        </div>
                        <div className="result-details">
                            <p><strong>Order ID:</strong> {status.id}</p>
                            <p><strong>Last Update:</strong> {status.date}</p>
                            <p><strong>Total Amount:</strong> ₹{status.details.total_amount}</p>
                        </div>
                        <div className="status-timeline">
                            <div className={getTimelineClass('Pending')}>Order Placed</div>
                            <div className={getTimelineClass('Processing')}>Processing</div>
                            <div className={getTimelineClass('Shipped')}>Shipped</div>
                            <div className={getTimelineClass('Delivered')}>Delivered</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrder;
