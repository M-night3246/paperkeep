import React from 'react';
import './option-modal.css';

export default function OptionModal({ isOpen, onClose, title, message, actions = [] }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        {title && <h2 className="modal-title">{title}</h2>}
        {message && <p className="modal-message">{message}</p>}
        <div className="modal-actions">
          {actions.map(({ label, onClick, style, key }, idx) => (
            <button
              key={key || idx}
              className="modal-button"
              style={style}
              onClick={onClick}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
