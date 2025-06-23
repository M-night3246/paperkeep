import React from 'react';
import './budget-expense-card.css';
import { formatCurrency } from '../../services/formatting';

export default function BudgetExpenseCard({ data = [], colors }) {
    return (
        <div className="analytics-card wide">
            <h2 style={{ marginTop: "0px" }} >Budget & Expenses</h2>

            {data.map((item, index) => {
                const color = colors[index % colors.length];
                const percentage = item.budget ? (item.spent / item.budget) * 100 : 0;
                const formattedPercent = Math.min(percentage, 100).toFixed(0);

                return (
                    <div key={item.name} className="budget-row">
                        <div className="progress-bar-wrapper">
                            <div
                                className="progress-bar-fill"
                                style={{
                                    width: `${Math.min(percentage, 100)}%`,
                                    backgroundColor: color,
                                }}
                            ></div>
                        </div>
                        <div className="bar-details">
                            <span className="bar-label">
                                {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
                            </span>
                            <span className="percent-text">{formattedPercent}% spent</span>
                        </div>
                    </div>
                );
            })}

            {/* Legend */}
            <div className="legend-container">
                {data.map((item, index) => (
                    <div key={item.name} className="legend-item">
                        <div
                            className="legend-color"
                            style={{ backgroundColor: colors[index % colors.length] }}
                        ></div>
                        <span className="legend-label">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
