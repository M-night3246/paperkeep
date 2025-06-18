import React from 'react';

const LargeButton = ({ children, onClick, style = {}, className = "" }) => {
  const defaultStyle = {
    minHeight: '35px',
    minWidth: '100px',
    fontSize: '0.85rem',
    padding: '8px 16px',
    backgroundColor: 'var(--accent-color)',
    color: 'var(--white)',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontWeight: 'bold',
  };

  return (
    <button
      onClick={onClick}
      style={{ ...defaultStyle, ...style }}
      className={className}
    >
      {children}
    </button>
  );
};

export default LargeButton;
