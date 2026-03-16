import React, { useState } from 'react';
import { MessageCircle, Search, Trash2, CheckCircle, Clock, User, Reply, X } from 'lucide-react';
import api from '../utils/api';

const AdminChat = ({ chatMessages, setChatMessages, fetchData }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyText, setReplyText] = useState('');

    const filteredMessages = chatMessages.filter(m => 
        (m.sender_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.message?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const deleteMessage = async (id) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await api.delete(`messages/${id}/`);
            setChatMessages(chatMessages.filter(m => (m.id || m._id) !== id));
            if (selectedMessage && (selectedMessage.id || selectedMessage._id) === id) {
                setSelectedMessage(null);
            }
        } catch {
            alert('Failed to delete message');
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;
        alert('Reply feature linked to notification stream. Implementation pending SMTP link.');
        setReplyText('');
    };

    return (
        <div className="flex gap-6 h-[calc(100vh-180px)]">
            {/* Messages List */}
            <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search messages..." 
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredMessages.length > 0 ? filteredMessages.map((msg) => (
                        <button 
                            key={msg.id || msg._id}
                            onClick={() => setSelectedMessage(msg)}
                            className={`w-full text-left p-4 hover:bg-indigo-50/50 transition-all border-b border-gray-50 flex gap-3 items-start ${selectedMessage && (selectedMessage.id || selectedMessage._id) === (msg.id || msg._id) ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                <User size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="text-sm font-bold text-slate-800 truncate">{msg.sender_name || 'Anonymous'}</h4>
                                    <span className="text-[10px] text-gray-400 font-medium">
                                        {new Date(msg.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 truncate leading-relaxed">{msg.message}</p>
                            </div>
                        </button>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                            <MessageCircle className="text-gray-200 mb-3" size={40} />
                            <p className="text-sm text-gray-400 font-medium">No messages found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Message Detail View */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                {selectedMessage ? (
                    <>
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                                    <User size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{selectedMessage.sender_name || 'Guest User'}</h3>
                                    <p className="text-xs text-indigo-500 font-medium">{selectedMessage.email || 'No email provided'}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => deleteMessage(selectedMessage.id || selectedMessage._id)}
                                    className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button 
                                    onClick={() => setSelectedMessage(null)}
                                    className="p-2.5 text-gray-400 hover:bg-gray-100 rounded-xl transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                            <div className="bg-slate-50 rounded-3xl p-6 mb-8 text-slate-700 leading-relaxed relative border border-slate-100">
                                <div className="absolute -top-3 left-6 px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                                    <Clock size={10} /> {new Date(selectedMessage.created_at).toLocaleString()}
                                </div>
                                {selectedMessage.message}
                            </div>

                            {/* Info Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                                        <CheckCircle size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Source</span>
                                    </div>
                                    <p className="text-sm font-bold text-emerald-800">Support Request</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                                    <div className="flex items-center gap-2 text-amber-600 mb-2">
                                        <Clock size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Urgency</span>
                                    </div>
                                    <p className="text-sm font-bold text-amber-800">Normal</p>
                                </div>
                            </div>
                        </div>

                        {/* Reply Input */}
                        <div className="p-6 bg-slate-50 border-t border-gray-100">
                            <div className="relative group">
                                <textarea 
                                    rows="3" 
                                    className="w-full p-4 pr-16 rounded-2xl bg-white border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-sm resize-none shadow-sm"
                                    placeholder="Type your response here..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                />
                                <button 
                                    onClick={handleReply}
                                    className="absolute right-3 bottom-3 p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all group-hover:scale-105 active:scale-95"
                                >
                                    <Reply size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                            <MessageCircle className="text-slate-300" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Select a Conversation</h3>
                        <p className="text-sm text-slate-400 max-w-xs leading-relaxed">Choose a message from the list on the left to view details and send replies.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChat;
