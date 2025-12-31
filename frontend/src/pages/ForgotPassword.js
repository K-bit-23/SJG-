import React from 'react';
import { Link } from 'react-router-dom';
import '../pages/ForgotPassword.css';

const ForgotPassword = () => {
  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        <h2>Forgot Password</h2>
        <p>Enter your email address to receive a password reset link.</p>
        <form>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" required />
          </div>
          <button type="submit" className="btn btn-primary">Send Reset Link</button>
        </form>
        <p>
          Remember your password? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
