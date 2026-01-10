import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import ImageDropzone from '../../components/admin/ImageDropzone'; // Corrected import path
import './InventoryManagement.css';

const InventoryManagement = () => {
    const { products, addProduct, updateProduct, deleteProduct } = useProducts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        product_code: '',
        price: '',
        category: '',
        stock: 0,
        description: '',
        image: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                product_code: product.product_code || '',
                price: product.price,
                category: product.category,
                stock: product.stock || 0,
                description: product.description,
                image: product.image
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                product_code: '',
                price: '',
                category: '',
                stock: 0,
                description: '',
                image: null
            });
        }
        setErrorMessage('');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setErrorMessage('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageDrop = (image) => {
        setFormData(prev => ({
            ...prev,
            image: image
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock)
        };

        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, productData);
            } else {
                await addProduct(productData);
            }
            handleCloseModal();
        } catch (error) {
            console.error('Action failed:', error);
            // Formulate a readable error message
            let msg = 'Failed to save product. ';
            if (typeof error === 'object') {
                msg += Object.entries(error).map(([key, val]) => `${key}: ${val}`).join(', ');
            } else {
                msg += error;
            }
            setErrorMessage(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id);
            } catch (error) {
                alert('Failed to delete product: ' + (typeof error === 'object' ? JSON.stringify(error) : error));
            }
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Inventory Management</h1>
                <div className="header-actions">
                    <button className="btn-report" onClick={() => window.print()}>
                        <i className="fas fa-file-alt"></i> Generate Report
                    </button>
                    <button className="btn-add" onClick={() => handleOpenModal()}>
                        <i className="fas fa-plus"></i> Add New Product
                    </button>
                </div>
            </div>

            <div className="search-bar">
                <i className="fas fa-search"></i>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Modern Card Grid */}
            <div className="inventory-grid">
                {filteredProducts.map(product => (
                    <div key={product.id} className="product-card-modern">
                        {/* Product Image */}
                        <div className="product-image-container">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="product-image-modern" />
                            ) : (
                                <div className="no-image-placeholder">
                                    <i className="fas fa-image"></i>
                                    <span>No Image</span>
                                </div>
                            )}
                            <div className="product-actions-overlay">
                                <button
                                    className="action-btn-modern edit"
                                    onClick={() => handleOpenModal(product)}
                                    title="Edit"
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button
                                    className="action-btn-modern delete"
                                    onClick={() => handleDelete(product.id)}
                                    title="Delete"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                            {(product.stock || 0) < 10 && (
                                <div className="low-stock-badge">Low Stock</div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="product-card-body">
                            <h3 className="product-name-modern">{product.name || 'Unnamed Product'}</h3>

                            <div className="product-meta-row">
                                {product.product_code && (
                                    <span className="product-code-tag">
                                        <i className="fas fa-barcode"></i> {product.product_code}
                                    </span>
                                )}
                                <span className="category-tag-modern">{product.category || 'General'}</span>
                            </div>

                            <div className="product-footer-row">
                                <div className="price-section">
                                    <span className="price-label">Price</span>
                                    <span className="price-value">₹{(Number(product.price) || 0).toFixed(2)}</span>
                                </div>
                                <div className="stock-section">
                                    <span className="stock-label">Stock</span>
                                    <span className={`stock-value ${(product.stock || 0) < 10 ? 'low' : ''}`}>
                                        {product.stock || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button className="btn-close" onClick={handleCloseModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            {errorMessage && (
                                <div className="error-banner">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errorMessage}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {/* Horizontal Layout */}
                                <div className="modal-horizontal-layout">
                                    {/* Left Side - Image Upload */}
                                    <div className="modal-left-section">
                                        <label>Product Image</label>
                                        <ImageDropzone onDrop={handleImageDrop} existingImage={formData.image} />
                                    </div>

                                    {/* Right Side - Form Fields */}
                                    <div className="modal-right-section">
                                        <div className="form-group">
                                            <label>Product Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Product Code / SKU</label>
                                            <input
                                                type="text"
                                                name="product_code"
                                                value={formData.product_code}
                                                onChange={handleChange}
                                                placeholder="e.g., NB-001, PEN-RED-12"
                                            />
                                            <small>Optional: Unique identifier for inventory tracking</small>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Price (INR) *</label>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleChange}
                                                    step="0.01"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Stock *</label>
                                                <input
                                                    type="number"
                                                    name="stock"
                                                    value={formData.stock}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Category *</label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                <option value="Notebooks">Notebooks</option>
                                                <option value="Pens">Pens</option>
                                                <option value="Pencils">Pencils</option>
                                                <option value="Art Supplies">Art Supplies</option>
                                                <option value="Office Supplies">Office Supplies</option>
                                                <option value="School Supplies">School Supplies</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows="3"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="modal-footer">
                                    <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-save" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManagement;
