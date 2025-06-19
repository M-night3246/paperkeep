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

const TopMerchantsChart = ({ data }) => {
  const labels = data.map(m => m.business_name);
  const totals = data.map(m => m.total_spent);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Total Spent (RM)",
        data: totals,
        backgroundColor: "#4bc0c0",
      },
    ],
  };

  return <Bar data={chartData} />;
};

export default TopMerchantsChart;
