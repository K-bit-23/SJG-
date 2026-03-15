import React, { useState, useEffect } from 'react';
import { BarChart2, PieChart, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Activity, Users, Clock, RefreshCw } from 'lucide-react';
import api from '../../src/utils/api';

const AdminBusiness = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        kpis: [],
        bars: [],
        categories: [],
        transactions: []
    });

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const [statsRes, ordersRes] = await Promise.all([
                    api.get('dashboard/stats/'),
                    api.get('orders/')
                ]);

                const stats = statsRes.data;
                const orders = ordersRes.data;

                // 1. Prepare KPIs
                const kpis = [
                    { label: 'Total Revenue', value: `₹${stats.total_revenue.toLocaleString()}`, change: '+100%', up: true, icon: DollarSign, color: 'blue' },
                    { label: 'Total Orders', value: stats.active_orders, change: '+100%', up: true, icon: ShoppingCart, color: 'purple' },
                    { label: 'Avg. Order Value', value: `₹${(stats.total_revenue / (stats.active_orders || 1)).toFixed(0)}`, change: 'Live', up: true, icon: TrendingUp, color: 'orange' },
                    { label: 'Active Support', value: stats.total_messages, change: 'Messages', up: true, icon: Activity, color: 'green' },
                ];

                // 2. Prepare Bars (Revenue Trend)
                const bars = stats.monthly_revenue.map(m => ({
                    month: m.month,
                    val: (m.amount / (stats.total_revenue || 1)) * 100,
                    amount: `₹${m.amount.toLocaleString()}`
                }));

                // 3. Prepare Categories
                const categories = stats.category_breakdown.map(c => ({
                    name: c.name,
                    percentage: (c.revenue / (stats.total_revenue || 1)) * 100,
                    color: `bg-${['blue', 'purple', 'pink', 'orange', 'teal'][Math.floor(Math.random() * 5)]}-500`,
                    sales: `₹${c.revenue.toLocaleString()}`
                }));

                // 4. Latest Transactions
                const transactions = orders.slice(0, 5).map(o => ({
                    id: `#${o.order_id.split('-').pop()}`,
                    user: o.user_name || 'Guest',
                    date: new Date(o.created_at).toLocaleDateString(),
                    amt: `₹${o.total_amount.toLocaleString()}`,
                    status: o.status.charAt(0).toUpperCase() + o.status.slice(1)
                }));

                setData({ kpis, bars, categories, transactions });
            } catch (err) {
                console.error("Failed to fetch analysis:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, []);

    const colorMap = { blue: 'bg-blue-500 text-blue-50 border-blue-500', purple: 'bg-purple-500 text-purple-50 border-purple-500', orange: 'bg-orange-500 text-orange-50 border-orange-500', green: 'bg-green-500 text-green-50 border-green-500' };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <RefreshCw className="animate-spin text-secondary" size={48} />
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.kpis.map((k, i) => (
                    <div key={i} className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${colorMap[k.color]?.split(' ')[2]} hover:shadow-md transition-all`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{k.label}</p>
                                <h3 className="text-2xl font-black text-slate-800 mt-1">{k.value}</h3>
                            </div>
                            <div className={`p-3 bg-slate-50 text-${k.color}-500 rounded-xl shadow-inner`}><k.icon size={20} /></div>
                        </div>
                        <div className={`flex items-center text-xs font-bold ${k.up ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {k.up ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                            {k.change} <span className="text-gray-400 font-medium ml-2">Analytics Data</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Bar Chart */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-50">
                    <h3 className="text-lg font-black mb-8 flex items-center gap-2 text-slate-800"><BarChart2 size={20} className="text-secondary" /> REVENUE FLOW</h3>
                    <div className="h-64 flex items-end justify-between gap-4 px-2">
                        {data.bars.length > 0 ? data.bars.map((b, i) => (
                            <div key={i} className="flex flex-col items-center gap-3 group w-full">
                                <div className="relative w-full bg-slate-50 rounded-2xl overflow-hidden h-48 flex items-end">
                                    <div className="w-full bg-gradient-to-t from-secondary to-indigo-400 hover:to-indigo-300 transition-all duration-700 rounded-t-xl relative group-hover:shadow-xl shadow-indigo-500/20" style={{ height: `${Math.max(b.val, 5)}%` }}>
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-xl whitespace-nowrap z-10">{b.amount}</div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{b.month}</span>
                            </div>
                        )) : (
                            <div className="w-full flex items-center justify-center text-gray-400 italic">Insufficient data for trend</div>
                        )}
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-50">
                    <h3 className="text-lg font-black mb-8 flex items-center gap-2 text-slate-800"><PieChart size={20} className="text-secondary" /> INVENTORY SEGMENTS</h3>
                    <div className="space-y-6">
                        {data.categories.length > 0 ? data.categories.map((c, i) => (
                            <div key={i} className="group">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-slate-700">{c.name}</span>
                                    <span className="text-sm font-black text-secondary">{c.sales}</span>
                                </div>
                                <div className="w-full bg-slate-50 rounded-full h-3 overflow-hidden border border-gray-100">
                                    <div className={`h-full rounded-full ${c.color} transition-all duration-1000 shadow-sm`} style={{ width: `${c.percentage}%` }} />
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-gray-400">No category data found</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Transactions + Customer Insights */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Recent Ledger Entries</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5">TX ID</th>
                                <th className="px-8 py-5">Merchant Name</th>
                                <th className="px-8 py-5">Timestamp</th>
                                <th className="px-8 py-5 text-right">Credit Amount</th>
                                <th className="px-8 py-5 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-50">
                            {data.transactions.map((t, i) => (
                                <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                                    <td className="px-8 py-5 font-black text-secondary">{t.id}</td>
                                    <td className="px-8 py-5 font-bold text-slate-700">{t.user}</td>
                                    <td className="px-8 py-5 text-slate-500 font-medium">{t.date}</td>
                                    <td className="px-8 py-5 text-right font-black shadow-inner bg-slate-50/30">
                                        <span className="text-indigo-600">{t.amt}</span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                            t.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                                            t.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                        }`}>
                                            {t.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminBusiness;
