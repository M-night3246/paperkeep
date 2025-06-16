import React from "react";
import { Line } from "react-chartjs-2";
import ChartJS from 'chart.js/dist/chart.js';

// import {
//   Chart as ChartJS,
//   LineElement,
//   PointElement,
//   CategoryScale,
//   LinearScale,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

ChartJS.register(
  ChartJS.LineElement,
  ChartJS.PointElement,
  ChartJS.CategoryScale,
  ChartJS.LinearScale,
  ChartJS.Title,
  ChartJS.Tooltip,
  ChartJS.Legend
);

// ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const MonthlySpendingChart = ({ data }) => {
  const labels = data.map(m => new Date(m.month).toLocaleString('default', { month: 'short', year: 'numeric' }));
  const totals = data.map(m => m.total_spent);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Monthly Spending (RM)",
        data: totals,
        borderColor: "#4bc0c0",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return <Line data={chartData} />;
};

export default MonthlySpendingChart;
