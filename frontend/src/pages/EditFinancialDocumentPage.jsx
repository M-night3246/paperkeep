import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";

export default function EditFinancialDocumentPage() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  
  const { id } = useParams(); // assuming route is like /edit/:id
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [financialDoc, setFinancialDoc] = useState(null);

  // Fetch financial document from API on mount
  useEffect(() => {
    async function fetchDocument() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/financial-documents/${id}/`, {
          headers: {
            "Content-Type": "application/json",
            // Add Authorization header if needed, e.g. `Authorization: Bearer <token>`
          },
          credentials: "include", // if using cookie-based auth
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch document: ${response.statusText}`);
        }

        const data = await response.json();
        setFinancialDoc(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchDocument();
  }, [id]);

  // Save handler called by form
  async function handleSave(updatedData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/financial-documents/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Add Authorization header if needed
        },
        credentials: "include",
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update document");
      }

      // Optionally: Show success message or redirect
      navigate("/"); // Redirect to homepage after save
    } catch (err) {
      alert(`Error saving document: ${err.message}`);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!financialDoc) return <div>No financial document found.</div>;

  return (
    <EditFinancialDocument initialData={financialDoc} onSave={handleSave} />
  );
}

// The EditFinancialDocument component from earlier goes here (or import it)
// useParams() and useNavigate() are from react-router-dom v6, so make sure you have it installed and your route is like:

<Route path="/edit/:id" element={<EditFinancialDocumentPage />} />

// Adjust the fetch URLs and headers based on your API and auth method.

// This example assumes your API returns and accepts JSON data shaped like the form expects.

// You can enhance error handling, loading states, and form validation as needed.