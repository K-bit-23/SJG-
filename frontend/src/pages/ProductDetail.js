import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { API_ENDPOINTS } from '../config';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [activeTab, setActiveTab] = useState('desc');

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await axios.get(`${API_ENDPOINTS.PRODUCTS}${id}/`);
            setProduct(response.data);
        } catch (error) {
            console.error("Error fetching product:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart({ ...product, quantity: qty });
            // alert("Added to cart!"); // Keeping it subtle, usually toast is better
        }
    };

    const handleBuyNow = () => {
        handleAddToCart();
        navigate('/cart');
    };

    if (loading) return <div className="pd-loading"><div className="spinner"></div></div>;
    if (!product) return <div className="pd-error">Product not found. <button onClick={() => navigate('/products')}>Go Back</button></div>;

    return (
        <div className="product-detail-page">
            <div className="pd-container">
                {/* Breadcrumbs */}
                <div className="pd-breadcrumbs">
                    <span onClick={() => navigate('/')}>Home</span> &gt;
                    <span onClick={() => navigate('/products')}>Products</span> &gt;
                    <span className="current">{product.name}</span>
                </div>

                <div className="pd-main-grid">
                    {/* Left: Images */}
                    <div className="pd-gallery">
                        <div className="pd-main-image">
                            <img src={product.image || 'https://via.placeholder.com/400'} alt={product.name} />
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="pd-info">
                        <h1 className="pd-title">{product.name}</h1>
                        <div className="pd-meta">
                            <span className="pd-category">{product.category}</span>
                            {product.stock > 0 ? <span className="pd-stock in">In Stock</span> : <span className="pd-stock out">Out of Stock</span>}
                        </div>

                        <div className="pd-price-box">
                            <span className="pd-price">₹{product.price}</span>
                        </div>

                        <div className="pd-description-short">
                            <p>{product.description ? product.description.substring(0, 150) + '...' : 'No description available.'}</p>
                        </div>

                        <div className="pd-actions">
                            <div className="qty-selector">
                                <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                                <input type="number" value={qty} readOnly />
                                <button onClick={() => setQty(qty + 1)}>+</button>
                            </div>
                            <button className="btn-add-cart" onClick={handleAddToCart}>
                                <i className="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                            <button className="btn-buy-now" onClick={handleBuyNow}>
                                Buy Now
                            </button>
                        </div>

                        <div className="pd-features">
                            <div className="feature-item">
                                <i className="fas fa-truck"></i>
                                <span>Fast Delivery</span>
                            </div>
                            <div className="feature-item">
                                <i className="fas fa-shield-alt"></i>
                                <span>Quality Guarantee</span>
                            </div>
                            <div className="feature-item">
                                <i className="fas fa-undo"></i>
                                <span>Easy Returns</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom: Tabs (Desc, Specs, Reviews) */}
                <div className="pd-tabs-section">
                    <div className="pd-tabs-header">
                        <button className={activeTab === 'desc' ? 'active' : ''} onClick={() => setActiveTab('desc')}>Description</button>
                        <button className={activeTab === 'specs' ? 'active' : ''} onClick={() => setActiveTab('specs')}>Specifications</button>
                        <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>Reviews (0)</button>
                    </div>
                    <div className="pd-tab-content">
                        {activeTab === 'desc' && (
                            <div className="tab-pane">
                                <h3>Product Details</h3>
                                <p>{product.description || "No full description available for this product."}</p>
                            </div>
                        )}
                        {activeTab === 'specs' && (
                            <div className="tab-pane">
                                <p>No specifications listed.</p>
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div className="tab-pane">
                                <p>No reviews yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
