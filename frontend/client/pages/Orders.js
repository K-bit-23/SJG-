import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import { Package, Clock, Download, FileText, Truck, Search, ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../../src/utils/api';
import AccountLayout from '../../src/components/AccountLayout';

const Orders = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!user) return;

        const fetchOrders = async () => {
            try {
                const userEmail = user.emailAddresses ? user.emailAddresses[0].emailAddress : user.email;
                if (!userEmail) return;

                const res = await api.get(`/user-orders/${encodeURIComponent(userEmail)}/`);
                setOrders(res.data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': 
            case 'delivered': return 'text-emerald-600 bg-emerald-50 border border-emerald-100';
            case 'processing': return 'text-indigo-600 bg-indigo-50 border border-indigo-100';
            case 'shipped': return 'text-purple-600 bg-purple-50 border border-purple-100';
            case 'cancelled': return 'text-rose-600 bg-rose-50 border border-rose-100';
            default: return 'text-amber-600 bg-amber-50 border border-amber-100';
        }
    };

    const downloadInvoice = async (order) => {
        try {
            const orderId = order.order_id || order.id || 'ORDER';
            // Use the new backend endpoint for premium ReportLab PDF
            const response = await api.get(`/orders/${orderId}/invoice/`, {
                responseType: 'blob'
            });
            
            // Create a blob from the response data
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice_${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download invoice:", error);
            alert("Could not retrieve the invoice. Please try again later.");
        }
    };

    const filteredOrders = orders.filter(o => 
        (o.order_id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.items?.some(i => (i.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <AccountLayout>
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Retrieving Order Archive...</p>
            </div>
        </AccountLayout>
    );

    return (
        <AccountLayout>
            <div className="space-y-8 pb-20">
                {/* Header Section */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-indigo-100/50 p-8 md:p-10 border border-indigo-50 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <Package className="text-indigo-600" size={32} />
                                    Order Archive
                                </h1>
                                <p className="text-slate-500 font-bold mt-2">Manage and track your stationery collection</p>
                            </div>
                            
                            <div className="relative max-w-sm w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search order ID or items..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all placeholder:text-slate-300"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders Grid */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-20 text-center border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag size={40} className="text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">No Records Found</h3>
                        <p className="text-slate-400 font-bold mb-8">You haven't placed any orders yet, or your search didn't match anything.</p>
                        <button 
                            onClick={() => navigate('/products')}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100"
                        >
                            Explore Collection <ArrowRight size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredOrders.map((order) => (
                            <div key={order.id || order.order_id} className="bg-white rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-indigo-50 transition-all duration-500 border border-gray-100 overflow-hidden group">
                                <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8">
                                    {/* Order Meta */}
                                    <div className="lg:w-1/4 space-y-4">
                                        <div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Order Identifier</span>
                                            <h4 className="text-lg font-black text-slate-900 truncate">#{order.order_id || order.id.substring(0, 8).toUpperCase()}</h4>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                                                {order.status || 'Processing'}
                                            </span>
                                        </div>

                                        <div className="space-y-2 pt-2 border-t border-slate-50">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                <Clock size={14} /> {new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                                <ShoppingBag size={14} className="text-indigo-600" /> {order.items?.length || 0} Items
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items Preview */}
                                    <div className="lg:w-2/4 bg-slate-50 rounded-3xl p-6 space-y-3">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                            <FileText size={12} /> Registry of Items
                                        </span>
                                        <div className="max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center py-2 border-b border-indigo-100 last:border-0 group-hover:bg-white/50 transition-colors">
                                                    <span className="text-sm font-bold text-slate-700 truncate pr-4">{item.product_name}</span>
                                                    <span className="text-xs font-black text-slate-400 tabular-nums">x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="pt-3 flex justify-between items-center border-t border-indigo-200">
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Aggregate Total</span>
                                            <span className="text-xl font-black text-indigo-600 tracking-tight">₹{order.total_amount}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="lg:w-1/4 flex flex-col gap-3 justify-center">
                                        <button 
                                            onClick={() => navigate(`/track-order/${order.order_id || order.id}`)}
                                            className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-600 shadow-lg shadow-slate-100 hover:shadow-indigo-100 transition-all"
                                        >
                                            <Truck size={16} /> Track Logistics
                                        </button>
                                        <button 
                                            onClick={() => downloadInvoice(order)}
                                            className="w-full py-4 bg-white text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
                                        >
                                            <Download size={16} className="text-indigo-600" /> Archive PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}} />
        </AccountLayout>
    );
};

export default Orders;
