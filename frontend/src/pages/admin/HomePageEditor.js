import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config';
import './HomePageEditor.css';

const HomePageEditor = () => {
    const [content, setContent] = useState({
        banners: [],
        services: [],
        trust_strip: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Modal State
    const [editingSection, setEditingSection] = useState(null); // 'banners' or 'services'
    const [editingIndex, setEditingIndex] = useState(null); // Index of item being edited
    const [editItemData, setEditItemData] = useState(null); // Temp data for the modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const response = await axios.get(API_ENDPOINTS.HOME_CONTENT);
            const data = response.data;

            // Default Fallbacks
            if (!data.banners || data.banners.length === 0) {
                data.banners = [{ title: "Premium Notebooks", price: "From ₹45", subtitle: "Classmate, Paperkraft & more", img: "" }];
            }
            if (!data.services || data.services.length === 0) {
                data.services = [{ icon: "fas fa-print", title: "High-Quality Printing", description: "Color, B&W, and Large Format", color_class: "blue-icon" }];
            }

            setContent(data);
        } catch (error) {
            console.error("Error fetching home content:", error);
            setMessage('Failed to load content.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            await axios.post(API_ENDPOINTS.HOME_CONTENT, content);
            setMessage('Content updated successfully!');
        } catch (error) {
            console.error("Error saving content:", error);
            setMessage('Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    // --- Modal Logic ---

    const openEditModal = (section, index, item) => {
        setEditingSection(section);
        setEditingIndex(index);
        setEditItemData({ ...item }); // Copy item data
        setIsModalOpen(true);
    };

    const openAddModal = (section, template) => {
        setEditingSection(section);
        setEditingIndex(-1); // New Item
        setEditItemData(template);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditItemData(null);
    };

    const saveModalChanges = () => {
        const newContent = { ...content };
        let newSection = [...newContent[editingSection]];

        if (editingIndex === -1) {
            // Add New
            newSection.push(editItemData);
        } else {
            // Update Existing
            newSection[editingIndex] = editItemData;
        }

        newContent[editingSection] = newSection;
        setContent(newContent);
        closeModal();
    };

    const removeItem = (section, index) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            const newSection = content[section].filter((_, i) => i !== index);
            setContent({ ...content, [section]: newSection });
        }
    };

    // --- Helpers for Modal Inputs ---
    const updateEditData = (field, value) => {
        setEditItemData({ ...editItemData, [field]: value });
    };

    if (loading) return <div className="p-4">Loading Editor...</div>;

    return (
        <div className="home-editor-container">
            <div className="editor-header">
                <div>
                    <h1>Edit Home Page</h1>
                    <p className="subtitle">Manage banners, services, and featured content.</p>
                </div>
                <button
                    className={`save-btn ${saving ? 'saving' : ''}`}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Publish Changes'}
                </button>
            </div>

            {message && <div className={`status-msg ${message.includes('Failed') ? 'error' : 'success'}`}>{message}</div>}

            {/* --- BANNERS SECTION (Grid View) --- */}
            <section className="editor-section">
                <div className="section-header">
                    <h2>Hero Banners</h2>
                    <button className="add-btn-small" onClick={() => openAddModal('banners', { title: '', subtitle: '', price: '', img: '' })}>
                        <i className="fas fa-plus"></i> Add Banner
                    </button>
                </div>

                <div className="items-list-view">
                    {content.banners.map((banner, index) => (
                        <div key={index} className="item-row">
                            <div className="item-preview">
                                {banner.img ? <img src={banner.img} alt="Thumb" /> : <div className="no-img"><i className="fas fa-image"></i></div>}
                            </div>
                            <div className="item-info">
                                <h3>{banner.title || 'Untitled Banner'}</h3>
                                <p>{banner.subtitle}</p>
                            </div>
                            <div className="item-actions">
                                <button className="icon-btn edit" onClick={() => openEditModal('banners', index, banner)}>
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button className="icon-btn delete" onClick={() => removeItem('banners', index)}>
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                    {content.banners.length === 0 && <div className="empty-state">No banners yet.</div>}
                </div>
            </section>

            {/* --- SERVICES SECTION (Grid View) --- */}
            <section className="editor-section">
                <div className="section-header">
                    <h2>Services</h2>
                    <button className="add-btn-small" onClick={() => openAddModal('services', { title: '', description: '', icon: 'fas fa-star', color_class: 'blue-icon' })}>
                        <i className="fas fa-plus"></i> Add Service
                    </button>
                </div>

                <div className="items-list-view">
                    {content.services.map((service, index) => (
                        <div key={index} className="item-row">
                            <div className={`item-icon ${service.color_class}`}>
                                <i className={service.icon}></i>
                            </div>
                            <div className="item-info">
                                <h3>{service.title || 'Untitled Service'}</h3>
                                <p>{service.description}</p>
                            </div>
                            <div className="item-actions">
                                <button className="icon-btn edit" onClick={() => openEditModal('services', index, service)}>
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button className="icon-btn delete" onClick={() => removeItem('services', index)}>
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- MODAL --- */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content-box">
                        <div className="modal-header">
                            <h2>{editingIndex === -1 ? 'Add New' : 'Edit'} {editingSection === 'banners' ? 'Banner' : 'Service'}</h2>
                            <button className="close-btn" onClick={closeModal}><i className="fas fa-times"></i></button>
                        </div>

                        <div className="modal-body scrollable">
                            {editingSection === 'banners' && (
                                <>
                                    <div className="form-group">
                                        <label>Banner Title</label>
                                        <input type="text" value={editItemData.title} onChange={(e) => updateEditData('title', e.target.value)} placeholder="e.g. Premium Notebooks" />
                                    </div>
                                    <div className="form-group">
                                        <label>Subtitle / Description</label>
                                        <input type="text" value={editItemData.subtitle} onChange={(e) => updateEditData('subtitle', e.target.value)} placeholder="e.g. Classmate, Paperkraft..." />
                                    </div>
                                    <div className="form-group">
                                        <label>Price / Tag</label>
                                        <input type="text" value={editItemData.price} onChange={(e) => updateEditData('price', e.target.value)} placeholder="e.g. From ₹45" />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group half">
                                            <label>Status</label>
                                            <select value="active">
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                        <div className="form-group half">
                                            <label>Priority</label>
                                            <select value="1">
                                                <option value="1">High</option>
                                                <option value="2">Medium</option>
                                                <option value="3">Low</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Image URL</label>
                                        <input type="text" value={editItemData.img} onChange={(e) => updateEditData('img', e.target.value)} placeholder="https://..." />
                                        {editItemData.img && <img src={editItemData.img} alt="Preview" className="img-preview-large" />}
                                    </div>
                                </>
                            )}

                            {editingSection === 'services' && (
                                <>
                                    <div className="form-group">
                                        <label>Service Title</label>
                                        <input type="text" value={editItemData.title} onChange={(e) => updateEditData('title', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea rows="3" value={editItemData.description} onChange={(e) => updateEditData('description', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Icon Class (FontAwesome)</label>
                                        <input type="text" value={editItemData.icon} onChange={(e) => updateEditData('icon', e.target.value)} placeholder="fas fa-star" />
                                    </div>
                                    <div className="form-group">
                                        <label>Color Theme</label>
                                        <select value={editItemData.color_class} onChange={(e) => updateEditData('color_class', e.target.value)}>
                                            <option value="blue-icon">Blue</option>
                                            <option value="orange-icon">Orange</option>
                                            <option value="green-icon">Green</option>
                                            <option value="purple-icon">Purple</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={closeModal}>Cancel</button>
                            <button className="confirm-btn" onClick={saveModalChanges}>Save Item</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePageEditor;
