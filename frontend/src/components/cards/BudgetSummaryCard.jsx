import React from 'react';
import { useNavigate } from 'react-router-dom';
import './budget-summary-card.css';
import { formatCurrency } from '../../services/formatting';

export default function BudgetSummaryCard({ totalBudget = 0, totalExpenses = 0 }) {
  const navigate = useNavigate();
  const balance = totalBudget - totalExpenses;

  return (
    <div className="analytics-card">
      <div className="row">
        <span className="label">Budget</span>
        <span className="value">{formatCurrency(totalBudget)}</span>
      </div>
      <div className="row">
        <span className="label">Expenses</span>
        <span className="value">{formatCurrency(totalExpenses)}</span>
      </div>
      <div className="balance">
        <span className="currency">RM</span>
        <span className="amount">{formatCurrency(balance, false)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button className="set-budget-btn" onClick={() => navigate('/budgets-categories')}>
          Set Budget
        </button>
      </div>

    </div>
  );
}
