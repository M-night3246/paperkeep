import React from "react";
import { Bar } from "react-chartjs-2";
// import ChartJS from "chart.js/dist/chart.js";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// ChartJS.register(
//   ChartJS.BarElement,
//   ChartJS.CategoryScale,
//   ChartJS.LinearScale,
//   ChartJS.Title,
//   ChartJS.Tooltip,
//   ChartJS.Legend
// );

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const DailySpendingChart = ({ data }) => {
  const labels = data.map(d => new Date(d.day).toLocaleDateString());
  const totals = data.map(d => d.total_spent);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Daily Spending (RM)",
        data: totals,
        backgroundColor: "#4bc0c0",
      },
    ],
  };

  return <Bar data={chartData} />;
};

export default DailySpendingChart;
