import React from 'react';
import './top-items-list.css';
import { formatCurrency } from '../../services/formatting';

export default function TopItemsList({ items = [], title = "Top Items" }) {
  return (
    <div className="analytics-card" style ={{ width: "50%" }}>
      <h2 style={{ marginTop: "0px" }}>{title}</h2>
      <ul className="top-items-list">
        {items.map((item, index) => (
          <li key={index} className="top-item">
            <div className="item-rank">{index + 1}.</div>
            <div className="item-name">{item.item}</div>
            <div style={{ width: "30%", display: "flex", justifyContent: "flex-end"}}>
                <div className="item-times">x{item.times_bought}</div>
                <div className="item-amount">{formatCurrency(item.total_spent)}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
