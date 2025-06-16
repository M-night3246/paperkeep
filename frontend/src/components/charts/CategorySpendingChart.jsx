// import React from "react";
// import { Pie } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend
// } from "chart.js";

// ChartJS.register(ArcElement, Tooltip, Legend);

// const CategorySpendingChart = ({ data }) => {
//   const labels = data.map(c => c.category__name || "Uncategorized");
//   const totals = data.map(c => c.total_spent);

//   const chartData = {
//     labels,
//     datasets: [
//       {
//         label: "Spending by Category",
//         data: totals,
//         backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4bc0c0', '#9966ff'],
//       },
//     ],
//   };

//   return <Pie data={chartData} />;
// };

// export default CategorySpendingChart;


import React from "react";
import { Pie } from "react-chartjs-2";
// import Chart from "chart.js/dist/chart.js"; // ES5 UMD build
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register required elements with ChartJS
ChartJS.register(ArcElement, Tooltip, Legend);

const CategorySpendingChart = ({ data }) => {
  const labels = data.map((c) => c.category__name || "Uncategorized");
  const totals = data.map((c) => c.total_spent);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Spending by Category",
        data: totals,
        backgroundColor: [
          "#ff6384",
          "#36a2eb",
          "#cc65fe",
          "#ffce56",
          "#4bc0c0",
          "#9966ff",
        ],
      },
    ],
  };

  return <Pie data={chartData} />;
};

export default CategorySpendingChart;
