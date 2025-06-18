import React from 'react';
import { useDropzone } from 'react-dropzone';
import './file-dropzone.css';

export default function FileDropzone({ onFileAccepted }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 1) {
        alert("Please only upload one file at a time.");
        return;
      }
      onFileAccepted(acceptedFiles[0]);
    },
    accept: {
      'image/*': [],
      'application/pdf': []
    },
    multiple: false,
  });

  return (
    <div className={`dropzone-container ${isDragActive ? 'active' : ''}`} {...getRootProps()} >
      <input {...getInputProps()} />
      <p>
        {isDragActive ? "Drop the file here..." : "Drag & drop an image or click to select"}
      </p>
    </div>
  );
}
