import React from 'react';
import { UserCircle, Edit } from 'lucide-react';

const AdminUsers = ({ users }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold mb-6">User Management</h3>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 text-gray-600 text-sm">
                        <tr>
                            <th className="p-3 text-left">User</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Role</th>
                            <th className="p-3 text-left">Joined</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {Array.isArray(users) && users.map(u => (
                            <tr key={u.uid} className="hover:bg-gray-50">
                                <td className="p-3 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                                        <UserCircle size={18} />
                                    </div>
                                    <span className="font-medium">{u.display_name || 'User'}</span>
                                </td>
                                <td className="p-3 text-gray-600">{u.email}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="p-3 text-gray-500 text-sm">
                                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="p-3 text-right">
                                    <button className="p-2 hover:bg-gray-100 rounded text-gray-500"><Edit size={16} /></button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-400">No users found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
