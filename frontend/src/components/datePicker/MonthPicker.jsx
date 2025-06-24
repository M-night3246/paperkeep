import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './date-picker.css';

export default function MonthPicker({ value, onChange, isClearable }) {
  return (
    <DatePicker
      selected={value}
      onChange={onChange}
      dateFormat="yyyy-MM"
      showMonthYearPicker
      isClearable={isClearable}
      placeholderText="Select Month"
      className="month-picker-input"
    />
  );
}
