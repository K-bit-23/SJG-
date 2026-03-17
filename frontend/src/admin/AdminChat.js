import React, { useState } from 'react';
import { MessageCircle, Search, Trash2, CheckCircle, Clock, User, Reply, X, Command, Activity } from 'lucide-react';
import api from '../../src/utils/api';
import { useNotifications } from '../context/NotificationContext';

const AdminChat = ({ chatMessages, setChatMessages, fetchData }) => {
    const { showAlert, showToast } = useNotifications();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyText, setReplyText] = useState('');

    const filteredMessages = (chatMessages || []).filter(m => 
        (m.sender_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.message?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const deleteMessage = async (id) => {
        if (!window.confirm('Delete this signal?')) return;
        try {
            await api.delete(`messages/${id}/`);
            setChatMessages(chatMessages.filter(m => (m.id || m._id) !== id));
            if (selectedMessage && (selectedMessage.id || selectedMessage._id) === id) {
                setSelectedMessage(null);
            }
        } catch {
            console.error('Failed to delete message');
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;
        showAlert('Reply stream offline. SMTP integration required for external communication.', 'warning', 'SMTP Offline');
        setReplyText('');
    };

    return (
        <div className="flex gap-10 h-[calc(100vh-220px)] animate-fade-in-up">
            
            {/* Signal Stream List */}
            <div className="w-[380px] bg-white dark:bg-[#0f172a] rounded-[3rem] shadow-sm border border-slate-100 dark:border-white/5 flex flex-col overflow-hidden">
                <div className="p-8 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-transparent">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tighter mb-6">
                        <Activity size={20} className="text-indigo-600" /> 
                        Signal Ingress
                    </h3>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Query signals..." 
                            className="w-full pl-12 pr-6 py-3.5 bg-white dark:bg-slate-800 border-none rounded-2xl text-xs font-black text-slate-900 dark:text-white outline-none focus:ring-1 ring-indigo-500/50 shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                    {filteredMessages.length > 0 ? filteredMessages.map((msg) => (
                        <button 
                            key={msg.id || msg._id}
                            onClick={() => setSelectedMessage(msg)}
                            className={`w-full text-left p-6 rounded-[2rem] transition-all duration-300 flex gap-4 items-start group ${selectedMessage && (selectedMessage.id || selectedMessage._id) === (msg.id || msg._id) ? 'bg-indigo-600 shadow-xl shadow-indigo-600/20 translate-x-1' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${selectedMessage && (selectedMessage.id || selectedMessage._id) === (msg.id || msg._id) ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                <User size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className={`text-sm font-black tracking-tight truncate ${selectedMessage && (selectedMessage.id || selectedMessage._id) === (msg.id || msg._id) ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                        {msg.sender_name || 'Anonymous Entity'}
                                    </h4>
                                    <span className={`text-[9px] font-bold uppercase tracking-widest ${selectedMessage && (selectedMessage.id || selectedMessage._id) === (msg.id || msg._id) ? 'text-white/60' : 'text-slate-400'}`}>
                                        {msg.created_at ? new Date(msg.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A'}
                                    </span>
                                </div>
                                <p className={`text-[11px] font-medium truncate leading-relaxed ${selectedMessage && (selectedMessage.id || selectedMessage._id) === (msg.id || msg._id) ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {msg.message}
                                </p>
                            </div>
                        </button>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 opacity-30">
                                <MessageCircle className="text-slate-400" size={32} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No Signal Data</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Signal Terminal View */}
            <div className="flex-1 bg-white dark:bg-[#0f172a] rounded-[3.5rem] shadow-sm border border-slate-100 dark:border-white/5 flex flex-col overflow-hidden relative">
                {selectedMessage ? (
                    <>
                        <div className="p-10 border-b border-slate-50 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-transparent backdrop-blur-md">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-600/20 group hover:scale-105 transition-transform duration-500">
                                    <User size={28} className="group-hover:rotate-6 transition-transform" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{selectedMessage.sender_name || 'Guest Identity'}</h3>
                                    <p className="text-[11px] text-indigo-600 font-bold uppercase tracking-[0.2em] mt-2 italic">{selectedMessage.email || 'Communication address not verified'}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => deleteMessage(selectedMessage.id || selectedMessage._id)}
                                    className="w-12 h-12 flex items-center justify-center text-rose-500 bg-rose-50 dark:bg-rose-500/10 rounded-2xl hover:bg-rose-500 hover:text-white shadow-sm transition-all duration-300"
                                >
                                    <Trash2 size={20} />
                                </button>
                                <button 
                                    onClick={() => setSelectedMessage(null)}
                                    className="w-12 h-12 flex items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-900 hover:text-white shadow-sm transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-transparent">
                            <div className="max-w-3xl">
                                <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] mb-10 text-slate-700 dark:text-slate-200 text-lg font-medium leading-[1.8] relative border border-slate-100 dark:border-white/5 shadow-sm">
                                    <div className="absolute -top-4 left-10 px-5 py-2 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 shadow-lg">
                                        <Clock size={12} /> {new Date(selectedMessage.created_at).toLocaleString()}
                                    </div>
                                    <p className="first-letter:text-4xl first-letter:font-black first-letter:text-indigo-600 first-letter:mr-1 first-letter:float-left">{selectedMessage.message}</p>
                                </div>

                                {/* Meta Data Grid */}
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 group transition-all hover:shadow-lg hover:shadow-emerald-500/5">
                                        <div className="flex items-center gap-3 text-emerald-600 mb-3">
                                            <CheckCircle size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-500">Telemetry Origin</span>
                                        </div>
                                        <p className="text-lg font-black text-emerald-900 dark:text-emerald-400 tracking-tight">Support Ingress</p>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 group transition-all hover:shadow-lg hover:shadow-amber-500/5">
                                        <div className="flex items-center gap-3 text-amber-600 mb-3">
                                            <Command size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-700 dark:text-amber-500">Urgency Protocol</span>
                                        </div>
                                        <p className="text-lg font-black text-amber-900 dark:text-amber-400 tracking-tight">Standard Priority</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reply Terminal */}
                        <div className="p-10 bg-white dark:bg-slate-800/50 border-t border-slate-100 dark:border-white/5 backdrop-blur-md">
                            <div className="relative group">
                                <textarea 
                                    rows="4" 
                                    className="w-full p-8 pr-24 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-transparent focus:border-indigo-500/30 outline-none transition-all text-sm font-medium text-slate-800 dark:text-white resize-none shadow-inner scrollbar-none"
                                    placeholder="Type tactical response..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                />
                                <button 
                                    onClick={handleReply}
                                    className="absolute right-6 bottom-6 w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/30 hover:bg-slate-950 transition-all flex items-center justify-center group-hover:scale-105 active:scale-95"
                                >
                                    <Reply size={24} />
                                </button>
                                <div className="absolute left-8 bottom-6 flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-40">
                                    <Command size={10} /> Shift + Enter to transmit
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100 dark:border-white/5 group hover:rotate-6 transition-transform duration-700">
                            <MessageCircle className="text-slate-300 dark:text-slate-600" size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">Signal Selection Required</h3>
                        <p className="text-xs text-slate-400 max-w-xs leading-relaxed font-bold uppercase tracking-widest opacity-60">Awaiting user-entity interaction trace</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChat;
