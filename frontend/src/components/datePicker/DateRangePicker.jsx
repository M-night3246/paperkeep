import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// import './date-range-picker.css'; // Optional custom styling

export default function DateRangePicker({ from, to, setFrom, setTo, className = "" }) {
  return (
    <div className={`date-range-picker ${className}`} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <label>
        From:&nbsp;
        <DatePicker
          selected={from}
          onChange={setFrom}
          dateFormat="yyyy-MM-dd"
          placeholderText="Start date"
          isClearable
        />
      </label>

      <label>
        To:&nbsp;
        <DatePicker
          selected={to}
          onChange={setTo}
          dateFormat="yyyy-MM-dd"
          placeholderText="End date"
          isClearable
        />
      </label>
    </div>
  );
}
