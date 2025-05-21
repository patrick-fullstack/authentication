import React from 'react';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  fullWidth?: boolean;
}

export default function Button({
  type = 'button',
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  fullWidth = false,
}: ButtonProps) {
  const baseStyle = 'flex justify-center items-center py-2 px-4 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200';
  
  const variantStyles = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent focus:ring-indigo-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 border-transparent focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent focus:ring-red-500',
  };
  
  const disabledStyle = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      className={`${baseStyle} ${variantStyles[variant]} ${disabledStyle} ${widthClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}