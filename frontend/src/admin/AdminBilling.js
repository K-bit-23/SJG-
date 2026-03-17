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
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <img src="/logo.png" alt="SJG Logo" className="w-16 h-16 object-contain" />
                                        <div><h1 className="text-2xl font-bold text-gray-800">SJG Stationery</h1><p className="text-gray-500 text-sm">Your One-Stop Shop</p></div>
                                    </div>
                                    <div className="text-right"><h2 className="text-2xl font-bold text-gray-800">INVOICE</h2><p className="text-gray-500 font-medium">Tax Invoice</p></div>
                                </div>

                                <div className="flex justify-between mb-8 pl-1">
                                    <div className="w-1/2">
                                        <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider mb-2">Bill To:</h3>
                                        <p className="font-bold text-lg text-gray-800">{currentInvoice.customer.name}</p>
                                        {currentInvoice.customer.phone && <p className="text-sm">{currentInvoice.customer.phone}</p>}
                                    </div>
                                    <div className="text-right w-1/2">
                                        <p className="text-sm text-gray-500">123, Main Street, Tech Park</p>
                                        <p className="text-sm text-gray-500">Chennai - 600001</p>
                                        <p className="text-sm text-gray-500">Ph: +91 93600 24821</p>
                                    </div>
                                </div>

                                <div className="bg-yellow-400 flex justify-between px-8 py-4 mb-8 rounded-sm">
                                    <div><p className="text-xs uppercase font-bold text-yellow-800 mb-1">Invoice No</p><p className="font-bold text-lg">{currentInvoice.id}</p></div>
                                    <div><p className="text-xs uppercase font-bold text-yellow-800 mb-1">Issue Date</p><p className="font-bold text-lg">{currentInvoice.date}</p></div>
                                    <div className="text-right"><p className="text-xs uppercase font-bold text-yellow-800 mb-1">Total Amount</p><p className="font-bold text-xl">₹{currentInvoice.grandTotal.toFixed(2)}</p></div>
                                </div>

                                <table className="w-full mb-8">
                                    <thead>
                                        <tr className="border-b-2 border-gray-100">
                                            <th className="py-3 text-left font-bold text-gray-600 uppercase text-xs pl-2 w-1/2">Description</th>
                                            <th className="py-3 text-center font-bold text-gray-600 uppercase text-xs">Qty</th>
                                            <th className="py-3 text-right font-bold text-gray-600 uppercase text-xs">Unit Price</th>
                                            <th className="py-3 text-right font-bold text-gray-600 uppercase text-xs pr-2">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentInvoice.items.map((item, i) => (
                                            <tr key={i} className="border-b border-gray-50">
                                                <td className="py-4 pl-2 font-bold text-gray-700">{item.name}</td>
                                                <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                                                <td className="py-4 text-right text-gray-600">₹{item.price.toFixed(2)}</td>
                                                <td className="py-4 text-right font-bold text-gray-800 pr-2">₹{(item.price * item.quantity).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="flex justify-end mb-8">
                                    <div className="w-1/2 pr-2 space-y-2">
                                        <div className="flex justify-between py-1 border-b border-gray-100 text-sm"><span className="text-gray-600">Subtotal</span><span className="font-bold">₹{currentInvoice.total.toFixed(2)}</span></div>
                                        <div className="flex justify-between py-1 border-b border-gray-100 text-sm"><span className="text-gray-600">Tax (18% GST)</span><span>₹{currentInvoice.tax.toFixed(2)}</span></div>
                                        <div className="flex justify-between py-2 font-bold text-lg border-t-2 border-gray-800 mt-2"><span>Total Due</span><span className="text-secondary">₹{currentInvoice.grandTotal.toFixed(2)}</span></div>
                                    </div>
                                </div>

                                <div className="text-center mt-8 pb-4">
                                    <p className="font-bold text-gray-800">Thank you for your business!</p>
                                    <p className="text-xs text-gray-500 mt-1">www.sjgstationery.com</p>
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
