import React from 'react';
import { Package, Users, DollarSign, Box, TrendingUp, Truck, ShoppingCart, Percent, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = ({ stats, orders }) => {
    const statusStyles = {
        pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
        processing: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
        shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
        completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
        cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
    };

    const statCards = [
        { 
            title: "Global Revenue", 
            value: `₹${parseFloat(stats.total_revenue || 0).toLocaleString()}`, 
            icon: DollarSign, 
            color: "from-blue-600 to-indigo-600", 
            target: "/admin/business",
            trend: "+12.5%",
            desc: "Net system turnover"
        },
        { 
            title: "Pending Pipeline", 
            value: stats.non_delivered_orders || 0, 
            icon: Package, 
            color: "from-amber-500 to-orange-500", 
            target: "/admin/orders",
            trend: "Active",
            desc: "In-progress fulfillment"
        },
        { 
            title: "Nodes Fulfilled", 
            value: stats.delivered_orders || 0, 
            icon: Truck, 
            color: "from-emerald-500 to-teal-500", 
            target: "/admin/orders?status=completed",
            trend: "Secure",
            desc: "Successfully delivered"
        },
        { 
            title: "Entity Count", 
            value: stats.customers_count || 0, 
            icon: Users, 
            color: "from-purple-600 to-fuchsia-600", 
            target: "/admin/users",
            trend: "+4.2%",
            desc: "Registered user profiles"
        }
    ];

    return (
        <div className="space-y-10">
            {/* Action Banner */}
            <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-2xl group border border-white/5">
                <div className="absolute right-0 top-0 w-1/3 h-full bg-indigo-600/20 blur-[100px] rounded-full group-hover:bg-indigo-600/30 transition-all duration-700"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                            <Percent size={28} className="text-white" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-white tracking-tight">Compliance & Logistics Monitor</h4>
                            <p className="text-slate-400 text-sm font-medium mt-1">Cross-check tax segments and GST compliance protocols daily for accurate fiscal reconciliation.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <a 
                            href="https://www.gst.gov.in/" 
                            target="_blank" 
                            rel="noreferrer" 
                            className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
                        >
                            Open Portal
                        </a>
                        <Link 
                            to="/admin/settings" 
                            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/20"
                        >
                            Update Config
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {statCards.map((stat, idx) => (
                    <Link 
                        key={idx} 
                        to={stat.target} 
                        className="bg-white dark:bg-[#0f172a] p-8 rounded-[2.25rem] shadow-sm border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500 group"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} p-4 text-white shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500`}>
                                <stat.icon size={24} />
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${stat.trend.includes('+') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-slate-100 text-slate-500 dark:bg-white/5'}`}>
                                    {stat.trend}
                                </span>
                            </div>
                        </div>
                        <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{stat.title}</h3>
                        <div className="text-3xl font-black text-slate-900 dark:text-white mono tracking-tighter tabular-nums mb-1">{stat.value}</div>
                        <p className="text-[10px] font-bold text-slate-400 italic mt-2">{stat.desc}</p>
                    </Link>
                ))}
            </div>

            {/* Recent Table */}
            <div className="bg-white dark:bg-[#0f172a] rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
                <div className="p-8 border-b border-slate-50 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                            <TrendingUp size={20} className="text-indigo-600" /> 
                            Pipeline Telemetry
                        </h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Live Order Ingress_Stream</p>
                    </div>
                    <Link to="/admin/orders" className="text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">Observe All</Link>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest text-left">
                            <tr>
                                <th className="px-8 py-5">Signal ID</th>
                                <th className="px-8 py-5">Originator</th>
                                <th className="px-8 py-5">ETA Node</th>
                                <th className="px-8 py-5 text-center">Protocol State</th>
                                <th className="px-8 py-5 text-right">Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                            {Array.isArray(orders) && orders.slice(0, 8).map(order => (
                                <tr key={order.order_id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:animate-pulse"></div>
                                            <span className="text-xs font-black text-indigo-600 mono">{order.order_id.split('-').pop() || '#' + order.order_id.slice(-6).toUpperCase()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{order.user_name}</p>
                                        <p className="text-[10px] text-slate-400 italic">{order.user_email || 'Guest Profile'}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-200">
                                            <Truck size={12} className="text-slate-400" />
                                            {order.delivery_date || 'Awaiting TBC'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${statusStyles[order.status] || statusStyles.pending}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className="text-base font-black text-slate-900 dark:text-white mono tracking-tighter">₹{order.total_amount?.toLocaleString()}</span>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Finalized</div>
                                    </td>
                                </tr>
                            ))}
                            {(!orders || orders.length === 0) && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4 grayscale opacity-40">
                                            <ShoppingCart size={32} />
                                        </div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Quiet Pipeline. Awaiting Ingress.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
