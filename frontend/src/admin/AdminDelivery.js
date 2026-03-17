import React, { useState } from 'react';
import { Truck, Calendar, Search, MapPin, Package, Save } from 'lucide-react';
import api from '../utils/api';
import { useNotifications } from '../context/NotificationContext';

const AdminDelivery = ({ orders, fetchData }) => {
    const { showAlert, showToast } = useNotifications();
    const [searchTerm, setSearchTerm] = useState('');
    const [updating, setUpdating] = useState(null);

    const updateDeliveryInfo = async (orderId, field, value) => {
        setUpdating(orderId);
        try {
            await api.patch(`orders/${orderId}/`, { [field]: value });
            await fetchData();
            showToast('Delivery information updated', 'success');
        } catch (err) {
            showAlert('Failed to update delivery info', 'error');
        } finally {
            setUpdating(null);
        }
    };

    const filteredOrders = orders.filter(order => 
        (order.order_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.shipping_address || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).filter(order => order.status === 'shipped' || order.status === 'processing' || order.status === 'pending');

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Truck className="text-indigo-600" /> Delivery Management
                        </h2>
                        <p className="text-sm text-gray-500">Track and schedule order deliveries</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search orders..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 ring-indigo-500/20 outline-none w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredOrders.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-gray-100">
                        <Package className="mx-auto text-gray-200 mb-4" size={48} />
                        <p className="text-gray-400 font-medium">No active deliveries to manage</p>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order.order_id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Info</span>
                                    <h4 className="font-bold text-gray-800">#{order.order_id}</h4>
                                    <p className="text-sm text-gray-500 mt-1">{order.user_name}</p>
                                    <div className="flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full w-fit mt-2 font-bold uppercase">
                                        {order.status}
                                    </div>
                                </div>

                                <div className="lg:col-span-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <MapPin size={10} /> Shipping Destination
                                    </span>
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{order.shipping_address}</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                            <Calendar size={10} /> Estimated Delivery Date
                                        </span>
                                        <input 
                                            type="date" 
                                            value={order.delivery_date || ''} 
                                            onChange={(e) => updateDeliveryInfo(order.order_id, 'delivery_date', e.target.value)}
                                            className="mt-1 w-full bg-gray-50 border-0 rounded-lg p-2 text-xs font-bold focus:ring-2 ring-indigo-500/20 outline-none cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delivery Partner / Agent</span>
                                        <select 
                                            value={order.delivery_partner || ''} 
                                            onChange={(e) => updateDeliveryInfo(order.order_id, 'delivery_partner', e.target.value)}
                                            className="mt-1 w-full bg-gray-50 border-0 rounded-lg p-2 text-xs font-bold focus:ring-2 ring-indigo-500/20 outline-none"
                                        >
                                            <option value="">Select Partner</option>
                                            <option value="SJG Express">SJG Express (Self)</option>
                                            <option value="Delhivery">Delhivery</option>
                                            <option value="BlueDart">BlueDart</option>
                                            <option value="DTDC">DTDC</option>
                                            <option value="Ecom Express">Ecom Express</option>
                                        </select>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tracking ID</span>
                                        <input 
                                            type="text" 
                                            placeholder="Enter Tracking ID"
                                            value={order.tracking_id || ''} 
                                            onBlur={(e) => updateDeliveryInfo(order.order_id, 'tracking_id', e.target.value)}
                                            className="mt-1 w-full bg-gray-50 border-0 rounded-lg p-2 text-xs font-bold focus:ring-2 ring-indigo-500/20 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {updating === order.order_id && (
                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-[10px] font-bold text-indigo-500 italic">
                                    <div className="w-3 h-3 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                    Synchronizing delivery data...
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                input[type="date"]::-webkit-calendar-picker-indicator {
                    cursor: pointer;
                    filter: invert(0.5);
                }
            `}} />
        </div>
    );
};

export default AdminDelivery;
