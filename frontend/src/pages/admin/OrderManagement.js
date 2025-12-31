import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import './OrderManagement.css';

const OrderManagement = () => {
    const { orders, updateOrderStatus } = useOrders();
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleStatusChange = (orderId, newStatus) => {
        updateOrderStatus(orderId, newStatus);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'status-pending';
            case 'Processing': return 'status-processing';
            case 'Shipped': return 'status-shipped';
            case 'Delivered': return 'status-delivered';
            default: return '';
        }
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Order Management</h1>
            </div>

            <div className="filters-bar">
                <div className="search-bar">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search by Order ID or Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="status-filter">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                    </select>
                </div>
            </div>

            <div className="orders-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <tr key={order.id}>
                                <td className="order-id">{order.id}</td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div className="customer-info">
                                        <span className="customer-name">{order.customerName || 'Guest'}</span>
                                        <span className="customer-email">{order.customerEmail}</span>
                                    </div>
                                </td>
                                <td className="order-total">${order.total.toFixed(2)}</td>
                                <td>
                                    <select
                                        className={`status-select ${getStatusColor(order.status)}`}
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                    </select>
                                </td>
                                <td>
                                    <button
                                        className="btn-view"
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <i className="fas fa-eye"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedOrder && (
                <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-content order-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Order Details - {selectedOrder.id}</h2>
                            <button className="btn-close" onClick={() => setSelectedOrder(null)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="order-details-grid">
                            <div className="order-section">
                                <h3>Customer Information</h3>
                                <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                                <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                                <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                                <p><strong>Address:</strong> {selectedOrder.address}</p>
                            </div>

                            <div className="order-section">
                                <h3>Order Summary</h3>
                                <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                <p><strong>Status:</strong> <span className={`status-badge ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span></p>
                                <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                            </div>
                        </div>

                        <div className="order-items">
                            <h3>Items</h3>
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div className="item-info">
                                                    <img src={item.image} alt={item.name} className="item-thumb" />
                                                    <span>{item.name}</span>
                                                </div>
                                            </td>
                                            <td>${item.price.toFixed(2)}</td>
                                            <td>{item.quantity}</td>
                                            <td>${(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="3" className="text-right"><strong>Total Amount:</strong></td>
                                        <td className="total-amount">${selectedOrder.total.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;
