import React, { useState } from "react";
import './upload-page.css';
import { useAuthFetch } from "../../hooks/authFetch";
import AppLayout from '../../components/layout/AppLayout';
import FileDropzone from "../../components/FileDropzone";
import LargeButton from "../../components/buttons/LargeButton";
import LoadingOverlay from "../../components/layout/LoadingOverlay";

export default function UploadFinancialDocument() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const authFetch = useAuthFetch();

  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileAccepted = (file) => {
    setSelectedFile(file);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);
    setIsUploading(true);

    try {
      const res = await authFetch(`${API_BASE_URL}/api/receipts/upload/`, {
        method: "POST",
        body: formData,
      });

      setMessage("✅ Upload successful!");
      console.log("Upload success:", res);
    } catch (err) {
      console.error("Unexpected error:", err);
      setMessage("❌ Upload failed. Something went wrong. Try again later.");

      // Try to extract error details if available
      try {
        const errorData = JSON.parse(err.message);
        if (errorData.image) {
          setMessage("❌ Image error: " + errorData.image.join(" "));
        } else if (errorData.detail) {
          setMessage("❌ Error: " + errorData.detail);
        } else {
          setMessage("❌ Upload failed. Please check all fields.");
        }
      } catch {
        setMessage("❌ Upload failed. Something went wrong. Try again later.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AppLayout>
      {isUploading && (
        <div className="upload-overlay">
          <LoadingOverlay
            messages={[
              { delay: 0, text: 'Starting upload...' },
              { delay: 3000, text: 'Processing...' },
              { delay: 20000, text: 'This process could take a while, please be patient...' },
            ]}
          />
        </div>
      )}
      <div className="upload-container">
        <h1 style={{ textAlign: "center" }}>Upload a Receipt</h1>
        {message && (
          <p className={`upload-message ${message.startsWith("❌") ? "error" : ""}`}>
            {message}
          </p>
        )}        
        <FileDropzone onFileAccepted={handleFileAccepted} />
        <LargeButton onClick={handleSubmit} style={{ marginTop: "1rem" }}>
          Submit
        </LargeButton>

        {selectedFile && (
          <div className="upload-preview" >
            <strong>Selected file:</strong> {selectedFile.name}
            {selectedFile.type.startsWith("image/") && (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="upload-image-preview"
              />
            )}
          </div>
        )}
      </div>
    </AppLayout>

  );
}
