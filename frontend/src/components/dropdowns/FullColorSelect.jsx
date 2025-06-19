import React from "react";
import './full-color-select.css'
export default function FullColorSelect({ value, onChange, options, className = "" }) {
  const handleChange = (e) => {
    const selectedId = parseInt(e.target.value);
    const selectedOption = options.find((cat) => cat.id === selectedId) || null;
    onChange(selectedOption);
  };

  return (
    <div className={`select-container ${className}`}>
        <select value={value?.id || ""} onChange={handleChange}>
        <option value="">Select</option>
        {options.map((cat) => (
            <option key={cat.id} value={cat.id}>
            {cat.name}
            </option>
        ))}
        </select>
    </div>
  );
}
