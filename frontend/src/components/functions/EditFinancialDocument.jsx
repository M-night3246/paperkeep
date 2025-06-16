import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { useAuthFetch } from "../../hooks/authFetch";

export default function EditFinancialDocument() {
  const { id } = useParams();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const authFetch = useAuthFetch();

  const [financialDocument, setFinancialDocument] = useState(null);
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [transactionDatetime, setTransactionDatetime] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [lineItems, setLineItems] = useState([]);
  const [newLineItem, setNewLineItem] = useState({ item: "", price: "", category: "" });
  const [message, setMessage] = useState("");

  // Fetch financial document data on mount
  useEffect(() => {
    authFetch(`${API_BASE_URL}/api/receipts/documents/${id}/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        setFinancialDocument(data);
        setBusinessName(data.business_name || "");
        setBusinessAddress(data.business_address || "");
        // format datetime-local value: "YYYY-MM-DDTHH:mm"
        const dt = data.transaction_datetime ? new Date(data.transaction_datetime) : null;
        setTransactionDatetime(dt ? dt.toISOString().slice(0, 16) : "");
        setTotalAmount(data.total_amount || "");
        // line_items: array of {id, item, price, category: {name}}
        setLineItems(
          data.line_items.map((li) => ({
            id: li.id,
            item: li.item,
            price: li.price,
            category: li.category ? li.category.name : "",
          }))
        );
      })
      .catch(() => setMessage("Failed to load financial document"));
  }, [id]);

  // Handle input changes for existing line items
  const handleLineItemChange = (index, field, value) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // Remove line item by filtering it out
  const removeLineItem = (index) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle adding a new line item
  const handleNewLineItemChange = (field, value) => {
    setNewLineItem((prev) => ({ ...prev, [field]: value }));
  };

  // Submit updated document
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data to send
    const payload = {
      business_name: businessName,
      business_address: businessAddress,
      transaction_datetime: transactionDatetime,
      total_amount: parseFloat(totalAmount),
      line_items: [
        // existing items
        ...lineItems.map(({ id, item, price, category }) => ({
          id,
          item,
          price: parseFloat(price),
          category: category || null,
        })),
      ],
    };

    // Add new line item if it has some data
    if (newLineItem.item || newLineItem.price || newLineItem.category) {
      payload.line_items.push({
        item: newLineItem.item,
        price: parseFloat(newLineItem.price),
        category: newLineItem.category || null,
      });
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/receipts/documents/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save changes");
      const updatedDoc = await res.json();
      setMessage("Changes saved successfully!");
      setFinancialDocument(updatedDoc);
      // Reset new line item fields
      setNewLineItem({ item: "", price: "", category: "" });
      // Update line items state with server response
      setLineItems(
        updatedDoc.line_items.map((li) => ({
          id: li.id,
          item: li.item,
          price: li.price,
          category: li.category ? li.category.name : "",
        }))
      );
    } catch (err) {
      setMessage(err.message || "Error saving changes");
    }
  };

  if (!financialDocument) return <p>Loading...</p>;

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "auto" }}>
      <style>
        {`
          label {
            display: inline-block;
            width: 30%;
            font-weight: 600;
            margin-top: 10px;
          }
          input[type=text], input[type=datetime-local], input[type=number], textarea {
            display: inline-block;
            width: 60%;
            margin-top: 10px;
            padding: 5px;
            box-sizing: border-box;
          }
          textarea {
            height: 60px;
          }
          .line-item {
            margin-bottom: 10px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 10px;
          }
          .line-item label, .line-item input {
            width: auto;
            display: inline-block;
            margin-right: 10px;
          }
          .line-item button {
            margin-left: 10px;
          }
          button[type=submit] {
            margin-top: 20px;
            padding: 10px 20px;
          }
          h3, h4 {
            margin-top: 20px;
          }
          .message {
            margin-top: 15px;
            color: green;
            font-weight: 600;
          }
        `}
      </style>

      <label htmlFor="businessName">Business Name:</label>
      <input
        id="businessName"
        type="text"
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
      />
      <br />

      <label htmlFor="businessAddress">Business Address:</label>
      <textarea
        id="businessAddress"
        value={businessAddress}
        onChange={(e) => setBusinessAddress(e.target.value)}
      />
      <br />

      <label htmlFor="transactionDatetime">Transaction Datetime:</label>
      <input
        id="transactionDatetime"
        type="datetime-local"
        value={transactionDatetime}
        onChange={(e) => setTransactionDatetime(e.target.value)}
      />
      <br />

      <label htmlFor="totalAmount">Total Amount:</label>
      <input
        id="totalAmount"
        type="number"
        step="0.01"
        value={totalAmount}
        onChange={(e) => setTotalAmount(e.target.value)}
      />
      <br />

      <h3>Line Items</h3>

      {lineItems.map((item, idx) => (
        <div key={item.id || idx} className="line-item">
          <label>Item Name:</label>
          <input
            type="text"
            value={item.item}
            onChange={(e) => handleLineItemChange(idx, "item", e.target.value)}
          />

          <label>Price:</label>
          <input
            type="number"
            step="0.01"
            value={item.price}
            onChange={(e) => handleLineItemChange(idx, "price", e.target.value)}
          />

          <label>Category:</label>
          <input
            type="text"
            value={item.category}
            onChange={(e) => handleLineItemChange(idx, "category", e.target.value)}
          />

          <button type="button" onClick={() => removeLineItem(idx)}>
            Remove
          </button>
        </div>
      ))}

      <h4>Add New Line Item</h4>

      <label>New Item:</label>
      <input
        type="text"
        value={newLineItem.item}
        onChange={(e) => handleNewLineItemChange("item", e.target.value)}
      />
      <br />

      <label>New Price:</label>
      <input
        type="number"
        step="0.01"
        value={newLineItem.price}
        onChange={(e) => handleNewLineItemChange("price", e.target.value)}
      />
      <br />

      <label>New Category:</label>
      <input
        type="text"
        value={newLineItem.category}
        onChange={(e) => handleNewLineItemChange("category", e.target.value)}
      />
      <br />

      <button type="submit">Save Changes</button>

      {message && <p className="message">{message}</p>}
    </form>
  );
}

