import React from 'react';
import { Package, Users, DollarSign, Box, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = ({ stats, orders, getStatusBadge }) => {
    const statCards = [
        { title: "Total Revenue", value: `₹${stats.total_revenue}`, icon: DollarSign, color: "bg-blue-500", target: "/admin/business" },
        { title: "Active Orders", value: stats.active_orders, icon: Package, color: "bg-orange-500", target: "/admin/orders" },
        { title: "Customers", value: stats.customers_count, icon: Users, color: "bg-green-500", target: "/admin/users" },
        { title: "Products", value: stats.products_count, icon: Box, color: "bg-purple-500", target: "/admin/inventory" }
    ];

    return (
        <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <Link key={idx} to={stat.target} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer block border border-transparent hover:border-indigo-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.color} text-white shadow-lg shadow-${stat.color.split('-')[1]}-500/20`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
                        </div>
                        <h3 className="text-gray-500 font-medium">{stat.title}</h3>
                    </Link>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-secondary" /> Recent Orders
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-gray-600 text-sm">
                            <tr>
                                <th className="p-3 text-left">Order ID</th>
                                <th className="p-3 text-left">Customer</th>
                                <th className="p-3 text-left">Delivery</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {Array.isArray(orders) && orders.slice(0, 5).map(order => (
                                <tr key={order.order_id} className="hover:bg-gray-50">
                                    <td className="p-3 font-medium text-secondary">
                                        <Link to="/admin/orders" className="hover:underline">
                                            {order.order_id}
                                        </Link>
                                    </td>
                                    <td className="p-3">{order.user_name}</td>
                                    <td className="p-3 text-xs font-bold text-indigo-600">{order.delivery_date || 'N/A'}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadge(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right font-bold">₹{order.total_amount}</td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr><td colSpan="4" className="p-8 text-center text-gray-400">No orders yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
