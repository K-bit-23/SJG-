import React, { useState, useEffect } from 'react';
import { MessageCircle, Search, Trash2, Clock, User, Send, X, RefreshCw } from 'lucide-react';
import api from '../../src/utils/api';

const AdminChat = ({ chatMessages, setChatMessages, fetchData }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(false);

    // Load messages from DB when component mounts
    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        setLoading(true);
        try {
            const res = await api.get('messages/');
            const raw = Array.isArray(res.data) ? res.data : [];
            const mapped = raw.map(m => ({
                ...m,
                sender_name: m.sender_name || m.name || 'Anonymous',
                message: m.message || m.text || ''
            }));
            setChatMessages(mapped);
        } catch (err) {
            console.error('Failed to load messages:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = (chatMessages || []).filter(m =>
        (m.sender_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.message?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const deleteMessage = async (id) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await api.delete(`messages/${id}/`);
            const updated = chatMessages.filter(m => (m.id || m._id) !== id);
            setChatMessages(updated);
            if (selectedMessage && (selectedMessage.id || selectedMessage._id) === id) {
                setSelectedMessage(null);
            }
        } catch {
            alert('Failed to delete message.');
        }
    };

    const handleReply = async () => {
        if (!replyText.trim() || !selectedMessage) return;
        try {
            await api.post('messages/reply/', {
                message_id: selectedMessage.id || selectedMessage._id,
                reply: replyText,
                to_email: selectedMessage.email
            });
            alert('Reply sent successfully!');
            setReplyText('');
        } catch {
            alert('Reply could not be sent. Check SMTP settings.');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Unknown date';
        return new Date(dateStr).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatShortDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    return (
        <div className="flex gap-5 h-[calc(100vh-160px)]">

            {/* Left: Message List */}
            <div className="w-80 bg-white rounded-2xl border border-slate-100 flex flex-col overflow-hidden shadow-sm">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageCircle size={18} className="text-indigo-600" />
                        <h3 className="text-sm font-bold text-slate-900">Messages</h3>
                        {chatMessages?.length > 0 && (
                            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                {chatMessages.length}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={loadMessages}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Refresh messages"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-3 border-b border-slate-50">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-lg text-xs outline-none text-slate-700 placeholder:text-slate-400 border border-slate-100 focus:border-indigo-300"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <RefreshCw size={24} className="animate-spin mb-3" />
                            <p className="text-xs">Loading messages...</p>
                        </div>
                    ) : filtered.length > 0 ? filtered.map(msg => {
                        const isSelected = selectedMessage && (selectedMessage.id || selectedMessage._id) === (msg.id || msg._id);
                        return (
                            <button
                                key={msg.id || msg._id}
                                onClick={() => setSelectedMessage(msg)}
                                className={`w-full text-left px-4 py-3 border-b border-slate-50 flex items-start gap-3 transition-all hover:bg-slate-50 ${isSelected ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${isSelected ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                                    {(msg.sender_name || 'A')[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-700' : 'text-slate-900'}`}>
                                            {msg.sender_name || 'Anonymous'}
                                        </span>
                                        <span className="text-[10px] text-slate-400 ml-2 shrink-0">
                                            {formatShortDate(msg.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{msg.message}</p>
                                </div>
                            </button>
                        );
                    }) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                            <MessageCircle size={32} className="text-slate-200 mb-3" />
                            <p className="text-sm font-semibold text-slate-400">No messages yet</p>
                            <p className="text-xs text-slate-300 mt-1">Customer messages will appear here</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Message Detail */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-100 flex flex-col overflow-hidden shadow-sm">
                {selectedMessage ? (
                    <>
                        {/* Detail Header */}
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                                    {(selectedMessage.sender_name || 'A')[0].toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">
                                        {selectedMessage.sender_name || 'Anonymous'}
                                    </h4>
                                    <p className="text-xs text-slate-500">
                                        {selectedMessage.email || 'No email provided'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => deleteMessage(selectedMessage.id || selectedMessage._id)}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button
                                    onClick={() => setSelectedMessage(null)}
                                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Message Body */}
                        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/40">
                            {/* Timestamp */}
                            <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                                <Clock size={12} />
                                {formatDate(selectedMessage.created_at)}
                            </div>

                            {/* Message bubble */}
                            <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm border border-slate-100 max-w-2xl mb-4">
                                <p className="text-sm text-slate-700 leading-relaxed">{selectedMessage.message}</p>
                            </div>

                            {/* Meta info */}
                            <div className="flex gap-3 mt-4">
                                {selectedMessage.phone && (
                                    <div className="bg-white rounded-xl px-3 py-2 border border-slate-100 text-xs text-slate-600">
                                        📞 {selectedMessage.phone}
                                    </div>
                                )}
                                <div className="bg-white rounded-xl px-3 py-2 border border-slate-100 text-xs text-slate-500">
                                    Source: Customer Support Form
                                </div>
                            </div>
                        </div>

                        {/* Reply Box */}
                        <div className="p-4 border-t border-slate-100 bg-white">
                            <div className="flex gap-3">
                                <textarea
                                    rows="3"
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none resize-none focus:border-indigo-400 transition-colors placeholder:text-slate-400"
                                    placeholder="Type your reply..."
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleReply(); }}
                                />
                                <button
                                    onClick={handleReply}
                                    disabled={!replyText.trim()}
                                    className="px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm font-semibold"
                                >
                                    <Send size={16} />
                                    Send
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2">Ctrl+Enter to send</p>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                            <MessageCircle size={28} className="text-indigo-300" />
                        </div>
                        <h3 className="text-base font-bold text-slate-700 mb-1">Select a message</h3>
                        <p className="text-sm text-slate-400">Choose a conversation from the left to read and reply</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChat;
