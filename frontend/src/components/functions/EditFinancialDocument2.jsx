import React, { useState } from "react";
import "./edit-financial-document.css"; // Import your corresponding CSS

export default function EditFinancialDocument() {
  const [lineItems, setLineItems] = useState([{ category: "", item: "", total: "" }]);

  const handleLineItemChange = (index, field, value) => {
    const newItems = [...lineItems];
    newItems[index][field] = value;
    setLineItems(newItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { category: "", item: "", total: "" }]);
  };

  return (
    <div className="form-container">
      {/* File Info */}
      <div className="form-header">
        <div className="file-name">FileName00X.pdf</div>
      </div>

      {/* Top Section: Business Info + Image */}
      <div className="form-top">
        <div className="form-fields">
          <label>
            Date / Time*
            <input type="datetime-local" />
          </label>
          <label>
            Business Name
            <input type="text" />
          </label>
          <label>
            Business Address
            <input type="text" />
          </label>
        </div>
        <div className="image-preview">
          <img src="https://via.placeholder.com/120" alt="Receipt Preview" />
        </div>
      </div>

      {/* Line Items */}
      <div className="form-line-items">
        {lineItems.map((item, index) => (
          <div className="line-item" key={index}>
            <select
              value={item.category}
              onChange={(e) => handleLineItemChange(index, "category", e.target.value)}
            >
              <option value="">Category</option>
              <option value="food">Food</option>
              <option value="travel">Travel</option>
              <option value="office">Office</option>
              {/* Add more categories as needed */}
            </select>
            <input
              type="text"
              placeholder="Item"
              value={item.item}
              onChange={(e) => handleLineItemChange(index, "item", e.target.value)}
            />
            <input
              type="number"
              placeholder="Item Total"
              value={item.total}
              onChange={(e) => handleLineItemChange(index, "total", e.target.value)}
            />
          </div>
        ))}
        <button type="button" className="add-line-btn" onClick={addLineItem}>
          Add new +
        </button>
      </div>

      {/* Bottom Section: Note + Totals */}
      <div className="form-bottom">
        <div className="note-section">
          <label>
            Note
            <textarea rows="4" />
          </label>
        </div>
        <div className="totals-section">
          <label>
            Subtotal
            <input type="number" />
          </label>
          <label>
            Tax Amount
            <input type="number" />
          </label>
          <label>
            Total
            <input type="number" />
          </label>
        </div>
      </div>
    </div>
  );
}
