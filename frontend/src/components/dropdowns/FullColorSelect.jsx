import React from "react";
import './full-color-select.css'
export default function FullColorSelect({ value, onChange, options, className = "", disabled = false, isInt = true, required=true }) {
  const handleChange = (e) => {
    const rawValue = e.target.value;
    const selectedId = isInt ? parseInt(rawValue) : rawValue;
    const selectedOption = options.find((cat) => cat.id === selectedId) || null;
    onChange(selectedOption);
  };

  return (
    <div className={`select-container ${className}`}>
        <select value={value?.id || ""} onChange={handleChange} disabled={disabled} required={required}>
        <option value="" style={{ fontFamily: "Poppins, sans-serif" }}>Select</option>
        {options.map((cat) => (
            <option key={cat.id} value={cat.id}>
            {cat.name}
            </option>
        ))}
        </select>
    </div>
  );
}
