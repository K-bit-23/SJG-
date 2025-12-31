import React from 'react';
import './Cart.css';

const Cart = ({ cart, removeFromCart, updateCart }) => {
  const getTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  return (
    <div className="cart-container">
      <div className="container">
        <h2 className="page-title">Your Cart</h2>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateCart(item.id, parseInt(e.target.value))}
                      />
                    </td>
                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                    <td>
                      <button onClick={() => removeFromCart(item.id)} className="btn-remove">
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="cart-summary">
              <h3>Cart Summary</h3>
              <p>Total: <strong>${getTotal()}</strong></p>
              <button className="btn btn-primary">Checkout</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
