import React from "react";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import ChartJS from 'chart.js/dist/chart.js';
// import {
//   Chart as ChartJS,
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, ChartDataLabels);

ChartJS.register(
  ChartJS.BarElement,
  ChartJS.CategoryScale,
  ChartJS.LinearScale,
  ChartJS.Title,
  ChartJS.Tooltip,
  ChartJS.Legend
);

const TopItemsChart = ({ data }) => {
  const items = data.map(item => item.item);
  const totals = data.map(item => item.total_spent);
  const frequencies = data.map(item => item.times_bought);

  const chartData = {
    labels: items,
    datasets: [
      {
        label: "Total Spent (RM)",
        data: totals,
        backgroundColor: "#4bc0c0",
        borderColor: "#4bc0c0",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      datalabels: {
        color: "#000",
        anchor: "end",
        align: "start",
        offset: -10,
        formatter: (value, context) => `×${frequencies[context.dataIndex]}`,
      },
      title: {
        display: true,
        text: "Top Items by Spending with Frequency",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Total Spent (RM)",
        },
      },
    },
  };

  return <Bar data={chartData} options={options} plugins={[ChartDataLabels]} />;
};

export default TopItemsChart;
