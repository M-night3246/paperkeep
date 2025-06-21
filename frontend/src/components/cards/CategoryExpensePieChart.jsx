import React from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import './category-expense-pie-chart.css';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export default function CategoryExpensePieChart({ data, colors }) {
    const total = data.reduce((sum, item) => sum + item.total_spent, 0);

    const chartData = {
        labels: data.map(item => item.category__name),
        datasets: [
            {
                data: data.map(item => item.total_spent),
                backgroundColor: data.map((_, i) => colors[i % colors.length]),
                borderWidth: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    font: {
                        family: 'Poppins, sans-serif',
                        size: 12,
                    },
                }
            },
            title: {
                display: true,
                text: 'This month',
                font: {
                    size: 18,
                    weight: 'bold',
                    family: "Poppins",
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const amount = context.raw;
                        const percentage = total ? ((amount / total) * 100).toFixed(1) : 0;
                        return `${context.label}: RM ${amount.toLocaleString()} (${percentage}%)`;
                    },
                },
            },
            datalabels: {
                display: true,
                color: '#000',
                font: {
                    size: 12,
                    weight: 'bold',
                    family: 'Poppins, sans-serif',
                },
                formatter: (value) => `RM ${value.toLocaleString()}`,
                // filter: function (context) {
                //     const data = context.chart.data.datasets[0].data;
                //     console.log(data);
                //     const total = data.reduce((sum, val) => sum + val, 0);
                //     const percentage = total ? (context.raw / total) * 100 : 0;
                //     console.log(percentage);
                //     return percentage >= 10;
                // },
            }
        },
    };

    return (
        <div className="analytics-card" style={{ width: "60%" }}>
            <h2 style={{ marginTop: "0px" }}>Total Expenses by Category</h2>
            <div className="pie-chart-wrapper">
                <Pie data={chartData} options={options} />
            </div>
        </div>
    );
}
