
import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/orders">Orders</a></li>
        <li><a href="/categories">Categories</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;
