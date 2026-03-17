import React from 'react';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';

const AdminContent = ({
    homeContent, contentSubTab, setContentSubTab,
    openHomeItemEditor, deleteHomeItem,
    showHomeModal, setShowHomeModal, editingHomeItem, homeItemForm, setHomeItemForm, handleSaveHomeItem
}) => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Sub-tabs */}
                <div className="flex border-b">
                    <button onClick={() => setContentSubTab('banners')} className={`px-6 py-4 text-sm font-bold transition-all ${contentSubTab === 'banners' ? 'border-b-2 border-secondary text-secondary' : 'text-gray-500 hover:text-gray-700'}`}>Hero Banners</button>
                    <button onClick={() => setContentSubTab('services')} className={`px-6 py-4 text-sm font-bold transition-all ${contentSubTab === 'services' ? 'border-b-2 border-secondary text-secondary' : 'text-gray-500 hover:text-gray-700'}`}>Print Services</button>
                    <button onClick={() => setContentSubTab('categories')} className={`px-6 py-4 text-sm font-bold transition-all ${contentSubTab === 'categories' ? 'border-b-2 border-secondary text-secondary' : 'text-gray-500 hover:text-gray-700'}`}>Product Categories</button>
                </div>

                <div className="p-6">
                    {contentSubTab === 'banners' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-gray-700">Home Hero Banners</h4>
                                <button onClick={() => openHomeItemEditor(null, 'banner')} className="flex items-center gap-2 bg-secondary text-white px-3 py-1.5 rounded-lg text-xs font-bold"><Plus size={14} /> Add Banner</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.isArray(homeContent.banners) && homeContent.banners.map((banner, idx) => (
                                    <div key={idx} className="group relative bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all">
                                        <img src={banner.img} alt="" className="w-full h-32 object-cover" />
                                        <div className="p-3">
                                            <h5 className="font-bold text-sm truncate">{banner.title}</h5>
                                            <p className="text-xs text-gray-500 truncate">{banner.subtitle}</p>
                                            <div className="flex gap-2 mt-3">
                                                <button onClick={() => openHomeItemEditor(banner, 'banner')} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Edit size={14} /></button>
                                                <button onClick={() => deleteHomeItem('banner', idx)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!homeContent.banners || homeContent.banners.length === 0) && <p className="col-span-full text-center py-8 text-gray-400 text-sm">No banners configured</p>}
                            </div>
                        </div>
                    )}

                    {contentSubTab === 'services' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-gray-700">Service Grid Items</h4>
                                <button onClick={() => openHomeItemEditor(null, 'service')} className="flex items-center gap-2 bg-secondary text-white px-3 py-1.5 rounded-lg text-xs font-bold"><Plus size={14} /> Add Service</button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {Array.isArray(homeContent.services) && homeContent.services.map((service, idx) => (
                                    <div key={idx} className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100 hover:shadow-md transition-all">
                                        <div className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center text-white mb-2 shadow-sm`}><Edit size={16} /></div>
                                        <h5 className="font-bold text-xs truncate">{service.name}</h5>
                                        <p className="text-[10px] text-gray-500 mb-2 truncate">{service.price}</p>
                                        <div className="flex justify-center gap-1">
                                            <button onClick={() => openHomeItemEditor(service, 'service')} className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Edit size={12} /></button>
                                            <button onClick={() => deleteHomeItem('service', idx)} className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 size={12} /></button>
                                        </div>
                                    </div>
                                ))}
                                {(!homeContent.services || homeContent.services.length === 0) && <p className="col-span-full text-center py-8 text-gray-400 text-sm">No services configured</p>}
                            </div>
                        </div>
                    )}

                    {contentSubTab === 'categories' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-gray-700">Product Categories</h4>
                                <button onClick={() => openHomeItemEditor(null, 'category')} className="flex items-center gap-2 bg-secondary text-white px-3 py-1.5 rounded-lg text-xs font-bold"><Plus size={14} /> Add Category</button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {Array.isArray(homeContent.categories) && homeContent.categories.map((category, idx) => (
                                    <div key={idx} className="group relative bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all">
                                        <img src={category.img} alt="" className="w-full h-32 object-cover" />
                                        <div className="p-3">
                                            <h5 className="font-bold text-sm truncate">{category.name}</h5>
                                            <p className="text-xs text-gray-500 truncate">{category.count || '0 Products'}</p>
                                            <div className="flex gap-2 mt-3">
                                                <button onClick={() => openHomeItemEditor(category, 'category')} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Edit size={14} /></button>
                                                <button onClick={() => deleteHomeItem('category', idx)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!homeContent.categories || homeContent.categories.length === 0) && <p className="col-span-full text-center py-8 text-gray-400 text-sm">No categories configured</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Edit Modal */}
            {showHomeModal && editingHomeItem && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{editingHomeItem.item ? 'Edit' : 'Add'} {editingHomeItem.type.charAt(0).toUpperCase() + editingHomeItem.type.slice(1)}</h3>
                            <button onClick={() => setShowHomeModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            {editingHomeItem.type === 'banner' && (
                                <>
                                    <div><label className="block text-sm font-medium mb-1">Title</label><input type="text" value={homeItemForm.title || ''} onChange={e => setHomeItemForm({ ...homeItemForm, title: e.target.value })} className="w-full p-2.5 border rounded-lg" /></div>
                                    <div><label className="block text-sm font-medium mb-1">Subtitle</label><input type="text" value={homeItemForm.subtitle || ''} onChange={e => setHomeItemForm({ ...homeItemForm, subtitle: e.target.value })} className="w-full p-2.5 border rounded-lg" /></div>
                                    <div><label className="block text-sm font-medium mb-1 text-slate-500 uppercase text-[10px] font-black tracking-widest">Image Content URL</label><input type="text" value={homeItemForm.img || ''} onChange={e => setHomeItemForm({ ...homeItemForm, img: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 ring-indigo-500/10 outline-none font-bold" placeholder="https://..." /></div>
                                    {homeItemForm.img && (
                                        <div className="relative h-40 rounded-2xl overflow-hidden border border-slate-100 shadow-inner group">
                                            <img src={homeItemForm.img} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 border border-white">Live Preview</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-medium mb-1">Button Text</label><input type="text" value={homeItemForm.btnText || ''} onChange={e => setHomeItemForm({ ...homeItemForm, btnText: e.target.value })} className="w-full p-2.5 border rounded-lg" /></div>
                                        <div><label className="block text-sm font-medium mb-1">Button Link</label><input type="text" value={homeItemForm.btnLink || ''} onChange={e => setHomeItemForm({ ...homeItemForm, btnLink: e.target.value })} className="w-full p-2.5 border rounded-lg" /></div>
                                    </div>
                                </>
                            )}
                            {editingHomeItem.type === 'service' && (
                                <>
                                    <div><label className="block text-sm font-medium mb-1">Service Name</label><input type="text" value={homeItemForm.name || ''} onChange={e => setHomeItemForm({ ...homeItemForm, name: e.target.value })} className="w-full p-2.5 border rounded-lg" /></div>
                                    <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={homeItemForm.desc || ''} onChange={e => setHomeItemForm({ ...homeItemForm, desc: e.target.value })} className="w-full p-2.5 border rounded-lg h-20" /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Icon</label>
                                            <select value={homeItemForm.icon || 'Sparkles'} onChange={e => setHomeItemForm({ ...homeItemForm, icon: e.target.value })} className="w-full p-2.5 border rounded-lg">
                                                {['Printer', 'Copy', 'Layers', 'BookOpen', 'FileText', 'Palette', 'Sparkles'].map(ic => <option key={ic} value={ic}>{ic}</option>)}
                                            </select>
                                        </div>
                                        <div><label className="block text-sm font-medium mb-1">Price Label</label><input type="text" value={homeItemForm.price || ''} onChange={e => setHomeItemForm({ ...homeItemForm, price: e.target.value })} className="w-full p-2.5 border rounded-lg" placeholder="e.g. From ₹10" /></div>
                                    </div>
                                </>
                            )}
                            {editingHomeItem.type === 'category' && (
                                <>
                                    <div><label className="block text-sm font-medium mb-1">Category Name</label><input type="text" value={homeItemForm.name || ''} onChange={e => setHomeItemForm({ ...homeItemForm, name: e.target.value })} className="w-full p-2.5 border rounded-lg" /></div>
                                    <div><label className="block text-sm font-medium mb-1 text-slate-500 uppercase text-[10px] font-black tracking-widest">Category Graphic URL</label><input type="text" value={homeItemForm.img || ''} onChange={e => setHomeItemForm({ ...homeItemForm, img: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 ring-indigo-500/10 outline-none font-bold" placeholder="https://..." /></div>
                                    {homeItemForm.img && (
                                        <div className="relative h-32 w-32 mx-auto rounded-3xl overflow-hidden border border-slate-100 shadow-lg group">
                                            <img src={homeItemForm.img} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Edit size={24} className="text-white drop-shadow-lg" />
                                            </div>
                                        </div>
                                    )}

                                    <div><label className="block text-sm font-medium mb-1">Product Count Label (Optional)</label><input type="text" value={homeItemForm.count || ''} onChange={e => setHomeItemForm({ ...homeItemForm, count: e.target.value })} className="w-full p-2.5 border rounded-lg" placeholder="e.g. 100+ Products" /></div>
                                </>
                            )}
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowHomeModal(false)} className="flex-1 px-4 py-3 border rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                                <button onClick={handleSaveHomeItem} className="flex-1 px-4 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-indigo-600 flex items-center justify-center gap-2"><Save size={16} /> Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminContent;
