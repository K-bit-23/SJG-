import React, { useState } from 'react';
import './TrackOrder.css';

const TrackOrder = () => {
    const [orderId, setOrderId] = useState('');
    const [status, setStatus] = useState(null);

    const handleTrack = (e) => {
        e.preventDefault();
        // Mock tracking logic
        if (orderId.trim()) {
            setStatus({
                id: orderId,
                state: 'Shipped',
                location: 'Distribution Center, Mumbai',
                date: new Date().toLocaleDateString()
            });
        }
    };

    return (
        <div className="track-order-page">
            <div className="track-order-container">
                <h2>Track Your Order</h2>
                <p>Enter your Order ID to see the current status.</p>

                <form onSubmit={handleTrack} className="track-form">
                    <input
                        type="text"
                        placeholder="e.g., OD123456789"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        required
                    />
                    <button type="submit">Track Status</button>
                </form>

                {status && (
                    <div className="track-result">
                        <div className="result-header">
                            <span className="status-label">Status:</span>
                            <span className="status-value">{status.state}</span>
                        </div>
                        <div className="result-details">
                            <p><strong>Order ID:</strong> {status.id}</p>
                            <p><strong>Current Location:</strong> {status.location}</p>
                            <p><strong>Last Update:</strong> {status.date}</p>
                        </div>
                        <div className="status-timeline">
                            <div className="timeline-step completed">Order Placed</div>
                            <div className="timeline-step completed">Packed</div>
                            <div className="timeline-step active">Shipped</div>
                            <div className="timeline-step">Delivered</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrder;
