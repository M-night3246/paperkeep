import React from 'react';
import { FaTimes } from 'react-icons/fa';
import './round-delete-button.css';

const RoundDeleteButton = ({ onClick, size = 12, className = '', style = {}, shape = 'round' }) => {
  const shapeClass = shape === 'rect' ? 'delete-button-rect' : 'delete-button-round';

  return (
    <button
      className={`${shapeClass} ${className}`}
      style={style}
      onClick={onClick}
    >
      <FaTimes size={size} />
    </button>
  );
};

export default RoundDeleteButton;
