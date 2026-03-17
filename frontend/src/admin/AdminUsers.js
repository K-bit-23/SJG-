import React from 'react';
import { UserCircle, Edit } from 'lucide-react';

const AdminUsers = ({ users }) => {
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredUsers = (Array.isArray(users) ? users : []).filter(u => {
        return (u.display_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
               (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">User Management</h3>
                    <p className="text-sm text-gray-500">View and manage registered users</p>
                </div>
                
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        placeholder="Search Name, Email…" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 ring-secondary/20 outline-none w-64"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/80 text-gray-500 text-[10px] font-bold uppercase tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-left">User</th>
                                <th className="p-4 text-left">Email</th>
                                <th className="p-4 text-left">Role</th>
                                <th className="p-4 text-left">Joined</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map(u => (
                                <tr key={u.uid} className="hover:bg-blue-50/20 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                                                {(u.display_name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-gray-800 text-sm">{u.display_name || 'User'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500 text-sm">{u.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                                            u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {u.role || 'user'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-400 text-xs font-medium">
                                        {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', {
                                            day: '2-digit', month: 'short', year: 'numeric'
                                        }) : 'N/A'}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-secondary transition-all" title="Edit User">
                                            <Edit size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-16 text-center text-gray-400">
                        <UserCircle size={48} className="mx-auto mb-4 opacity-10" />
                        <p className="font-medium text-sm">No users match your search</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
