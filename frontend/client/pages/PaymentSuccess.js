import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Home, Receipt } from 'lucide-react';
import { useCart } from '../../src/context/CartContext';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();

  const orderId = searchParams.get('order_id');
  const amount = searchParams.get('amount');

  useEffect(() => {
    // Clear the cart after successful payment
    clearCart();
  }, [clearCart]);

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your order has been placed successfully.</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="space-y-2 text-sm">
            {orderId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{orderId}</span>
              </div>
            )}
            {amount && (
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium">₹{amount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span className="text-green-600 font-medium">Completed</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleContinueShopping}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Continue Shopping</span>
          </button>

          <button
            onClick={handleViewOrders}
            className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <Receipt className="w-5 h-5" />
            <span>View Orders</span>
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>A confirmation email has been sent to your registered email address.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
