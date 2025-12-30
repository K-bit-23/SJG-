
import React from 'react';

const Product = ({ product, addToCart }) => {
  return (
    <div className="product">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button className="add-to-cart" onClick={() => addToCart(product)}>Add to Cart</button>
    </div>
  );
};

export default Product;
