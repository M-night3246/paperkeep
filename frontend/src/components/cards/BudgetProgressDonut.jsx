import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import './budget-progress-donut.css';
import { formatCurrency } from '../../services/formatting';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function BudgetProgressDonut({ label, spent = 0, budget = 1 }) {
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
  const backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--greys').trim();

  const percentage = budget ? Math.min((spent / budget) * 100, 100) : 0;
  const roundedPercentage = parseFloat(percentage.toFixed(1));
  const data = {
    datasets: [
      {
        data: [roundedPercentage, 100 - roundedPercentage],
        backgroundColor: [accentColor, backgroundColor],
        borderWidth: 0,
        cutout: '75%',
      }
    ]
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      datalabels: { display: false }
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="analytics-card">
      <div className="donut-label">{label}</div>
      <div className="donut-wrapper">
        <Doughnut data={data} options={options} />
        <div className="donut-center">
          <div className="donut-percent">{percentage.toFixed(1)}%</div>
          <div className="donut-sub">of RM {formatCurrency(budget, false)}<br />spent</div>
        </div>
      </div>
    </div>
  );
}
