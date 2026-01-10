import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useLocation, useNavigate } from 'react-router-dom';
import CheckoutForm from "../components/CheckoutForm";
import './PaymentPage.css';

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe("pk_test_TYooMQauvdEDq54NiTphI7jx");

export default function PaymentPage() {
    const [clientSecret, setClientSecret] = useState("");
    const location = useLocation();
    const navigate = useNavigate();

    // Expect orderId and amount from navigation state
    const { orderId, amount } = location.state || {};

    useEffect(() => {
        if (!orderId) {
            // Redirect if accessed directly without an order
            // navigate('/'); 
            // For debugging allow direct access but it won't work well
        }

        // Create PaymentIntent as soon as the page loads
        // Note: In production you should verify the amount on the server
        fetch("http://127.0.0.1:8000/api/create-payment-intent/", { // Use relative URL or env var
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_id: orderId }),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then((data) => setClientSecret(data.clientSecret))
            .catch((error) => console.error("Error creating payment intent:", error));
    }, [orderId]);

    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#6e8efb',
        },
    };
    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="payment-container">
            <div className="payment-card">
                <h1 className="payment-title">Secure Payment</h1>
                {amount && <div className="payment-amount">Total: ₹{amount}</div>}

                {clientSecret ? (
                    <Elements options={options} stripe={stripePromise}>
                        <CheckoutForm amount={amount} orderId={orderId} />
                    </Elements>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: '#6e8efb' }}></i>
                        <p style={{ marginTop: '10px', color: '#666' }}>Initializing secure gateway...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
