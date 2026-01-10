import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import './ChatBotSettings.css';

const ChatBotSettings = () => {
    const [config, setConfig] = useState({
        welcome_message: '',
        quick_replies: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newReply, setNewReply] = useState('');

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/content/chatbot/`);
            setConfig(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(`${API_BASE_URL}/api/content/chatbot/`, config);
            alert('Settings Saved!');
        } catch (error) {
            console.error(error);
            alert('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    const addReply = () => {
        if (!newReply.trim()) return;
        setConfig(prev => ({
            ...prev,
            quick_replies: [...prev.quick_replies, newReply.trim()]
        }));
        setNewReply('');
    };

    const removeReply = (index) => {
        setConfig(prev => ({
            ...prev,
            quick_replies: prev.quick_replies.filter((_, i) => i !== index)
        }));
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div className="chat-settings-container">
            <h2 className="page-title">Chat Bot Configuration</h2>

            <div className="settings-card">
                <div className="form-group">
                    <label>Welcome Message</label>
                    <textarea
                        className="form-control"
                        rows="3"
                        value={config.welcome_message}
                        onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
                    />
                    <small>This message appears when the user opens the chat.</small>
                </div>

                <div className="form-group">
                    <label>Quick Replies ({config.quick_replies.length})</label>
                    <div className="quick-reply-list">
                        {config.quick_replies.map((reply, idx) => (
                            <div key={idx} className="reply-pill">
                                <span>{reply}</span>
                                <button onClick={() => removeReply(idx)}><i className="fas fa-times"></i></button>
                            </div>
                        ))}
                    </div>

                    <div className="add-reply-box">
                        <input
                            type="text"
                            placeholder="Add new reply option..."
                            value={newReply}
                            onChange={(e) => setNewReply(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addReply()}
                        />
                        <button onClick={addReply} className="btn-add">Add</button>
                    </div>
                </div>

                <div className="actions-footer">
                    <button className="btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBotSettings;
