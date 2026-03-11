import React from 'react';
import { BarChart2, PieChart, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Activity, Users, Clock, RefreshCw } from 'lucide-react';

const AdminBusiness = () => {
    const kpis = [
        { label: 'Monthly Revenue', value: '₹45,250', change: '+12.5%', up: true, icon: DollarSign, color: 'blue' },
        { label: 'Total Orders', value: '1,254', change: '+8.2%', up: true, icon: ShoppingCart, color: 'purple' },
        { label: 'Avg. Order Value', value: '₹350', change: '-2.4%', up: false, icon: TrendingUp, color: 'orange' },
        { label: 'Conversion Rate', value: '3.8%', change: '+1.2%', up: true, icon: Activity, color: 'green' },
    ];
    const colorMap = { blue: 'bg-blue-500 text-blue-50 border-blue-500', purple: 'bg-purple-500 text-purple-50 border-purple-500', orange: 'bg-orange-500 text-orange-50 border-orange-500', green: 'bg-green-500 text-green-50 border-green-500' };

    const bars = [
        { month: 'Aug', val: 30, amount: '₹30k' }, { month: 'Sep', val: 45, amount: '₹45k' },
        { month: 'Oct', val: 35, amount: '₹35k' }, { month: 'Nov', val: 60, amount: '₹60k' },
        { month: 'Dec', val: 80, amount: '₹80k' }, { month: 'Jan', val: 65, amount: '₹65k' },
    ];
    const categories = [
        { name: 'Notebooks & Paper', percentage: 45, color: 'bg-blue-500', sales: '₹22,400' },
        { name: 'Office Supplies', percentage: 25, color: 'bg-purple-500', sales: '₹12,450' },
        { name: 'Art Supplies', percentage: 20, color: 'bg-pink-500', sales: '₹9,800' },
        { name: 'Tech Accessories', percentage: 10, color: 'bg-orange-500', sales: '₹4,500' },
    ];
    const transactions = [
        { id: '#TRX-9821', user: 'Rahul Kumar', date: '06 Feb, 2026', amt: '₹1,250', status: 'Completed' },
        { id: '#TRX-9820', user: 'Priya Sharma', date: '06 Feb, 2026', amt: '₹450', status: 'Pending' },
        { id: '#TRX-9819', user: 'Amit Singh', date: '05 Feb, 2026', amt: '₹2,100', status: 'Completed' },
        { id: '#TRX-9818', user: 'Sneha Gupta', date: '05 Feb, 2026', amt: '₹890', status: 'Failed' },
    ];

    return (
        <div className="space-y-8">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((k, i) => (
                    <div key={i} className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${colorMap[k.color].split(' ')[2]}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">{k.label}</p>
                                <h3 className="text-2xl font-bold text-gray-800 mt-1">{k.value}</h3>
                            </div>
                            <div className={`p-2 bg-${k.color}-50 text-${k.color}-500 rounded-lg`}><k.icon size={20} /></div>
                        </div>
                        <div className={`flex items-center text-sm font-medium ${k.up ? 'text-green-500' : 'text-red-500'}`}>
                            {k.up ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                            {k.change} <span className="text-gray-400 font-normal ml-2">vs last month</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Bar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><BarChart2 size={20} className="text-secondary" /> Revenue Trend (Last 6 Months)</h3>
                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                        {bars.map((b, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 group w-full">
                                <div className="relative w-full bg-gray-100 rounded-t-lg overflow-hidden h-48 flex items-end">
                                    <div className="w-full bg-secondary hover:bg-indigo-600 transition-all duration-500 rounded-t-lg relative group-hover:shadow-lg" style={{ height: `${b.val}%` }}>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{b.amount}</div>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-gray-500">{b.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><PieChart size={20} className="text-secondary" /> Top Categories Performance</h3>
                    <div className="space-y-5">
                        {categories.map((c, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-sm font-medium text-gray-700">{c.name}</span>
                                    <span className="text-sm font-bold text-gray-900">{c.sales}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                    <div className={`h-2.5 rounded-full ${c.color} transition-all duration-1000`} style={{ width: `${c.percentage}%` }} />
                                </div>
                                <div className="text-right mt-1"><span className="text-xs text-gray-500">{c.percentage}% of total sales</span></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transactions + Customer Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold mb-4">Latest Transactions</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="p-3 text-left">Transaction ID</th>
                                    <th className="p-3 text-left">Customer</th>
                                    <th className="p-3 text-left">Date</th>
                                    <th className="p-3 text-right">Amount</th>
                                    <th className="p-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y">
                                {transactions.map((t, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="p-3 font-medium text-gray-700">{t.id}</td>
                                        <td className="p-3">{t.user}</td>
                                        <td className="p-3 text-gray-500">{t.date}</td>
                                        <td className="p-3 text-right font-bold">{t.amt}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${t.status === 'Completed' ? 'bg-green-100 text-green-700' : t.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold mb-4">Customer Insights</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'New Customers', value: '145', sub: '+12 this week', icon: Users, color: 'blue', up: true },
                            { label: 'Avg. Session', value: '4m 32s', sub: '+25s vs last week', icon: Clock, color: 'purple', up: true },
                            { label: 'Return Rate', value: '2.4%', sub: '-0.5% vs last week', icon: RefreshCw, color: 'orange', up: false },
                        ].map((ins, i) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 bg-${ins.color}-100 text-${ins.color}-600 rounded-full`}><ins.icon size={16} /></div>
                                    <h4 className="font-bold text-sm">{ins.label}</h4>
                                </div>
                                <p className="text-2xl font-bold">{ins.value}</p>
                                <p className={`text-xs flex items-center mt-1 ${ins.up ? 'text-green-500' : 'text-red-500'}`}>
                                    {ins.up ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />} {ins.sub}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBusiness;
