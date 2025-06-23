import React, { useState } from 'react';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './spending-line-chart.css';
import FullColorSelect from '../dropdowns/FullColorSelect';
import { formatCurrency } from '../../services/formatting';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function SpendingLineChart({ dailyData = [], monthlyData = [] }) {
  const [mode, setMode] = useState('daily'); // 'daily' or 'monthly'

  const VIEW_MODES = [
    { id: 'daily', name: 'Daily' },
    { id: 'monthly', name: 'Monthly' },
  ];

  const dataToUse = mode === 'daily' ? dailyData : monthlyData;

  const chartData = {
    labels: dataToUse.map(item => mode === 'daily' ? item.day : item.month),
    datasets: [
      {
        label: 'Spending',
        data: dataToUse.map(item => item.total_spent),
        fill: true,
        tension: 0.3,
        backgroundColor: 'rgba(100, 160, 100, 0.1)',
        borderColor: '#8DB580',
        pointBackgroundColor: '#8DB580',
      }
    ]
  };

  const options = {
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `${formatCurrency(ctx.parsed.y)}`,
        },
      },
      datalabels: {
        display: false,
      },
      title: {
        display: true,
        text: mode === 'daily' ? 'Day of Month' : 'Current Year',
        font: {
          size: 18,
          weight: 'bold',
          family: "Poppins",
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: mode === 'daily' ? 'Day of Month' : 'Month',
          font: {
            family: 'Poppins', size: 12
          },
        },
        ticks: {
          font: {
            family: 'Poppins', size: 12
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Total Spent (RM)',
          font: {
            family: 'Poppins', size: 12
          },
        },
        beginAtZero: true,
        ticks: {
          callback: (value) => `RM ${value}`,
          font: {
            family: 'Poppins', size: 12
          },
        },
      },
    },
  };

  return (
    <div className="analytics-card">
      <div className="mode-switch">
        <h2 style={{ marginTop: "0px" }} >Spending Over Time</h2>
        <FullColorSelect
            value={VIEW_MODES.find((m) => m.id === mode)}
            onChange={(selected) => setMode(selected?.id)}
            className="view-mode-select"
            options={VIEW_MODES}
            isInt={false}
        />
      </div>
      <div className="line-chart-wrapper">
        <Line data={chartData} options={{...options, maintainAspectRatio: false}} />
      </div>
    </div>
  );
}
