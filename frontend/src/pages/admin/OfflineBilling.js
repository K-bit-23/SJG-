import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { API_BASE_URL } from '../../config';
import './OfflineBilling.css';

const OfflineBilling = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [customerMobile, setCustomerMobile] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [isCustomMode, setIsCustomMode] = useState(false);
    const [customName, setCustomName] = useState('');
    const [customPrice, setCustomPrice] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/products/`);
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        setSearchTerm(product.name);
        setIsDropdownOpen(false);
        setQuantity(1);
    };

    const handleAddItem = (e) => {
        e.preventDefault();

        let itemToAdd;

        if (isCustomMode) {
            if (!customName || !customPrice) return alert("Please enter custom name and price");
            itemToAdd = {
                id: `custom - ${Date.now()} `,
                name: customName,
                price: parseFloat(customPrice),
                image: '/placeholder.png'
            };
        } else {
            if (!selectedProduct) return alert("Please select a product");
            itemToAdd = selectedProduct;
        }

        if (quantity < 1) return alert("Quantity must be at least 1");

        const q = parseInt(quantity);
        const existing = cart.find(item => item.id === itemToAdd.id);
        if (existing) {
            setCart(cart.map(item => item.id === itemToAdd.id ? { ...item, quantity: item.quantity + q } : item));
        } else {
            setCart([...cart, { ...itemToAdd, quantity: q }]);
        }

        // Reset Form
        setSelectedProduct(null);
        setSearchTerm('');
        setQuantity(1);
        setCustomName('');
        setCustomPrice('');
        setIsCustomMode(false);
    };

    const removeFromBill = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, qty) => {
        if (qty < 1) return;
        setCart(cart.map(item => item.id === productId ? { ...item, quantity: qty } : item));
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handlePrint = () => {
        window.print();
    };

    const generatePDF = async (shouldDownload = true) => {
        const element = document.getElementById('printable-area');
        const canvas = await html2canvas(element, {
            scale: 3, // Increased from 2 to 3 for ultra-sharp high-resolution output
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff"
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        if (shouldDownload) {
            pdf.save(`Bill_${customerName || 'Customer'}.pdf`);
        }
        return pdf;
    };

    const shareOnWhatsApp = async (includePDF = false) => {
        if (!customerMobile) return alert("Please enter customer mobile number first!");

        let pdfUrl = "";

        if (includePDF) {
            setIsUploading(true);
            try {
                const pdf = await generatePDF(false);
                const pdfBlob = pdf.output('blob');
                const file = new File([pdfBlob], `Bill_${customerName || 'Customer'}.pdf`, { type: 'application/pdf' });

                // Try Primary API (file.io)
                const formData = new FormData();
                formData.append('file', pdfBlob);

                try {
                    const res = await fetch('https://file.io/?expires=1h', { method: 'POST', body: formData });
                    const data = await res.json();
                    if (data.success) pdfUrl = data.link;
                } catch (e) {
                    console.error("file.io failed, trying fallback...");
                    // Try Fallback API (tmpfiles.org)
                    const formData2 = new FormData();
                    formData2.append('file', file);
                    const res2 = await fetch('https://tmpfiles.org/api/v1/upload', { method: 'POST', body: formData2 });
                    const data2 = await res2.json();
                    if (data2.status === 'success') {
                        pdfUrl = data2.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
                    }
                }

                if (!pdfUrl) alert("Could not generate digital link. Sending summary only.");
            } catch (err) {
                console.error("Link generation failed:", err);
            } finally {
                setIsUploading(false);
            }
        }

        const total = calculateTotal();
        let message = `* SJG STATIONERY - DIGITAL INVOICE *\n\n`;
        message += `👤 * Customer:* ${customerName || 'Valued Customer'} \n`;
        message += `📅 * Date:* ${new Date().toLocaleDateString()} \n`;
        if (pdfUrl) {
            message += `\n📦 * Download Bill:* ${pdfUrl} \n`;
        }
        message += `\n----------------------------\n`;
        cart.forEach(item => {
            message += `${item.name} x ${item.quantity} = ₹${item.price * item.quantity} \n`;
        });
        message += `----------------------------\n`;
        message += `💰 * Total Amount: ₹${total.toLocaleString('en-IN')}*\n\n`;
        message += `Thank you for shopping with us!`;

        const encodedMsg = encodeURIComponent(message);
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const whatsappUrl = isMobile
            ? `https://wa.me/91${customerMobile}?text=${encodedMsg}`
            : `https://web.whatsapp.com/send?phone=91${customerMobile}&text=${encodedMsg}`;

        window.open(whatsappUrl, '_blank');
    };

    const handleSaveOrder = async () => {
        if (cart.length === 0) return alert("Cart is empty!");

        const orderData = {
            customer_email: customerMobile ? `${customerMobile}@offline.com` : 'offline@store.com',
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            })),
            total_amount: calculateTotal(),
            status: 'Delivered',
            order_type: 'offline'
        };

        try {
            await axios.post(`${API_BASE_URL}/api/orders/`, orderData);
            alert("Bill Saved Successfully!");
            setCart([]);
            setCustomerName('');
            setCustomerMobile('');
        } catch (error) {
            console.error("Error saving bill:", error);
            alert("Failed to save bill.");
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="billing-page">
            {/* Left Panel: Entry Form & Cart */}
            <div className="billing-form-section no-print">
                <div className="add-item-card">
                    <div className="card-header-flex">
                        <h2><i className="fas fa-cart-plus"></i> Add Item</h2>
                        <button
                            className={`btn-toggle-mode ${isCustomMode ? 'active' : ''}`}
                            onClick={() => setIsCustomMode(!isCustomMode)}
                        >
                            <i className={isCustomMode ? "fas fa-keyboard" : "fas fa-search"}></i>
                            {isCustomMode ? ' Custom' : ' Inventory'}
                        </button>
                    </div>

                    <form onSubmit={handleAddItem}>
                        <div className="form-group-section">
                            <label className="section-label">Customer Details</label>
                            <div className="form-row">
                                <div className="form-group">
                                    <input
                                        className="form-control"
                                        placeholder="Customer Name"
                                        value={customerName}
                                        onChange={e => setCustomerName(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <div className="mobile-input-wrapper">
                                        <input
                                            className="form-control"
                                            placeholder="Mobile Number"
                                            value={customerMobile}
                                            onChange={e => setCustomerMobile(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="btn-open-wa"
                                            onClick={() => customerMobile && window.open(`https://wa.me/91${customerMobile}`, '_blank')}
                                            title="Open Chat"
                                        >
                                            <i className="fab fa-whatsapp"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-group-section mt-10">
                            <label className="section-label">Item Selection</label>
                            {isCustomMode ? (
                                <div className="form-group">
                                    <input
                                        className="form-control"
                                        placeholder="Type item name..."
                                        value={customName}
                                        onChange={e => setCustomName(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            ) : (
                                <div className="form-group relative">
                                    <div className="custom-select-wrapper">
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setIsDropdownOpen(true);
                                                setSelectedProduct(null);
                                            }}
                                            onFocus={() => setIsDropdownOpen(true)}
                                            className="form-control"
                                        />
                                        {isDropdownOpen && filteredProducts.length > 0 && (
                                            <div className="dropdown-list">
                                                {filteredProducts.map(product => (
                                                    <div
                                                        key={product.id}
                                                        className="dropdown-item"
                                                        onClick={() => handleProductSelect(product)}
                                                    >
                                                        <img src={product.image} alt="" />
                                                        <span>{product.name}</span>
                                                        <span className="price-tag">₹{product.price}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price (₹)</label>
                                    <input
                                        type="number"
                                        value={isCustomMode ? customPrice : (selectedProduct ? selectedProduct.price : '')}
                                        onChange={e => isCustomMode && setCustomPrice(e.target.value)}
                                        readOnly={!isCustomMode}
                                        className={`form-control ${!isCustomMode ? 'bg-light' : ''}`}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="form-control"
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn-add-item">
                            <i className="fas fa-plus"></i> Add Item to Bill
                        </button>
                    </form>
                </div>

                <div className="billing-actions-card">
                    <div className="billing-actions">
                        <div className="actions-main">
                            <button className="btn-whatsapp-bill primary" disabled={isUploading} onClick={async () => {
                                handleSaveOrder();
                                await shareOnWhatsApp(true);
                            }}>
                                <i className={isUploading ? "fas fa-spinner fa-spin" : "fab fa-whatsapp"}></i>
                                {isUploading ? " Processing..." : " Save & WhatsApp PDF"}
                            </button>
                        </div>
                        <div className="actions-grid">
                            <button className="btn-print-bill" onClick={handlePrint}>
                                <i className="fas fa-print"></i> Print
                            </button>
                            <button className="btn-pdf-bill" onClick={() => generatePDF(true)}>
                                <i className="fas fa-file-pdf"></i> PDF
                            </button>
                            <button className="btn-save-bill" onClick={handleSaveOrder}>
                                <i className="fas fa-save"></i> Save
                            </button>
                            <button className="btn-clear-bill" onClick={() => {
                                if (window.confirm("Clear current bill?")) {
                                    setCart([]);
                                    setCustomerName('');
                                    setCustomerMobile('');
                                }
                            }}>
                                <i className="fas fa-redo"></i> Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Invoice Preview */}
            <div className="billing-invoice-section">
                <div className="pos-total-ribbon-fixed no-print">
                    <span className="label">Amount Due:</span>
                    <span className="value">₹{calculateTotal().toLocaleString('en-IN')}</span>
                </div>

                <div className="invoice-paper" id="printable-area">
                    <div className="invoice-inner-layout">
                        <header className="modal-invoice-header">
                            <div className="brand-header-layout">
                                <div className="brand-main-info">
                                    <img src="/sjg-logo.jpg" alt="Logo" className="invoice-brand-logo" />
                                </div>
                                <div className="brand-invoice-label">
                                    <h1 className="modern-invoice-title">INVOICE</h1>
                                </div>
                            </div>
                        </header>

                        <div className="invoice-meta-bar">
                            <div className="meta-item">
                                <span className="meta-label">DATEISSUED:</span>
                                <span className="meta-value">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div className="meta-item text-right">
                                <span className="meta-label">INVOICE#:</span>
                                <span className="meta-value">{Math.floor(Math.random() * 90000) + 10000}</span>
                            </div>
                        </div>

                        <div className="invoice-billing-grid">
                            <div className="billing-col from">
                                <span className="billing-label">BILL FROM</span>
                                <h2 className="billing-name">SJG STATIONERY</h2>
                                <p className="billing-detail">Quality Office & School Supplies</p>
                                <p className="billing-detail">Sakthi Nagar, Thindal, Erode - 638012</p>
                                <p className="billing-detail">Phone: +91 93600 24821</p>
                            </div>
                            <div className="billing-col to text-right">
                                <span className="billing-label">BILL TO</span>
                                <h2 className="billing-name">{customerName || 'Walk-in Customer'}</h2>
                                <div className="billing-detail-stack">
                                    <p className="billing-detail">{customerMobile ? `+91 ${customerMobile}` : 'Mobile: Not Provided'}</p>
                                    <p className="billing-detail">Thindal, Erode, Tamil Nadu</p>
                                </div>
                            </div>
                        </div>

                        <div className="invoice-grid-container">
                            <table className="replica-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '80px' }}>NO</th>
                                        <th>DESCRIPTION</th>
                                        <th style={{ width: '80px' }}>QTY</th>
                                        <th style={{ width: '120px' }}>PRICE</th>
                                        <th style={{ width: '140px' }}>SUBTOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map((item, index) => (
                                        <tr key={index}>
                                            <td className="text-center">{index + 1}</td>
                                            <td className="desc-cell">{item.name}</td>
                                            <td className="text-center">
                                                <div className="qty-control-inline no-print">
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                                    <span>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                                </div>
                                                <span className="print-only">{item.quantity}</span>
                                            </td>
                                            <td className="text-center">₹{item.price.toLocaleString('en-IN')}</td>
                                            <td className="text-center">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))}
                                    {[...Array(Math.max(0, 10 - cart.length))].map((_, i) => (
                                        <tr key={`pad-${i}`} className="filler-row">
                                            <td className="filler">&nbsp;</td>
                                            <td className="filler">&nbsp;</td>
                                            <td className="filler">&nbsp;</td>
                                            <td className="filler">&nbsp;</td>
                                            <td className="filler">&nbsp;</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="invoice-summary-replica">
                            <div className="summary-spacer"></div>
                            <div className="summary-row-bold">
                                <span>GRAND TOTAL</span>
                                <span className="grand-total-val">₹{calculateTotal().toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <footer className="invoice-footer-replica">
                            <div className="footer-thanks">
                                <p>Thank you for your business!</p>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfflineBilling;
