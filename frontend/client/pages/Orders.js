import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import { Package, Clock, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../../src/utils/api';
import AccountLayout from '../../src/components/AccountLayout';

const Orders = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchOrders = async () => {
            try {
                const userEmail = user.emailAddresses ? user.emailAddresses[0].emailAddress : user.email;
                if (!userEmail) return;

                const res = await api.get(`/orders/?user_email=${encodeURIComponent(userEmail)}`);
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
            case 'delivered': return 'text-green-600 bg-green-50 border border-green-200';
            case 'processing': return 'text-blue-600 bg-blue-50 border border-blue-200';
            case 'shipped': return 'text-purple-600 bg-purple-50 border border-purple-200';
            case 'cancelled': return 'text-red-600 bg-red-50 border border-red-200';
            default: return 'text-yellow-600 bg-yellow-50 border border-yellow-200';
        }
    };

    const downloadInvoice = (order) => {
        const doc = new jsPDF();
        
        // Add Company Logo/Header
        doc.setFillColor(235, 64, 52); // Red theme from screenshot
        doc.rect(0, 0, 210, 15, 'F');
        
        doc.setFontSize(24);
        doc.setTextColor(235, 64, 52); // Red text for INVOICE
        doc.text('INVOICE', 14, 30);
        
        // Company Info
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('SJG Stationery', 14, 40);
        doc.text('123 Station Road', 14, 45);
        doc.text('Phone: +91 9876543210', 14, 50);
        doc.text('Email: support@sjg.com', 14, 55);
        
        // Order Info
        const orderIdDisplay = order.order_id || order.id || order._id || 'UNKNOWN';
        doc.text(`Order #: ${orderIdDisplay}`, 140, 40);
        doc.text(`Date: ${new Date(order.created_at || Date.now()).toLocaleDateString()}`, 140, 45);
        doc.text(`Status: ${order.status || 'PENDING'}`, 140, 50);
        
        // Billing/Shipping info
        doc.setFontSize(11);
        doc.setTextColor(235, 64, 52);
        doc.text('BILL TO', 14, 70);
        doc.text('SHIP TO', 100, 70);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        const nameParts = order.user_name || user?.name || 'Customer';
        doc.text(nameParts, 14, 76);
        doc.text(nameParts, 100, 76);
        
        const addrLines = doc.splitTextToSize(order.shipping_address || 'Address not provided', 70);
        doc.text(addrLines, 14, 82);
        doc.text(addrLines, 100, 82);
        
        // Items Table
        const tableBody = order.items?.map(item => [
            item.product?.name || item.product_name || 'Product',
            item.quantity,
            `Rs. ${item.price}`,
            `Rs. ${item.price * item.quantity}`
        ]) || [];

        doc.autoTable({
            startY: 105,
            head: [['DESCRIPTION', 'QTY', 'UNIT PRICE', 'TOTAL']],
            body: tableBody,
            headStyles: { fillColor: [235, 64, 52] }, // Red header
            alternateRowStyles: { fillColor: [250, 250, 250] },
            margin: { top: 10 },
        });
        
        // Totals
        const finalY = doc.lastAutoTable.finalY + 10;
        
        doc.text('SUBTOTAL', 140, finalY);
        doc.text(`Rs. ${order.total_amount}`, 180, finalY, { align: 'right' });
        
        const shippingCost = order.total_amount > 999 ? 0 : 50;
        
        doc.text('SHIPPING', 140, finalY + 7);
        doc.text(`Rs. ${shippingCost}.00`, 180, finalY + 7, { align: 'right' });
        
        doc.setFontSize(12);
        doc.setTextColor(235, 64, 52);
        
        const balanceDue = order.total_amount + shippingCost;
        doc.text('BALANCE DUE', 140, finalY + 16);
        doc.text(`Rs. ${balanceDue}.00`, 180, finalY + 16, { align: 'right' });
        
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('Thank you for your business!', 105, 270, { align: 'center' });
        
        // Bottom Red Bar
        doc.setFillColor(235, 64, 52);
        doc.rect(0, 282, 210, 15, 'F');
        
        doc.save(`Invoice_${orderIdDisplay}.pdf`);
    };

    if (!user) return null;

    return (
        <AccountLayout>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {(() => {
                                const hour = new Date().getHours();
                                let greeting = 'Good Morning';
                                if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
                                else if (hour >= 17 && hour < 21) greeting = 'Good Evening';
                                else if (hour >= 21 || hour < 5) greeting = 'Good Night';
                                return `${greeting}, ${user.name?.split(' ')[0] || 'User'}`;
                            })()} 👋
                        </h1>
                        <p className="text-gray-500 text-sm">Track and manage your recent orders</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                            <Package size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Order History</h2>
                    </div>
                </div>

                <div className="divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-12 text-center text-gray-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mx-auto mb-4"></div>
                            Loading orders...
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package size={48} className="mx-auto text-gray-200 mb-4" />
                            <h3 className="text-gray-700 font-medium mb-1">No orders yet</h3>
                            <p className="text-gray-500 text-sm">Start shopping to see your orders here.</p>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.order_id || order.id} className="p-5 hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-bold text-gray-900">Order #{order.order_id || order.id}</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(order.status)}`}>
                                                {order.status?.toUpperCase() || 'PENDING'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock size={12} /> {new Date(order.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-right mr-2">
                                            <span className="block text-lg font-bold text-primary">₹{order.total_amount}</span>
                                            <span className="text-xs text-gray-500">{order.items?.length || 0} Items</span>
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/track-order/${order.order_id || order.id}`)}
                                            className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white rounded-lg flex items-center justify-center gap-2 transition-colors border border-blue-100 shadow-sm group"
                                            title="Track Order Status"
                                        >
                                            <Truck size={16} className="group-hover:translate-x-1 transition-transform" />
                                            <span className="text-sm font-bold hidden sm:inline">Track</span>
                                        </button>
                                        <button 
                                            onClick={() => downloadInvoice(order)}
                                            className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center gap-2 transition-colors border border-red-100 shadow-sm group"
                                            title="Download PDF Invoice"
                                        >
                                            <Download size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                                            <span className="text-sm font-bold hidden sm:inline">Invoice</span>
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-gray-200/50 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={item.product?.image || 'https://via.placeholder.com/40'} 
                                                    alt={item.product?.name || item.product_name} 
                                                    className="w-10 h-10 object-cover rounded shadow-sm"
                                                />
                                                <div>
                                                    <span className="text-gray-800 font-medium block">
                                                        {item.product?.name || item.product_name || 'Product'}
                                                    </span>
                                                    <span className="text-gray-500 text-xs text-left block">
                                                        Qty: {item.quantity} × ₹{item.price}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AccountLayout>
    );
};

export default Orders;
