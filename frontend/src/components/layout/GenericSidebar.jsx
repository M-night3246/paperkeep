import React from "react";
import "./generic-sidebar.css";

export default function GenericSidebar({ title, items, onItemClick }) {
  return (
    <div className="generic-sidebar">
      {title && <h3>{title}</h3>}
      <ul>
        {items.map((item) => (
          <li key={item.id} onClick={() => onItemClick(item)}>
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
