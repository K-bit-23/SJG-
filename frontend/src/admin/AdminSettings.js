import React from 'react';
import { Save } from 'lucide-react';

const AdminSettings = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold mb-6">Store Settings</h3>
            <div className="space-y-6 max-w-2xl">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                    <input type="text" defaultValue="SJG Stationery" className="w-full p-3 border rounded-lg focus:ring-2 ring-secondary/20 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select className="w-full p-3 border rounded-lg focus:ring-2 ring-secondary/20 outline-none">
                        <option>INR (₹)</option>
                        <option>USD ($)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                    <input type="text" defaultValue="+91 93600 24821" className="w-full p-3 border rounded-lg focus:ring-2 ring-secondary/20 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Address</label>
                    <textarea defaultValue="123, Main Street, Tech Park, Chennai - 600001" className="w-full p-3 border rounded-lg focus:ring-2 ring-secondary/20 outline-none resize-none" rows={3} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Password</label>
                    <input type="password" placeholder="Change admin password…" className="w-full p-3 border rounded-lg focus:ring-2 ring-secondary/20 outline-none" />
                    <p className="text-xs text-gray-400 mt-1">Leave blank to keep current password.</p>
                </div>
                <button className="bg-secondary text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center gap-2">
                    <Save size={18} /> Save Settings
                </button>
            </div>
        </div>
    );
};

export default AdminSettings;
