import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Truck, CheckCircle, Package, Clock, ShieldCheck, ArrowLeft, MapPin } from 'lucide-react';
import api from '../../src/utils/api';

const OrderTracking = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const steps = [
        { status: 'pending', label: 'Order Placed', icon: Clock, color: 'bg-yellow-500' },
        { status: 'processing', label: 'Processing', icon: Package, color: 'bg-blue-500' },
        { status: 'shipped', label: 'On the Way', icon: Truck, color: 'bg-purple-500' },
        { status: 'completed', label: 'Delivered', icon: CheckCircle, color: 'bg-green-500' }
    ];

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // The backend has /orders/<id>/ maybe? Let's check api/urls.py
                const res = await api.get(`/orders/${orderId}/`);
                setOrder(res.data);
            } catch (error) {
                console.error("Error fetching order:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
        // Set up polling for real-time updates
        const interval = setInterval(fetchOrder, 10000);
        return () => clearInterval(interval);
    }, [orderId]);

    const getCurrentStep = () => {
        if (!order) return 0;
        const status = order.status?.toLowerCase();
        if (status === 'completed' || status === 'delivered') return 3;
        if (status === 'shipped') return 2;
        if (status === 'processing') return 1;
        return 0;
    };

    const currentStep = getCurrentStep();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (!order) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
            <Package size={64} className="text-slate-300 mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Order Not Found</h1>
            <p className="text-slate-500 mb-6">We couldn't find the order you're looking for.</p>
            <button onClick={() => navigate('/orders')} className="bg-primary text-white px-6 py-3 rounded-xl font-bold">Go Back to Orders</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header Actions */}
                <button 
                    onClick={() => navigate('/orders')}
                    className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold mb-6 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Orders
                </button>

                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 md:p-12">
                    {/* Header Info */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-100 pb-8">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tracking Number</p>
                            <h1 className="text-3xl font-black text-slate-800">#{order.order_id || orderId}</h1>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Delivery</p>
                            <p className="text-xl font-bold text-slate-700">
                                {new Date(new Date(order.created_at).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    {/* Truck Track Animation */}
                    <div className="relative mb-20 px-4">
                        {/* Track Line */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full"></div>
                        
                        {/* Progress Line */}
                        <div 
                            className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-1000 ease-in-out"
                            style={{ width: `${(currentStep / 3) * 100}%` }}
                        ></div>

                        {/* Moving Truck */}
                        <div 
                            className="absolute top-1/2 -translate-y-[80%] -translate-x-1/2 transition-all duration-1000 ease-in-out z-20"
                            style={{ left: `${(currentStep / 3) * 100}%` }}
                        >
                            <div className="relative">
                                <div className="bg-primary text-white p-2.5 rounded-xl shadow-lg shadow-blue-200">
                                    <Truck size={24} className="animate-pulse" />
                                </div>
                                {/* Floating Tooltip */}
                                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-bold">
                                    On the move!
                                </div>
                            </div>
                        </div>

                        {/* Status Dots */}
                        <div className="flex justify-between relative z-10">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = index <= currentStep;
                                const isCompleted = index < currentStep;

                                return (
                                    <div key={index} className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                                            isActive ? `${step.color} text-white shadow-lg` : 'bg-white border-2 border-slate-100 text-slate-300'
                                        }`}>
                                            {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                                        </div>
                                        <p className={`mt-3 text-xs font-bold whitespace-nowrap ${isActive ? 'text-slate-800' : 'text-slate-300'}`}>
                                            {step.label}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                        {/* Shipping Address */}
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <MapPin size={16} /> Shipping Address
                            </h3>
                            <p className="text-slate-700 font-medium leading-relaxed">
                                {order.shipping_address}
                            </p>
                        </div>

                        {/* Order Summary Summary */}
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Package size={16} /> Order Overview
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Status</span>
                                    <span className={`font-bold px-3 py-1 rounded-full text-[10px] tracking-wider uppercase ${
                                        order.status === 'completed' ? 'bg-green-100 text-green-600' :
                                        order.status === 'shipped' ? 'bg-purple-100 text-purple-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>
                                        {order.status || 'Pending'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Items</span>
                                    <span className="text-slate-800 font-bold">{order.items?.length || 0} Products</span>
                                </div>
                                <div className="flex justify-between items-center text-base pt-3 border-t border-slate-200/50">
                                    <span className="text-slate-800 font-black">Total Paid</span>
                                    <span className="text-primary font-black">₹{order.total_amount}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex items-center justify-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                        <ShieldCheck className="text-blue-500" size={20} />
                        <p className="text-xs font-bold text-blue-700">Real-time tracking enabled. We'll alert you on any major status changes.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
