import React from 'react';
import { useDropzone } from 'react-dropzone';
import './file-dropzone.css';

export default function FileDropzone({ onFileAccepted, multiple=true }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      if (multiple) {
        onFileAccepted(acceptedFiles);
      } else if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0]);
      }
    },
    accept: {
      'image/*': [],
      'application/pdf': []
    },
    multiple: multiple,
  });

  return (
    <div className={`dropzone-container ${isDragActive ? 'active' : ''}`} {...getRootProps()} >
      <input {...getInputProps()} />
      <p>
        {isDragActive ? "Drop the file here..." : `Drag & drop ${multiple ? 'files' : 'a file'} or click to select`}
      </p>
    </div>
  );
}
