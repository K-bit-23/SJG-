import React from 'react';
import { Eye } from 'lucide-react';

const AdminOrders = ({ orders, getStatusBadge, updateOrderStatus }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold mb-6">Order Management</h3>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 text-gray-600 text-sm">
                        <tr>
                            <th className="p-3 text-left">Order ID</th>
                            <th className="p-3 text-left">Date/Time</th>
                            <th className="p-3 text-left">Delivery Date</th>
                            <th className="p-3 text-left">Customer</th>
                            <th className="p-3 text-left">Items</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Amount</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {orders.map(order => (
                            <tr key={order.order_id} className="hover:bg-gray-50">
                                <td className="p-3 font-medium text-secondary">{order.order_id}</td>
                                <td className="p-3 text-xs text-gray-500">
                                    {order.created_at ? new Date(order.created_at).toLocaleString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : 'N/A'}
                                </td>
                                <td className="p-3">
                                    <div className="text-xs font-bold text-indigo-600">{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'Not Set'}</div>
                                </td>
                                <td className="p-3">
                                    <div>{order.user_name}</div>
                                    <div className="text-xs text-gray-500">{order.user_email}</div>
                                </td>
                                <td className="p-3">{order.items?.length || 0} items</td>
                                <td className="p-3">
                                    <select
                                        value={order.status}
                                        onChange={(e) => updateOrderStatus(order.order_id, e.target.value)}
                                        className={`px-2 py-1 rounded text-xs font-bold border-0 ${getStatusBadge(order.status)}`}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td className="p-3 font-bold">₹{order.total_amount}</td>
                                <td className="p-3 text-right">
                                    <button className="p-2 hover:bg-gray-100 rounded text-gray-500"><Eye size={16} /></button>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr><td colSpan="7" className="p-8 text-center text-gray-400">No orders found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrders;
