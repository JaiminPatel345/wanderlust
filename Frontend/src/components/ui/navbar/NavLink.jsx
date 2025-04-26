import React from 'react';
import { Link } from 'react-router-dom';

const NavLink = ({to, children, disabled = false, className = ''}) => (
  <Link
    to={to}
    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
      ${disabled ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'} 
      ${className}`}
  >
    {children}
  </Link>
);

export default NavLink; 