import React, { useEffect, useState } from "react";
import "./edit-transactions-page.css";
import AppLayout from "../../components/layout/AppLayout";
import LoadingOverlay from "../../components/layout/LoadingOverlay";
import NotificationModal from "../../components/popups/NotificationModal";
import ImageViewer from "../../components/popups/ImageViewer";
import { useParams } from "react-router";
import { useAuthFetch } from "../../hooks/authFetch";
import FullColorSelect from "../../components/dropdowns/FullColorSelect";
import RoundDeleteButton from "../../components/buttons/RoundDeleteButton";
import LargeButton from "../../components/buttons/LargeButton";
import { useNavigate } from "react-router";

export default function EditTransactionsPage() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const { id } = useParams();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();

  const [userCategories, setUserCategories] = useState([]);
  const [documentData, setDocumentData] = useState(null);
  const [lineItems, setLineItems] = useState([{ category: "", item: "", price: 0 }]);
  const [tempIdCounter, setTempIdCounter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNotifVisible, setIsNotifVisible] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({title: "", message: ""});

  useEffect(() => {
    const fetchDocumentAndCategories = async () => {
      try {
        const [data, categories] = await Promise.all([
          authFetch(`${API_BASE_URL}/api/receipts/documents/${id}/`),
          authFetch(`${API_BASE_URL}/api/main/user-categories/`)
        ]);

        setDocumentData(data);
        setLineItems(data.line_items || [{ category: "", item: "", price: 0 }]);
        setUserCategories(categories);
      } catch (err) {
        console.error("Unable to load document or categories:", err);
        setError("Unable to load document or categories: ", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDocumentAndCategories();
  }, [id]);

  const handleDocumentFieldChange = (field, value) => {
    setDocumentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLineItemChange = (index, field, value) => {
    const newItems = [...lineItems];
    newItems[index][field] = value;
    setLineItems(newItems);
  };

  const handleAddLineItem = () => {
    const newId = `temp-${tempIdCounter}`;
    setLineItems([...lineItems, { id: newId, category: "", item: "", price: 0 }]);
    setTempIdCounter(prev => prev + 1);
  };

  const handleRemoveLineItem = (idToRemove) => {
    setLineItems(prevItems => prevItems.filter(item => item.id !== idToRemove));
  };

  const handleSubmit = async () => {
    try {
      const { image, ...rest } = documentData;

      const payload = {
        ...rest,
        line_items: lineItems.map((item) => ({
          item: item.item,
          price: item.price,
          category_id: item.category?.id || null,
          ...(item.id && !String(item.id).startsWith("temp") ? { id: item.id } : {})
        }))
      };

      await authFetch(`${API_BASE_URL}/api/receipts/documents/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      setSubmitMessage({title: "Update Successful", message: "Document has been updated successfully!"});
      setIsNotifVisible(true);
    } catch (error) {
      console.error("Update failed:", error);
      setSubmitMessage({title: "Update Failed", message: `Failed to update document: ${error}`});
      setIsNotifVisible(true);
    }
  };

  if (loading) return 
  <div className="overlay">
    <LoadingOverlay
      messages={[
        { delay: 0, text: 'Loading Transactions...' }
      ]}
    />
  </div>;
  if (error) return <div>{error}</div>;

  return (
    <AppLayout>
      <NotificationModal
        isOpen={isNotifVisible}
        onClose={() => {
          setIsNotifVisible(false);
          navigate("/transactions");
        }}
        title={submitMessage?.title}
        message={submitMessage?.message}
      />
      <div className="form-container">
        {/* File Info */}
        <div className="form-header">
          <div className="file-name">
            {documentData?.image ? documentData.image.split('/').pop() : "Unknown Filename"}
          </div>
        </div>

        {/* Top Section: Business Info + Image */}
        <div className="form-top">
          <div className="form-fields">
            <div className="form-field-row">
              <label>Date / Time*</label>
              <input
                type="datetime-local"
                value={
                  documentData?.transaction_datetime
                    ? new Date(documentData.transaction_datetime).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) => handleDocumentFieldChange("transaction_datetime", e.target.value)}
              />
            </div>
            <div className="form-field-row">
              <label>Business Name</label>
              <input
                type="text"
                value={documentData?.business_name || ""}
                onChange={(e) => handleDocumentFieldChange("business_name", e.target.value)}
              />
            </div>
            <div className="form-field-row">
              <label>Business Address</label>
              <textarea
                type="text"
                value={documentData?.business_address || ""}
                onChange={(e) => handleDocumentFieldChange("business_address", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="image-preview">
              <ImageViewer src={ documentData?.image_url } alt="Receipt Image" />
          </div>
        </div>

        {/* Line Items */}
        <div className="form-line-items">
          {lineItems.map((item, index) => (
            <div className="line-item" key={index}>
              <FullColorSelect
                value={item.category}
                onChange={(selectedCategory) =>
                  handleLineItemChange(index, "category", selectedCategory)
                }
                options={userCategories}
                className="line-item-select"
              />
              <input
                type="text"
                placeholder="Item"
                value={item.item}
                onChange={(e) => handleLineItemChange(index, "item", e.target.value)}
                className="line-item-name"
              />
              <input
                type="number"
                placeholder="Item Total"
                value={item.price}
                onChange={(e) =>
                  handleLineItemChange(index, "price", parseFloat(e.target.value))
                }
                className="line-item-price"
              />
              <div className="line-item-delete-container">
                <RoundDeleteButton
                  onClick={() => handleRemoveLineItem(item.id)}
                  size={18}
                  className="line-item-delete"
                />
              </div>
            </div>
          ))}
          <LargeButton className="add-line-btn" onClick={handleAddLineItem}>
            Add new +
          </LargeButton>
        </div>

        {/* Bottom Section: Note + Totals */}
        <div className="form-bottom">
        <div className="form-field-note">
          
          <label>
            Note
          </label>
          <textarea
            rows="4"
            value={documentData?.note || ""}
            onChange={(e) => handleDocumentFieldChange("note", e.target.value)}
            className="note-textarea"
          />
        </div>
      
        <div className="totals-section">
          <div className="form-field-row">
            <label>Subtotal</label>
            <input
              type="number"
              value={documentData?.subtotal || ""}
              onChange={(e) => handleDocumentFieldChange("subtotal", e.target.value)}
            />
          </div>
          <div className="form-field-row">
            <label>Tax Amount</label>
            <input
              type="number"
              value={documentData?.tax || ""}
              onChange={(e) => handleDocumentFieldChange("tax", e.target.value)}
            />
          </div>
          <div className="form-field-row">
            <label>Total</label>
            <input
              type="number"
              value={documentData?.total_amount || ""}
              onChange={(e) => handleDocumentFieldChange("total_amount", e.target.value)}
            />
          </div>
        </div>
      </div>

      </div>
      <div className="form-action-buttons">
        <LargeButton className="discard-button" onClick={() => window.location.reload()} style={{ backgroundColor: 'var(--grey-light)', color: 'var(--black)' }}>
          Discard Changes
        </LargeButton>
        <LargeButton onClick={handleSubmit}>
          Save Changes
        </LargeButton>
      </div>
    </AppLayout>
  );
}
