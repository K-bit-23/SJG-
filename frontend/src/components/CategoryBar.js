import React from 'react';
import './CategoryBar.css';
import productsData from '../data/productsData';

// Helper to get image for category
const getCategoryImage = (category) => {
    const product = productsData.find(p => p.category === category);
    return product ? product.image : 'https://via.placeholder.com/64';
};

const CategoryBar = () => {
    // Extract unique categories from productsData
    const categories = [...new Set(productsData.map(item => item.category))];

    // Add some extra "Flipkart-style" generic categories for valid look
    const displayCategories = [
        { name: 'Top Offers', image: 'https://rukminim1.flixcart.com/flap/128/128/image/f15c02bfeb02d15d.png?q=100' },
        ...categories.map(cat => ({
            name: cat,
            image: getCategoryImage(cat)
        })),
        { name: 'Printers', image: 'https://rukminim1.flixcart.com/image/612/612/Printer/j/j/t/hp-deskjet-2131-all-in-one-printer-original-imaebf9gzhy9gqh5.jpeg?q=70' }
    ];

    // Duplicate logic for seamless marquee
    // We duplicate the array 4 times to ensure enough width for large screens
    // since the item count is small
    const marqueeItems = [...displayCategories, ...displayCategories, ...displayCategories, ...displayCategories];

    return (
        <div className="category-bar-container">
            <div className="category-marquee-track">
                {marqueeItems.map((cat, index) => (
                    <div key={`${cat.name}-${index}`} className="category-item">
                        <div className="category-image">
                            <img src={cat.image} alt={cat.name} />
                        </div>
                        <span className="category-name">
                            {cat.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryBar;
