import React from 'react';
import { FaTimes } from 'react-icons/fa';
import './round-delete-button.css';

const RoundDeleteButton = ({ onClick, size = 12, className = '', style = {} }) => {
  return (
    <button
      className={`delete-button-round ${className}`}
      style={style}
      onClick={onClick}
    >
      <FaTimes size={size} />
    </button>
  );
};

export default RoundDeleteButton;
