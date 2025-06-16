import React, { useState } from "react";
import Cookies from 'js-cookie'
import { useAuthFetch } from "../../hooks/authFetch";

export default function UploadFinancialDocument() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const authFetch = useAuthFetch();

  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");
  
  // Get CSRF token from cookie (Django default)
  function getCSRFToken() {
    const match = document.cookie.match(/csrftoken=([\w-]+)/);
    return match ? match[1] : "";
    // const value = `; ${document.cookie}`;
    // const parts = value.split(`; csrftoken=`);
    // if (parts.length === 2) {
    //     const token = parts.pop().split(';').shift();
    //     console.log("CSRF Token Found:", token);
    //     return token;
    // } else {
    //     console.warn("CSRF Token NOT found in cookies.");
    //     return "";
    // }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setMessage("Please select an image file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
        const res = await authFetch(`${API_BASE_URL}/api/receipts/upload/`, {
          method: "POST",
          body: formData,
        });

        // Success
        console.log("Upload successful:", res);
        setMessage("Upload successful!");

        // TODO: Lead to edit the financial document

    } catch (err) {
        console.error("Unexpected error:", err);
        setMessage("Something went wrong. Try again later.");
        
        // Try to extract error details if available
        try {
        const errorData = JSON.parse(err.message);
        if (errorData.image) {
            setMessage("Image error: " + errorData.image.join(" "));
        } else if (errorData.detail) {
            setMessage("Error: " + errorData.detail);
        } else {
            setMessage("Upload failed. Please check all fields.");
        }
        } catch {
        setMessage("Something went wrong. Try again later.");
        }
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h1>Upload an Image for OCR</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          required
        />
        <br />
        <button type="submit" style={{ marginTop: 10 }}>
          Upload
        </button>
      </form>
      {message && (
        <p style={{ marginTop: 15, color: message.includes("successfully") ? "green" : "red" }}>
          {message}
        </p>
      )}
    </div>
  );
}
