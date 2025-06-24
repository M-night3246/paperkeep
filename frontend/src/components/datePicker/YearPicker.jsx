import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './date-picker.css';

export default function YearPicker({ value, onChange }) {
  return (
    <DatePicker
      selected={value}
      onChange={onChange}
      showYearPicker
      dateFormat="yyyy"
      className="year-picker-input"
    />
  );
}
