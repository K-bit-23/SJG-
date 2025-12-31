import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import './CustomerManagement.css';

const CustomerManagement = () => {
    const { orders } = useOrders();
    const [searchTerm, setSearchTerm] = useState('');

    // Group orders by customer email to create customer list
    const customers = Object.values(orders.reduce((acc, order) => {
        if (!acc[order.customerEmail]) {
            acc[order.customerEmail] = {
                id: order.customerEmail, // Using email as ID for now
                name: order.customerName || 'Guest',
                email: order.customerEmail,
                phone: order.phone,
                totalOrders: 0,
                totalSpent: 0,
                lastOrderDate: order.createdAt,
                orders: []
            };
        }

        acc[order.customerEmail].totalOrders += 1;
        acc[order.customerEmail].totalSpent += order.total;
        acc[order.customerEmail].orders.push(order);

        if (new Date(order.createdAt) > new Date(acc[order.customerEmail].lastOrderDate)) {
            acc[order.customerEmail].lastOrderDate = order.createdAt;
        }

        return acc;
    }, {}));

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Customer Management</h1>
            </div>

            <div className="search-bar">
                <i className="fas fa-search"></i>
                <input
                    type="text"
                    placeholder="Search customers by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="customers-grid">
                {filteredCustomers.map(customer => (
                    <div key={customer.id} className="customer-card">
                        <div className="customer-header">
                            <div className="customer-avatar">
                                {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="customer-info">
                                <h3>{customer.name}</h3>
                                <p>{customer.email}</p>
                            </div>
                        </div>

                        <div className="customer-stats">
                            <div className="stat">
                                <span className="label">Total Orders</span>
                                <span className="value">{customer.totalOrders}</span>
                            </div>
                            <div className="stat">
                                <span className="label">Total Spent</span>
                                <span className="value">${customer.totalSpent.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="customer-details">
                            <p><i className="fas fa-phone"></i> {customer.phone || 'N/A'}</p>
                            <p><i className="fas fa-clock"></i> Last Order: {new Date(customer.lastOrderDate).toLocaleDateString()}</p>
                        </div>

                        <button className="btn-view-history">
                            View Order History
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CustomerManagement;
