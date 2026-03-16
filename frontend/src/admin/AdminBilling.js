import React from 'react';
import { Receipt, Copy, Printer, Layers, Globe, Box, Trash2, X } from 'lucide-react';

const AdminBilling = ({
    products, billingItems, billingCustomer, setBillingCustomer,
    handleBillingPhoneChange, billingProductSearch, setBillingProductSearch,
    addToBill, addServiceItem, removeFromBill, updateBillQuantity, updateItemPrice,
    calculateBillTotal, generateInvoice,
    showInvoiceModal, setShowInvoiceModal, currentInvoice, printInvoice
}) => {
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product Selection */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Services List (Quick Add) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Layers size={20} className="text-secondary" /> Available Services
                            </h3>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border">
                                {products.filter(p => p.category === 'Services').length} Services Available
                            </span>
                        </div>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                            {products.filter(p => p.category === 'Services').map((service, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => addToBill(service)}
                                    className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-secondary hover:bg-secondary/5 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-secondary group-hover:bg-white shadow-sm transition-colors">
                                            {service.name.includes('Print') || service.name.includes('Xerox') ? <Printer size={24} /> : 
                                             service.name.includes('Lamination') ? <Layers size={24} /> : <Globe size={24} />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 group-hover:text-secondary">{service.name}</h4>
                                            <p className="text-xs text-gray-400 line-clamp-1">{service.description || 'Standard service item'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <span className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Price</span>
                                            <span className="font-black text-slate-800">₹{service.price}</span>
                                        </div>
                                        <div className="hidden md:block">
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase">
                                                Active
                                            </span>
                                        </div>
                                        <button className="p-2 bg-secondary text-white rounded-lg shadow-lg shadow-secondary/20 hover:scale-110 active:scale-95 transition-all">
                                            <Box size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {products.filter(p => p.category === 'Services').length === 0 && (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                    <p className="text-gray-400 text-sm font-bold">No services found in inventory.</p>
                                    <p className="text-[10px] text-gray-300 uppercase mt-1">Add them in the Inventory tab under 'Services'</p>
                                </div>
                            )}
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
                            {products.filter(p => p.category !== 'Services' && p.name?.toLowerCase().includes(billingProductSearch.toLowerCase())).map(product => (
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
                        <input type="text" placeholder="Phone Number" className="w-full bg-transparent border-b border-gray-300 focus:border-secondary outline-none py-1 text-sm font-bold" value={billingCustomer.phone} onChange={e => handleBillingPhoneChange(e.target.value)} />
                        <input type="text" placeholder="Customer Name" className="w-full bg-transparent border-b border-gray-300 focus:border-secondary outline-none py-1 text-sm" value={billingCustomer.name} onChange={e => setBillingCustomer({ ...billingCustomer, name: e.target.value })} />
                        <input type="text" placeholder="Email Address" className="w-full bg-transparent border-b border-gray-300 focus:border-secondary outline-none py-1 text-sm text-gray-500" value={billingCustomer.email} onChange={e => setBillingCustomer({ ...billingCustomer, email: e.target.value })} />
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
                    <div className="p-10">
                        {/* Premium Header */}
                        <div className="flex justify-between items-start mb-10 pb-10 border-b-2 border-slate-50">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center p-2 shadow-sm">
                                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{currentInvoice.settings?.store_name || 'SJG Stationery'}</h1>
                                    <div className="flex flex-col text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                        <span>Premium Office & School Supplies</span>
                                        <span className="text-indigo-500">Official Digital Receipt</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="bg-slate-900 text-white px-5 py-2.5 rounded-xl shadow-lg inline-block">
                                    <h2 className="text-2xl font-black tracking-tight">INVOICE</h2>
                                </div>
                                <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">Original for Recipient</p>
                            </div>
                        </div>

                        {/* Party Details */}
                        <div className="grid grid-cols-2 gap-12 mb-12">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Customer / Billed To</h3>
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <p className="font-bold text-lg text-slate-900 leading-tight">{currentInvoice.customer.name}</p>
                                        <div className="mt-3 space-y-1">
                                            {currentInvoice.customer.phone && <p className="text-xs font-bold text-slate-500 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>{currentInvoice.customer.phone}</p>}
                                            {currentInvoice.customer.email && <p className="text-xs font-bold text-indigo-500 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>{currentInvoice.customer.email}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right space-y-4">
                                <div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Service Provider / From</h3>
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <p className="text-sm font-black text-slate-900 leading-snug">{currentInvoice.settings?.address}</p>
                                        <div className="mt-3 space-y-1 inline-flex flex-col items-end">
                                            <p className="text-xs font-bold text-slate-500 flex items-center gap-2">WhatsApp: {currentInvoice.settings?.whatsapp}<span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span></p>
                                            <p className="text-xs font-bold text-slate-500 flex items-center gap-2">{currentInvoice.settings?.email}<span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Metadata Strip */}
                        <div className="grid grid-cols-3 gap-4 mb-10">
                            {[
                                { label: 'Receipt Number', value: currentInvoice.id, color: 'text-slate-900' },
                                { label: 'Issue Date', value: currentInvoice.date, color: 'text-slate-900' },
                                { label: 'Grand Total', value: `${currentInvoice.settings?.currency?.split(' ')[1] || '₹'}${currentInvoice.grandTotal.toFixed(2)}`, color: 'text-indigo-600' }
                            ].map((item, i) => (
                                <div key={i} className="bg-white border-2 border-slate-50 p-4 rounded-2xl text-center group hover:border-indigo-100 transition-colors">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{item.label}</p>
                                    <p className={`font-black text-lg ${item.color}`}>{item.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Items Table */}
                        <div className="mb-10 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-900 text-white">
                                        <th className="px-6 py-4 text-left font-black uppercase text-[10px] tracking-widest">Description</th>
                                        <th className="px-6 py-4 text-center font-black uppercase text-[10px] tracking-widest">Qty</th>
                                        <th className="px-6 py-4 text-right font-black uppercase text-[10px] tracking-widest">Price</th>
                                        <th className="px-6 py-4 text-right font-black uppercase text-[10px] tracking-widest">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {currentInvoice.items.map((item, i) => (
                                        <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-slate-700 text-sm italic">{item.name}</p>
                                            </td>
                                            <td className="px-6 py-5 text-center text-slate-500 font-bold text-xs">{item.quantity}</td>
                                            <td className="px-6 py-5 text-right text-slate-500 font-bold text-xs">{currentInvoice.settings?.currency?.split(' ')[1] || '₹'}{item.price.toFixed(2)}</td>
                                            <td className="px-6 py-5 text-right font-black text-slate-900 text-sm">{currentInvoice.settings?.currency?.split(' ')[1] || '₹'}{(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Financial Summary */}
                        <div className="flex justify-end mb-12">
                            <div className="w-full max-w-[280px] space-y-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                                    <span>Subtotal</span>
                                    <span className="text-slate-900 font-black">{currentInvoice.settings?.currency?.split(' ')[1] || '₹'}{currentInvoice.total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                                    <span>Tax ({currentInvoice.settings?.gst_percentage || 18}%)</span>
                                    <span className="text-slate-900 font-black">{currentInvoice.settings?.currency?.split(' ')[1] || '₹'}{currentInvoice.tax.toFixed(2)}</span>
                                </div>
                                <div className="pt-4 border-t-2 border-slate-200 mt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-black text-slate-900 uppercase tracking-tighter">Amount Due</span>
                                        <span className="text-xl font-black text-indigo-600">{currentInvoice.settings?.currency?.split(' ')[1] || '₹'}{currentInvoice.grandTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Signatures & Footer */}
                        <div className="mt-16 pt-10 border-t-2 border-slate-50 text-center">
                            <div className="flex justify-center gap-32 mb-10">
                                <div className="space-y-4">
                                    <div className="w-40 h-px bg-slate-200"></div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer Signature</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="w-40 h-px bg-slate-200"></div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Authorized for {currentInvoice.settings?.store_name}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="font-black text-slate-900 text-sm uppercase tracking-tighter italic">Thank you for your business! Have a great day.</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em]">Generated on {new Date().toLocaleString()}</p>
                            </div>
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
