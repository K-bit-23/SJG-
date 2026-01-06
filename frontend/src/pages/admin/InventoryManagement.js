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

            <div className="products-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id}>
                                <td>
                                    <img
                                        src={product.image || 'https://via.placeholder.com/50'}
                                        alt={product.name || 'Product'}
                                        className="product-thumb"
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                                    />
                                </td>
                                <td>{product.name || 'Unnamed Product'}</td>
                                <td>
                                    <span className="category-badge">{product.category || 'General'}</span>
                                </td>
                                <td>₹{(Number(product.price) || 0).toFixed(2)}</td>
                                <td className={(product.stock || 0) < 10 ? 'low-stock' : ''}>
                                    {product.stock || 0}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-edit" onClick={() => handleOpenModal(product)} title="Edit">
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button className="btn-delete" onClick={() => handleDelete(product.id)} title="Delete">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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

                        {errorMessage && (
                            <div className="error-banner">
                                <i className="fas fa-exclamation-circle"></i> {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Product Image</label>
                                <ImageDropzone onDrop={handleImageDrop} existingImage={formData.image} />
                            </div>
                            <div className="form-group">
                                <label>Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price (INR)</label>
                                    <div className="price-input">
                                        <span>₹</span>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Notebooks">Notebooks</option>
                                        <option value="Pens">Pens</option>
                                        <option value="Art Supplies">Art Supplies</option>
                                        <option value="Office Supplies">Office Supplies</option>
                                        <option value="Accessories">Accessories</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Stock Count</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    required
                                ></textarea>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal} disabled={isSubmitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save" disabled={isSubmitting}>
                                    {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : (editingProduct ? 'Update Product' : 'Save Product')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManagement;
