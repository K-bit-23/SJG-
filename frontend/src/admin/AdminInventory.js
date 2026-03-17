import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Plus, Edit, Trash2, Upload, ImageIcon,
    Tag, Package, Layers, DollarSign, Truck, Hash, Info, X, Save,
    ChevronRight, CloudUpload, CheckCircle, AlertCircle
} from 'lucide-react';

/* ─── Shared styles ─── */
const inp = 'w-full px-4 py-2.5 bg-blue-50/40 border border-blue-100 rounded-xl text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all placeholder-gray-400';
const lbl = 'block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5';

/* ─── Delete Confirm Modal ─── */
const DeleteModal = ({ product, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" style={{ animation: 'popIn .2s ease-out' }}>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Delete Product?</h3>
            <p className="text-sm text-gray-500 mb-6">
                <span className="font-semibold text-gray-700">"{product?.name}"</span> will be permanently removed.
            </p>
            <div className="flex gap-3">
                <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600">Yes, Delete</button>
            </div>
        </div>
    </div>
);

/* ─── Product Popup Modal ─── */
const ProductPopup = ({ editingProduct, productForm, setProductForm, onSave, onClose }) => {
    const [imagePreview, setImagePreview] = useState(productForm.image || '');
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef(null);
    const isEdit = !!editingProduct;

    useEffect(() => { setImagePreview(productForm.image || ''); }, [productForm.image]);

    /* ── Process a File object ── */
    const handleFile = useCallback((file) => {
        setUploadError('');
        setUploadSuccess(false);
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setUploadError('Only image files are allowed (JPG, PNG, WEBP, GIF).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('File too large — max 5 MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            setImagePreview(dataUrl);
            setProductForm(p => ({ ...p, image: dataUrl }));
            setUploadSuccess(true);
        };
        reader.readAsDataURL(file);
    }, [setProductForm]);

    /* ── Drag & Drop handlers ── */
    const onDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFile(e.dataTransfer.files?.[0]);
    };

    /* ── Click to browse ── */
    const onFileInput = (e) => handleFile(e.target.files?.[0]);

    /* ── URL input ── */
    const handleImgUrl = (val) => {
        setUploadError('');
        setUploadSuccess(false);
        setProductForm(p => ({ ...p, image: val }));
        setImagePreview(val);
    };

    /* ── Clear image ── */
    const clearImage = () => {
        setImagePreview('');
        setUploadError('');
        setUploadSuccess(false);
        setProductForm(p => ({ ...p, image: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const finalPrice = () => {
        const p = parseFloat(productForm.price) || 0;
        const t = parseFloat(productForm.tax_rate) || 0;
        return (p + p * t / 100).toFixed(2);
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center"
            onClick={onClose}
        >
            <div
                className="bg-white w-full md:max-w-4xl md:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
                style={{ animation: 'slideUp .3s cubic-bezier(.4,0,.2,1)' }}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                    <div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-0.5">
                            <span>Inventory</span>
                            <ChevronRight size={12} />
                            <span className="text-indigo-600 font-semibold">{isEdit ? 'Edit Product' : 'Add New Product'}</span>
                        </div>
                        <h2 className="text-lg font-bold text-gray-800 leading-none">
                            {isEdit ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">Fill in the fields below then click save.</p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition-all">
                        <X size={18} />
                    </button>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">

                        {/* LEFT: Visual */}
                        <div className="p-6 space-y-4 bg-gray-50/50">
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                <ImageIcon size={12} className="text-indigo-500" /> Product Visual
                            </h3>

                            {/* ── Drag & Drop Zone ── */}
                            {imagePreview ? (
                                /* Preview */
                                <div className="relative rounded-xl overflow-hidden border border-indigo-200 bg-indigo-50/20 group">
                                    <img
                                        src={imagePreview}
                                        alt="preview"
                                        className="w-full h-44 object-contain p-2"
                                        onError={clearImage}
                                    />
                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-3 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-100"
                                        >
                                            <Upload size={13} /> Replace
                                        </button>
                                        <button
                                            onClick={clearImage}
                                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-red-600"
                                        >
                                            <Trash2 size={13} /> Remove
                                        </button>
                                    </div>
                                    {/* Success badge */}
                                    {uploadSuccess && (
                                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                            <CheckCircle size={10} /> Uploaded
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Drop Zone */
                                <div
                                    onDragOver={onDragOver}
                                    onDragLeave={onDragLeave}
                                    onDrop={onDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative rounded-xl border-2 border-dashed flex flex-col items-center justify-center min-h-[160px] cursor-pointer transition-all select-none
                                        ${isDragOver
                                            ? 'border-indigo-500 bg-indigo-50 scale-[1.01] shadow-lg shadow-indigo-100'
                                            : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30'
                                        }`}
                                >
                                    <div className="text-center p-6 pointer-events-none">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all ${isDragOver ? 'bg-indigo-500 scale-110' : 'bg-indigo-100'}`}>
                                            <CloudUpload size={26} className={isDragOver ? 'text-white' : 'text-indigo-500'} />
                                        </div>
                                        {isDragOver ? (
                                            <>
                                                <p className="text-sm font-bold text-indigo-600">Drop it here!</p>
                                                <p className="text-xs text-indigo-400 mt-0.5">Release to upload</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-sm font-semibold text-gray-700">Drag & Drop Image</p>
                                                <p className="text-xs text-gray-400 mt-0.5">or <span className="text-indigo-600 font-semibold underline underline-offset-2">click to browse</span></p>
                                                <p className="text-[10px] text-gray-400 mt-2">PNG, JPG, WEBP, GIF — max 5 MB</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={onFileInput}
                            />

                            {/* Error message */}
                            {uploadError && (
                                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium">
                                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                                    {uploadError}
                                </div>
                            )}

                            {/* URL Input */}
                            <div>
                                <label className={lbl}>Or paste image URL</label>
                                <input
                                    type="text"
                                    className={inp}
                                    value={typeof productForm.image === 'string' && !productForm.image.startsWith('data:') ? productForm.image : ''}
                                    onChange={e => handleImgUrl(e.target.value)}
                                    placeholder="https://example.com/img.jpg"
                                />
                            </div>

                            {/* Status & Tags */}
                            <div>
                                <label className={lbl}>Status</label>
                                <select className={inp} value={productForm.status || 'active'} onChange={e => setProductForm(p => ({ ...p, status: e.target.value }))}>
                                    <option value="active">🟢 Active</option>
                                    <option value="draft">🟡 Draft</option>
                                    <option value="archived">🔴 Archived</option>
                                </select>
                            </div>

                            <div>
                                <label className={lbl}>Tags</label>
                                <input type="text" className={inp} value={productForm.tags || ''} onChange={e => setProductForm(p => ({ ...p, tags: e.target.value }))} placeholder="e.g. pen, notebook" />
                            </div>
                        </div>

                        {/* RIGHT: Form Sections */}
                        <div className="md:col-span-2 p-6 space-y-6">

                            {/* General Information */}
                            <div>
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                                    <Info size={12} className="text-indigo-500" /> General Information
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className={lbl}>Product Name</label>
                                        <input type="text" className={inp} value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} placeholder="Enter product name" required />
                                    </div>
                                    <div>
                                        <label className={lbl}>Description</label>
                                        <textarea className={`${inp} resize-none h-24`} value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} placeholder="Provide a detailed description of this product…" />
                                    </div>
                                </div>
                            </div>

                            {/* Pricing & Inventory */}
                            <div>
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                                    <DollarSign size={12} className="text-indigo-500" /> Pricing &amp; Inventory
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={lbl}>Category</label>
                                        <select className={inp} value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: e.target.value }))}>
                                            <option value="">Select…</option>
                                            {['Notebooks', 'Pens & Pencils', 'Art Supplies', 'Office Supplies', 'Tech Accessories', 'Bags', 'Others'].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className={lbl}>Skill Price (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                                            <input type="number" className={`${inp} pl-7`} value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} placeholder="0.00" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={lbl}>Tax In (%)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                                            <input type="number" className={`${inp} pl-7`} value={productForm.tax_rate || 0} onChange={e => setProductForm(p => ({ ...p, tax_rate: e.target.value }))} placeholder="0" min="0" max="100" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={lbl}>Delivering In (days)</label>
                                        <div className="relative">
                                            <Truck size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input type="number" className={`${inp} pl-8`} value={productForm.delivery_days || 0} onChange={e => setProductForm(p => ({ ...p, delivery_days: e.target.value }))} placeholder="0" min="0" />
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <label className={lbl}>Stock Quantity</label>
                                        <div className="relative">
                                            <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input type="number" className={`${inp} pl-8`} value={productForm.stock} onChange={e => setProductForm(p => ({ ...p, stock: e.target.value }))} placeholder="0" min="0" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* ── Sticky Footer Bar ── */}
                <div className="border-t border-gray-100 bg-white px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-6">
                        <div>
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Base Amount</p>
                            <p className="text-sm font-bold text-gray-700">₹{parseFloat(productForm.price || 0).toFixed(2)}</p>
                        </div>
                        <div className="h-8 w-px bg-gray-200" />
                        <div>
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Delivery</p>
                            <p className="text-sm font-bold text-gray-700">
                                {productForm.delivery_days > 0 ? `${productForm.delivery_days} day${productForm.delivery_days > 1 ? 's' : ''}` : 'Now'}
                            </p>
                        </div>
                        <div className="h-8 w-px bg-gray-200" />
                        <div>
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Final Price</p>
                            <p className="text-xl font-extrabold text-indigo-600">₹{finalPrice()}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                            Cancel
                        </button>
                        <button
                            onClick={onSave}
                            className="flex items-center gap-2 px-7 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-600 transition-all active:scale-95"
                        >
                            <Save size={15} />
                            {isEdit ? 'Update Product' : 'Add Product to Store'}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(40px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0)   scale(1);    }
                }
                @keyframes popIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to   { opacity: 1; transform: scale(1);   }
                }
            `}</style>
        </div>
    );
};

/* ─── Main Inventory List ─── */
const AdminInventory = ({
    products, openAddProduct, openEditProduct, deleteProduct,
    showProductModal, editingProduct, productForm, setProductForm,
    saveProduct, setShowProductModal
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [deleteTarget, setDeleteTarget] = useState(null);

    const filteredProducts = products.filter(p => {
        const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (p.tags || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
        return matchesSearch && matchesCat;
    });

    const confirmDelete = () => { deleteProduct(deleteTarget.id || deleteTarget._id); setDeleteTarget(null); };

    return (
        <div>
            {deleteTarget && <DeleteModal product={deleteTarget} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />}

            {showProductModal && (
                <ProductPopup
                    editingProduct={editingProduct}
                    productForm={productForm}
                    setProductForm={setProductForm}
                    onSave={saveProduct}
                    onClose={() => setShowProductModal(false)}
                />
            )}

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Product Inventory</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''} in store</p>
                </div>
                
                <div className="flex flex-wrap gap-4 items-center">
                    {/* Search */}
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search names, tags…" 
                            className="bg-gray-50/50 border border-gray-100 px-4 py-2.5 pl-10 rounded-xl text-sm focus:ring-2 ring-indigo-100 outline-none w-64 transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                            <Plus size={16} className="rotate-45" /> 
                        </div>
                    </div>

                    {/* Category Filter */}
                    <select 
                        className="bg-gray-50/50 border border-gray-100 px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 ring-indigo-100 cursor-pointer"
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        {['Notebooks', 'Pens & Pencils', 'Art Supplies', 'Office Supplies', 'Tech Accessories', 'Bags', 'Others'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <button
                        onClick={openAddProduct}
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:from-indigo-700 hover:to-indigo-600 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={18} /> Add Product
                    </button>
                </div>
            </div>

            {/* ── Empty State ── */}
            {products.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Package size={28} className="text-indigo-400" />
                    </div>
                    <h4 className="font-bold text-gray-700 mb-1">No Products Yet</h4>
                    <p className="text-sm text-gray-400 mb-6">Add your first product to get started.</p>
                    <button onClick={openAddProduct} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-200">
                        <Plus size={16} /> Add First Product
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100">
                                    {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                                        <th key={h} className={`p-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredProducts.map(product => (
                                    <tr key={product.id || product._id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                                    <img src={product.image || '/placeholder.png'} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800 text-sm">{product.name}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5 max-w-[200px] truncate">{product.description || '—'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
                                                <Tag size={11} /> {product.category || '—'}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-gray-800">₹{product.price}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${product.stock > 10 ? 'bg-green-100 text-green-700' :
                                                    product.stock > 0 ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-600'
                                                }`}>
                                                <Layers size={11} /> {product.stock} units
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${product.status === 'archived' ? 'bg-gray-100 text-gray-500' :
                                                    product.status === 'draft' ? 'bg-amber-100 text-amber-600' :
                                                        'bg-green-100 text-green-600'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${product.status === 'archived' ? 'bg-gray-400' :
                                                        product.status === 'draft' ? 'bg-amber-400' : 'bg-green-500'
                                                    }`} />
                                                {product.status || 'active'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openEditProduct(product)} className="p-2 hover:bg-indigo-50 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors" title="Edit">
                                                    <Edit size={15} />
                                                </button>
                                                <button onClick={() => setDeleteTarget(product)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInventory;
