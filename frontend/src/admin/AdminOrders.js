import React from 'react';
import { Eye } from 'lucide-react';

const AdminOrders = ({ orders, getStatusBadge, updateOrderStatus }) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('All');

    const filteredOrders = orders.filter(o => {
        const matchesSearch = (o.order_id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (o.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (o.user_email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Order Management</h3>
                    <p className="text-sm text-gray-500">Track and manage customer orders</p>
                </div>
                
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        placeholder="Search ID, Name, Email…" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 ring-secondary/20 outline-none w-64"
                    />
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 ring-secondary/20 outline-none cursor-pointer"
                    >
                        <option value="All">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/80 text-gray-500 text-[10px] font-bold uppercase tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-left">Order ID</th>
                                <th className="p-4 text-left">Date/Time</th>
                                <th className="p-4 text-left">Customer</th>
                                <th className="p-4 text-left">Items</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-left">Amount</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredOrders.map(order => (
                                <tr key={order.order_id} className="hover:bg-blue-50/20 transition-colors">
                                    <td className="p-4 font-bold text-secondary text-sm">#{order.order_id}</td>
                                    <td className="p-4 text-xs text-gray-500">
                                        <div className="font-medium text-gray-700">
                                            {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : 'N/A'}
                                        </div>
                                        <div className="text-[10px]">
                                            {order.created_at ? new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800 text-sm">{order.user_name}</div>
                                        <div className="text-xs text-gray-400">{order.user_email}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">
                                            {order.items?.length || 0} ITEMS
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order.order_id, e.target.value)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border-0 cursor-pointer ${getStatusBadge(order.status)} shadow-sm transition-transform active:scale-95`}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td className="p-4 font-extrabold text-gray-900">₹{order.total_amount}</td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-secondary transition-all" title="View Details">
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredOrders.length === 0 && (
                    <div className="p-20 text-center text-gray-400">
                        <div className="mb-2">📦</div>
                        <p className="font-medium">No orders found matching your criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
