import React from 'react';
import './top-merchants-list.css';
import { formatCurrency } from '../../services/formatting';

export default function TopMerchantsList({ merchants = [], title = "Top Merchants" }) {
  return (
    <div className="analytics-card" style ={{ width: "50%" }}>
      <h2  style={{ marginTop: "0px" }}>{title}</h2>
      <ul className="top-merchants-list">
        {merchants.map((merchant, index) => (
          <li key={index} className="merchant-row">
            <div className="merchant-rank">{index + 1}.</div>
            <div className="merchant-name">{merchant.business_name}</div>
            <div className="merchant-amount">{formatCurrency(merchant.total_spent)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
