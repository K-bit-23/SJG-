import React from 'react';
import { Receipt, Copy, Printer, Layers, Globe, Box, Trash2, X } from 'lucide-react';

const AdminBilling = ({
    products, billingItems, billingCustomer, setBillingCustomer,
    handleBillingPhoneChange,
    billingProductSearch, setBillingProductSearch,
    addToBill, addServiceItem, removeFromBill, updateBillQuantity, updateItemPrice,
    calculateBillTotal, generateInvoice,
    showInvoiceModal, setShowInvoiceModal, currentInvoice, printInvoice
}) => {
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product Selection */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Services */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-bold mb-4">Quick Services</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { name: 'Xerox (B&W)', icon: Copy, label: 'Xerox' },
                                { name: 'Printout (Color)', icon: Printer, label: 'Print' },
                                { name: 'Lamination', icon: Layers, label: 'Lamination' },
                                { name: 'Online Services', icon: Globe, label: 'Online Help' },
                            ].map((s, i) => (
                                <button key={i} onClick={() => addServiceItem(s.name)} className="p-4 border border-dashed border-gray-300 rounded-xl hover:bg-secondary/5 hover:border-secondary hover:text-secondary transition-all font-medium flex flex-col items-center gap-2">
                                    <s.icon size={24} /> {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Products */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Select Products</h3>
                            <div className="relative">
                                <input type="text" placeholder="Search products..." className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 ring-secondary/20 outline-none w-64" value={billingProductSearch} onChange={e => setBillingProductSearch(e.target.value)} />
                                <span className="absolute left-3 top-3 text-gray-400"><Box size={16} /></span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto p-1">
                            {products.filter(p => p.name?.toLowerCase().includes(billingProductSearch.toLowerCase())).map(product => (
                                <div key={product.id || product._id} className="border rounded-lg p-3 hover:shadow-md transition-all cursor-pointer bg-gray-50 hover:bg-white" onClick={() => addToBill(product)}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden"><img src={product.image || '/placeholder.png'} alt="" className="w-full h-full object-cover" /></div>
                                        <span className="font-bold text-secondary">₹{product.price}</span>
                                    </div>
                                    <h4 className="font-medium text-sm truncate">{product.name}</h4>
                                    <p className="text-xs text-gray-500">{product.stock} in stock</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Current Bill */}
                <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Receipt size={20} className="text-secondary" /> Current Bill</h3>

                    <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <input type="text" placeholder="Customer Name" className="w-full bg-transparent border-b border-gray-300 focus:border-secondary outline-none py-1 text-sm" value={billingCustomer.name} onChange={e => setBillingCustomer({ ...billingCustomer, name: e.target.value })} />
                        <input type="text" placeholder="Phone Number" className="w-full bg-transparent border-b border-gray-300 focus:border-secondary outline-none py-1 text-sm" value={billingCustomer.phone} onChange={e => handleBillingPhoneChange(e.target.value)} />
                        <input type="email" placeholder="Customer Email (Optional)" className="w-full bg-transparent border-b border-gray-300 focus:border-secondary outline-none py-1 text-sm text-gray-500" value={billingCustomer.email} onChange={e => setBillingCustomer({ ...billingCustomer, email: e.target.value })} />
                    </div>

                    <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
                        {billingItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <div className="font-medium">{item.name}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-gray-500 text-xs">Price: ₹</span>
                                        <input type="number" value={item.price} onChange={e => updateItemPrice(item.id, e.target.value)} className="w-20 p-1 border rounded text-xs" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center border rounded bg-white">
                                        <button onClick={() => updateBillQuantity(item.id, item.quantity - 1)} className="px-2 hover:bg-gray-100 py-1">-</button>
                                        <span className="px-2 text-xs">{item.quantity}</span>
                                        <button onClick={() => updateBillQuantity(item.id, item.quantity + 1)} className="px-2 hover:bg-gray-100 py-1">+</button>
                                    </div>
                                    <button onClick={() => removeFromBill(item.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                        {billingItems.length === 0 && <p className="text-center text-gray-400 text-sm py-4">No items added</p>}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span>₹{calculateBillTotal().toFixed(2)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-600">Tax (18%)</span><span>₹{(calculateBillTotal() * 0.18).toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2"><span>Total</span><span className="text-secondary">₹{(calculateBillTotal() * 1.18).toFixed(2)}</span></div>
                    </div>

                    <button onClick={generateInvoice} className="w-full mt-6 bg-secondary text-white py-3 rounded-xl font-bold hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-secondary/30">
                        <Receipt size={18} /> Generate Invoice
                    </button>
                </div>
            </div>

            {/* Invoice Modal */}
            {showInvoiceModal && currentInvoice && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold flex items-center gap-2"><Receipt size={18} /> Invoice Generated</h3>
                            <button onClick={() => setShowInvoiceModal(false)} className="p-1 hover:bg-gray-200 rounded-full"><X size={20} /></button>
                        </div>
                        <div className="overflow-y-auto flex-1 bg-white" id="invoice-template">
                            <style>
                                {`
                                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap');
                                .invoice-container { font-family: 'Inter', sans-serif; color: #1e293b; }
                                .invoice-title { font-family: 'Outfit', sans-serif; }
                                .brand-text { font-family: 'Outfit', sans-serif; font-weight: 800; }
                                `}
                            </style>
                            <div className="invoice-container p-12 max-w-4xl mx-auto">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-16">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center p-3 shadow-xl shadow-slate-200">
                                            <img src="/logo.png" alt="SJG" className="w-full h-full object-contain brightness-0 invert" />
                                        </div>
                                        <div>
                                            <h1 className="brand-text text-3xl tracking-tighter text-slate-900 leading-none">SJG STATIONERY<span className="text-indigo-600">.</span></h1>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">Premium Quality Archives</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="invoice-title text-5xl font-black text-slate-900 tracking-tighter mb-2">INVOICE</h2>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{currentInvoice.id}</p>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-12 mb-16">
                                    <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Client Entity</p>
                                        <h3 className="text-xl font-black text-slate-900 mb-2 truncate">{currentInvoice.customer.name}</h3>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                                {currentInvoice.customer.phone || 'Contact not listed'}
                                            </p>
                                            {currentInvoice.customer.email && (
                                                <p className="text-sm font-medium text-slate-500">{currentInvoice.customer.email}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-end space-y-4 px-4">
                                        <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                                            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Issue Date</span>
                                            <span className="font-black text-slate-900">{currentInvoice.date}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                                            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Currency</span>
                                            <span className="font-black text-slate-900">INR (₹)</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Status</span>
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">Paid</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="mb-16">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b-2 border-slate-900">
                                                <th className="py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Service Designation</th>
                                                <th className="py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Qty</th>
                                                <th className="py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Unit Rate</th>
                                                <th className="py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Net Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {currentInvoice.items.map((item, i) => (
                                                <tr key={i} className="group hover:bg-slate-50 transition-colors">
                                                    <td className="py-6 font-bold text-slate-900">{item.name}</td>
                                                    <td className="py-6 text-center font-bold text-slate-500">{item.quantity}</td>
                                                    <td className="py-6 text-right font-medium text-slate-600">₹{item.price.toFixed(2)}</td>
                                                    <td className="py-6 text-right font-black text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Totals */}
                                <div className="flex justify-end mb-24">
                                    <div className="w-full max-w-xs space-y-4">
                                        <div className="flex justify-between text-sm font-bold text-slate-500">
                                            <span>Subtotal</span>
                                            <span className="text-slate-900">₹{currentInvoice.total.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold text-indigo-500">
                                            <span>Tax Infrastructure (18%)</span>
                                            <span>₹{currentInvoice.tax.toFixed(2)}</span>
                                        </div>
                                        <div className="pt-6 border-t-2 border-slate-900 flex justify-between items-end">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Payable</div>
                                            <div className="text-4xl font-black text-slate-900 tracking-tighter">₹{currentInvoice.grandTotal.toFixed(2)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Contact Info */}
                                <div className="pt-12 border-t border-slate-100 flex justify-between items-end">
                                    <div className="max-w-[200px]">
                                        <h4 className="brand-text text-sm text-slate-900 mb-2 uppercase tracking-tight">SJG Logistics Hub</h4>
                                        <p className="text-[10px] font-medium text-slate-400 leading-relaxed uppercase tracking-wider">
                                            Sakthi Nagar, Thindal, Erode - 638012<br/>
                                            Tamil Nadu, India.
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-[.2em] text-indigo-600 mb-2">Authenticated Transaction</p>
                                        <p className="text-[10px] font-bold text-slate-400">sjgvxerox@gmail.com | +91 93600 24821</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button onClick={printInvoice} className="bg-secondary text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-600 flex items-center gap-2"><Printer size={18} /> Print Invoice</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminBilling;
