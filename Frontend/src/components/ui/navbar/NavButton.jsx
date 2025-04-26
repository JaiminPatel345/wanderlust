import React from 'react';

const NavButton = ({
  onClick, children, variant = 'primary', disabled = false,
}) => {
  const baseStyles = 'px-4 py-2 rounded-md text-sm font-medium transition-colors';
  const variants = {
    primary: 'bg-rose-500 text-white hover:bg-rose-600 disabled:bg-rose-300',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100',
    outline: 'border border-gray-300 hover:bg-gray-50 disabled:bg-gray-50',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
};

export default NavButton; 