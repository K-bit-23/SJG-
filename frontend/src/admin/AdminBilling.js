import React from 'react';
import { Receipt, Copy, Printer, Layers, Globe, Box, Trash2, X } from 'lucide-react';

const AdminBilling = ({
    products, billingItems, billingCustomer, setBillingCustomer,
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
                        <input type="text" placeholder="Phone Number" className="w-full bg-transparent border-b border-gray-300 focus:border-secondary outline-none py-1 text-sm" value={billingCustomer.phone} onChange={e => setBillingCustomer({ ...billingCustomer, phone: e.target.value })} />
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
                <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span>{currentInvoice?.settings?.currency?.split(' ')[1] || '₹'}{calculateBillTotal().toFixed(2)}</span></div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax ({JSON.parse(localStorage.getItem('admin_settings') || '{}').gst_percentage || 18}%)</span>
                    <span>{currentInvoice?.settings?.currency?.split(' ')[1] || '₹'}{(calculateBillTotal() * (JSON.parse(localStorage.getItem('admin_settings') || '{}').gst_percentage || 18) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                    <span>Total</span>
                    <span className="text-secondary">{currentInvoice?.settings?.currency?.split(' ')[1] || '₹'}{(calculateBillTotal() * (1 + (JSON.parse(localStorage.getItem('admin_settings') || '{}').gst_percentage || 18) / 100)).toFixed(2)}</span>
                </div>
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
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">{currentInvoice.settings?.store_name || 'SJG Stationery'}</h1>
                                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Premium Office & School Supplies</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tighter">INVOICE</h2>
                                <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest mt-1">Digital Receipt</p>
                            </div>
                        </div>

                        <div className="flex justify-between mb-8 pl-1">
                            <div className="w-1/2">
                                <h3 className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mb-2">Billed To</h3>
                                <p className="font-bold text-lg text-gray-800 leading-tight">{currentInvoice.customer.name}</p>
                                {currentInvoice.customer.phone && <p className="text-sm font-medium text-gray-600 mt-0.5">{currentInvoice.customer.phone}</p>}
                                {currentInvoice.customer.email && <p className="text-xs text-indigo-500 mt-1">{currentInvoice.customer.email}</p>}
                            </div>
                            <div className="text-right w-1/2">
                                <h3 className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mb-2">Issued By</h3>
                                <p className="text-sm font-bold text-gray-800 leading-tight">{currentInvoice.settings?.address}</p>
                                <p className="text-xs font-medium text-gray-500 mt-1">Ph: {currentInvoice.settings?.whatsapp}</p>
                                <p className="text-xs font-medium text-gray-500">{currentInvoice.settings?.email}</p>
                            </div>
                        </div>

                        <div className="bg-slate-900 text-white flex justify-between px-8 py-4 mb-8 rounded-2xl shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-full bg-indigo-500/20 skew-x-12 translate-x-12"></div>
                            <div className="relative z-10"><p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Receipt ID</p><p className="font-bold text-lg">{currentInvoice.id}</p></div>
                            <div className="relative z-10"><p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Issue Date</p><p className="font-bold text-lg">{currentInvoice.date}</p></div>
                            <div className="text-right relative z-10"><p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Grand Total</p><p className="font-black text-2xl text-indigo-400">{currentInvoice.settings?.currency?.split(' ')[1] || '₹'}{currentInvoice.grandTotal.toFixed(2)}</p></div>
                        </div>

                        <table className="w-full mb-8">
                            <thead>
                                <tr className="border-b-2 border-slate-100">
                                    <th className="py-3 text-left font-bold text-slate-400 uppercase text-[10px] tracking-widest pl-2">Description</th>
                                    <th className="py-3 text-center font-bold text-slate-400 uppercase text-[10px] tracking-widest">Qty</th>
                                    <th className="py-3 text-right font-bold text-slate-400 uppercase text-[10px] tracking-widest">Price</th>
                                    <th className="py-3 text-right font-bold text-slate-400 uppercase text-[10px] tracking-widest pr-2">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {currentInvoice.items.map((item, i) => (
                                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 pl-2 font-bold text-slate-700">{item.name}</td>
                                        <td className="py-4 text-center text-slate-600 font-medium">x{item.quantity}</td>
                                        <td className="py-4 text-right text-slate-600 font-medium">{currentInvoice.settings?.currency?.split(' ')[1] || '₹'}{item.price.toFixed(2)}</td>
                                        <td className="py-4 text-right font-bold text-slate-900 pr-2">{currentInvoice.settings?.currency?.split(' ')[1] || '₹'}{(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="flex justify-end mb-8">
                            <div className="w-1/2 pr-2 space-y-2.5">
                                <div className="flex justify-between py-1 border-b border-slate-100 text-sm font-medium text-slate-500">
                                    <span>Subtotal</span>
                                    <span className="text-slate-900 font-bold">{currentInvoice.settings?.currency?.split(' ')[1] || '₹'}{currentInvoice.total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-100 text-sm font-medium text-slate-500">
                                    <span>GST ({currentInvoice.settings?.gst_percentage || 18}%)</span>
                                    <span className="text-slate-900 font-bold">{currentInvoice.settings?.currency?.split(' ')[1] || '₹'}{currentInvoice.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between py-3 font-black text-xl border-t-4 border-slate-900 mt-2">
                                    <span>Total Due</span>
                                    <span className="text-indigo-600">{currentInvoice.settings?.currency?.split(' ')[1] || '₹'}{currentInvoice.grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                            <div className="flex justify-center gap-12 mb-6">
                                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer Auth</p><div className="w-32 h-px bg-slate-200"></div></div>
                                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Manager Sign</p><div className="w-32 h-px bg-slate-200"></div></div>
                            </div>
                            <p className="font-black text-slate-900 text-sm uppercase tracking-tighter">Thank you for choosing {currentInvoice.settings?.store_name}!</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">This is a system generated receipt</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
                    <button onClick={printInvoice} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-slate-900 transition-all flex items-center gap-2 shadow-xl shadow-indigo-500/20 uppercase text-xs tracking-widest active:scale-95">
                        <Printer size={16} /> Print Official Receipt
                    </button>
                </div>
            </div>
        </div>
    )}
        </>
    );
};

export default AdminBilling;
