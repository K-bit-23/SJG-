import React from 'react';
import { Link } from 'react-router-dom';
import '../pages/Login.css';

const Login = () => {
  const handleGoogleLogin = () => {
    // Handle Google login logic here
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        <form>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" required />
          </div>
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
        <div className="separator">or</div>
        <button onClick={handleGoogleLogin} className="btn-google">
          <i className="fab fa-google"></i> Login with Google
        </button>
        <p>
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
