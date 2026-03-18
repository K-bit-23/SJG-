import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit2, Copy, CheckCircle } from 'lucide-react';
import api from '../../src/utils/api';

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [form, setForm] = useState({ code: '', discount_type: 'percentage', discount_value: '', is_active: true, description: '' });
    const [copied, setCopied] = useState(null);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await api.get('/admin/coupons/');
            setCoupons(res.data);
        } catch(err) {
            console.error("Failed to fetch coupons", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/coupons/', form);
            setIsModalOpen(false);
            fetchCoupons();
        } catch(err) {
            alert("Failed to save coupon");
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Are you sure you want to delete this coupon?")) return;
        try {
            await api.delete(`/admin/coupons/${id}/`);
            setCoupons(coupons.filter(c => c.id !== id));
        } catch(err) {
            alert("Failed to delete coupon");
        }
    };

    const openModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setForm(coupon);
        } else {
            setEditingCoupon(null);
            setForm({ code: '', discount_type: 'percentage', discount_value: '', is_active: true, description: '' });
        }
        setIsModalOpen(true);
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopied(code);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Discount Coupons</h2>
                    <p className="text-sm font-medium text-slate-500">Manage promotional codes and active discounts.</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg"
                >
                    <Plus size={18} /> Add Coupon
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
            ) : coupons.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
                    <Tag size={48} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold mb-4">No coupons configured yet</p>
                    <button onClick={() => openModal()} className="px-6 py-2.5 bg-white text-indigo-600 font-bold text-sm rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-all">Create First Coupon</button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.map((coupon) => (
                        <div key={coupon.id} className={`p-6 rounded-3xl border ${coupon.is_active ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-200 bg-slate-50'} relative group`}>
                            <div className="flex justify-between items-start mb-4">
                                <div 
                                    onClick={() => copyCode(coupon.code)}
                                    className="px-4 py-2 bg-white rounded-xl border-2 border-dashed border-indigo-200 text-indigo-700 font-black tracking-widest uppercase cursor-pointer hover:border-indigo-400 transition-all flex items-center gap-2"
                                >
                                    {coupon.code}
                                    {copied === coupon.code ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} className="text-indigo-300" />}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openModal(coupon)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"><Edit2 size={16}/></button>
                                    <button onClick={() => handleDelete(coupon.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all"><Trash2 size={16}/></button>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${coupon.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${coupon.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
                                    {coupon.is_active ? 'Active' : 'Disabled'}
                                </span>
                            </div>

                            <p className="text-3xl font-black text-slate-800 mb-1">
                                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                            </p>
                            <p className="text-sm text-slate-500 font-medium line-clamp-2">{coupon.description || 'No description provided'}</p>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <h3 className="text-2xl font-black text-slate-800 mb-6">{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Coupon Code</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={form.code} 
                                    onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                                    placeholder="e.g. SUMMER10" 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl uppercase font-black tracking-wider outline-none focus:border-indigo-500 focus:ring-2 ring-indigo-500/20 transition-all"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Discount Type</label>
                                    <select 
                                        value={form.discount_type} 
                                        onChange={e => setForm({...form, discount_type: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-500 transition-all"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="flat">Flat Amount (₹)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Value</label>
                                    <input 
                                        type="number" 
                                        required 
                                        min="1"
                                        value={form.discount_value} 
                                        onChange={e => setForm({...form, discount_value: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-500 transition-all"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                                <textarea 
                                    value={form.description} 
                                    onChange={e => setForm({...form, description: e.target.value})}
                                    placeholder="Brief details about the offer..." 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all resize-none h-24 text-sm font-medium text-slate-700"
                                />
                            </div>
                            
                            <div className="flex items-center gap-3 py-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                                <span className="text-sm font-bold text-slate-700">Coupon is Active</span>
                            </div>
                            
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">Save Coupon</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCoupons;
