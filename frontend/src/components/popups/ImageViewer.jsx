import React, { useState } from 'react';
import './image-viewer.css';

const ImageViewer = ({ src, alt = 'Image Preview' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setIsZoomed(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsZoomed(false);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    setIsZoomed((prev) => !prev);
  };

  return (
    <>
      <div className="thumbnail" onClick={handleOpen}>
        <img src={src} alt={alt} className="thumbnail-img" />
      </div>

      {isOpen && (
        <div
            className={`modal-overlay ${isZoomed ? 'zoomed' : ''}`}
            onClick={handleClose}
            >
            <img
                src={src}
                alt={alt}
                className={`modal-img ${isZoomed ? 'zoomed-img' : ''}`}
                onClick={handleImageClick}
            />
        </div>
      )}
    </>
  );
};

export default ImageViewer;
