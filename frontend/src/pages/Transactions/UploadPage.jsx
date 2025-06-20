import React, { useState } from "react";
import './upload-page.css';
import { useAuthFetch } from "../../hooks/authFetch";
import AppLayout from '../../components/layout/AppLayout';
import FileDropzone from "../../components/file/FileDropzone";
import LargeButton from "../../components/buttons/LargeButton";
import RoundDeleteButton from "../../components/buttons/RoundDeleteButton";
import LoadingOverlay from "../../components/layout/LoadingOverlay";
import OptionModal from "../../components/popups/OptionModal";
import { FaTimes } from 'react-icons/fa';
import { useNavigate } from "react-router";

export default function UploadFinancialDocument() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const authFetch = useAuthFetch();
  const navigate = useNavigate();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [succeededUploads, setSucceededUploads] = useState([]);

  const handleFilesAccepted = (files) => {
    setSelectedFiles(prev => {
      const existingNames = new Set(prev.map(file => file.name));
      const filteredNewFiles = files.filter(file => !existingNames.has(file.name));
      return [...prev, ...filteredNewFiles];
    });
    setMessage('');
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setMessage("Please select at least one file to upload.");
      return;
    }

    const succeeded = [];
    const failed = [];

    setIsUploading(true);
    setMessage("");

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await authFetch(`${API_BASE_URL}/api/receipts/upload/`, {
          method: "POST",
          body: formData,
        });

        if (Array.isArray(res)) {
          res.forEach((result) => {
            if (result.status === "success") {
              succeeded.push({
                filename: result.filename || file.name,
                docId: result.document?.id,
              });
            } else {
              failed.push({
                filename: result.filename || file.name,
                error: result.error?.details || result.error || "Unknown error",
              });
            }
          });
        } else {
          failed.push({ filename: file.name, error: res?.error || "Unknown response format" });
        }
      } catch (err) {
        console.error("Upload failed for:", file.name, err);
        failed.push({ filename: file.name, error: err.message });
      }
    }

    // Format the message summary
    let message = "";

    if (succeeded.length > 0) {
      message += `✅ ${succeeded.length} file(s) uploaded successfully:\n`;
      message += succeeded.map((s) => `• ${s.filename}`).join("\n") + "\n\n";
    }

    if (failed.length > 0) {
      message += `❌ ${failed.length} file(s) failed:\n`;
      message += failed.map((f) => `• ${f.filename}: ${JSON.stringify(f.error)}`).join("\n");
    }

    setMessage(message);
    setIsUploading(false);
    setSelectedFiles([]);

    // Prompt to open successful docs
    if (succeeded.length > 0) {
      setSucceededUploads(succeeded);
      setShowModal(true);
    }
  };

  return (
    <AppLayout>
      <OptionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Open Uploaded File(s)?"
        message={`✅ ${succeededUploads.length} file(s) uploaded successfully.`}
        actions={[
          {
            label: "Open Now",
            onClick: () => {
              succeededUploads.forEach(({ docId }) => {
                if (docId) window.open(`/edit/${docId}`, "_blank");
              });
              setShowModal(false);
            },
            style: { background: "var(--accent-color)", color: "var(--white)" }
          },
          {
            label: "Close",
            onClick: () => {
              setShowModal(false);
              navigate("/");
            }
          }
        ]}
      />
      {isUploading && (
        <div className="overlay">
          <LoadingOverlay
            messages={[
              { delay: 0, text: 'Starting upload...' },
              { delay: 3000, text: 'Processing...' },
              { delay: 20000, text: 'This process could take a while, please be patient...' },
            ]}
          />
        </div>
      )}
      <div className="container">
        <h1 style={{ textAlign: "center" }}>Upload a Receipt</h1>
        {message && (
          <pre className={`upload-message ${message.startsWith("❌") ? "error" : ""}`}>
            {message}
          </pre>
        )}
        <FileDropzone multiple={true} onFileAccepted={handleFilesAccepted} />

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <LargeButton onClick={handleSubmit} style={{ marginTop: "1rem" }}>
            Submit
          </LargeButton>
          <LargeButton onClick={() => setSelectedFiles([])} style={{ marginTop: "1rem", backgroundColor: 'var(--grey-light)', color: 'var(--black)' }}>
            Clear
          </LargeButton>
        </div>
        {selectedFiles.length > 0 && (
          <div className="upload-preview">
            <strong>Selected Files:</strong>
            {selectedFiles.length === 1 && selectedFiles[0].type.startsWith("image/") ? (
              <div className="upload-preview-container">
                <img
                  src={URL.createObjectURL(selectedFiles[0])}
                  alt="Preview"
                  className="upload-preview-image"
                />
                <RoundDeleteButton
                  onClick={() => handleRemoveFile(0)}
                  size={18}
                  className="delete-button-round"
                />
              </div>
            ) : (
              selectedFiles.map((file, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {file.name}
                  <RoundDeleteButton
                    onClick={() => handleRemoveFile(i)}
                    size={12}
                  />
                </li>
              ))
            )}
          </div>
        )}
      </div>
    </AppLayout>

  );
}
