import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function MonthPicker({ value, onChange }) {
  return (
    <DatePicker
      selected={value}
      onChange={onChange}
      dateFormat="yyyy-MM"
      showMonthYearPicker
      showFullMonthYearPicker
      className="month-picker-input"
    />
  );
}
