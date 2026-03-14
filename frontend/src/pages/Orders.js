import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    Package, Clock, CheckCircle, ChevronRight, Search, 
    Filter, Calendar, IndianRupee, Truck, AlertCircle, ShoppingBag
} from 'lucide-react';

const Orders = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        const fetchOrders = async () => {
            try {
                const res = await axios.get(`/api/orders/?user_email=${user.email}`);
                setOrders(res.data);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, navigate]);

    const statusColors = {
        'Pending': 'bg-amber-100 text-amber-600',
        'Processing': 'bg-blue-100 text-blue-600',
        'Shipped': 'bg-indigo-100 text-indigo-600',
        'Delivered': 'bg-emerald-100 text-emerald-600',
        'Cancelled': 'bg-red-100 text-red-600'
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             order.items?.some(item => item.product_name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = activeFilter === 'All' || order.status === activeFilter;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Fetching your history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pt-20 pb-12 px-4 lg:px-8">
            <div className="max-w-6xl mx-auto">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 animate-fade-in">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                <ShoppingBag size={24} />
                             </div>
                             <nav className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <span>Home</span> <ChevronRight size={10} /> <span className="text-primary">Order History</span>
                             </nav>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Orders</h1>
                        <p className="text-gray-500 mt-2 font-medium">Tracking and managing your recent purchases</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                            <input 
                                type="text"
                                placeholder="Search by Order ID or Product..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 ring-primary/5 outline-none w-full md:w-64 transition-all"
                            />
                        </div>
                        
                        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                            {['All', 'Delivered', 'Pending'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${activeFilter === filter ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Orders Content */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-20 text-center shadow-sm border border-gray-100 animate-fade-in">
                        <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">No orders found</h3>
                        <p className="text-gray-500 mt-2 max-w-md mx-auto">We couldn't find any orders matching your current search or filter criteria.</p>
                        <button 
                            onClick={() => {setSearchTerm(''); setActiveFilter('All');}}
                            className="mt-8 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredOrders.map((order, index) => (
                            <div 
                                key={order.id} 
                                className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 overflow-hidden animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Order Status Header */}
                                <div className="p-6 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Reference</span>
                                            <span className="text-sm font-mono font-bold text-gray-700">#{order.id.slice(-8).toUpperCase()}</span>
                                        </div>
                                        <div className="h-8 w-[1px] bg-gray-100"></div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Placed On</span>
                                            <span className="text-sm font-bold text-gray-700">{new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {order.status}
                                        </span>
                                        <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                                            <AlertCircle size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-6 flex flex-col md:flex-row gap-8">
                                    <div className="flex-1 space-y-4">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="flex gap-4 items-center group/item">
                                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center p-2 relative overflow-hidden">
                                                    <img 
                                                        src={item.image_url || '/placeholder-product.png'} 
                                                        alt={item.product_name}
                                                        className="w-full h-full object-contain mix-blend-multiply group-hover/item:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-bold text-gray-800 group-hover/item:text-primary transition-colors">{item.product_name}</h4>
                                                    <p className="text-xs text-gray-500 font-medium">Qty: {item.quantity} · ₹{item.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="md:w-64 bg-gray-50/50 rounded-2xl p-6 border border-gray-100/50 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Amount</span>
                                                <Truck size={14} className="text-gray-400" />
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                                <IndianRupee size={16} className="text-primary font-bold" />
                                                <span className="text-2xl font-black text-gray-900 tracking-tighter">{order.total_amount}</span>
                                            </div>
                                        </div>

                                        <button className="w-full mt-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
