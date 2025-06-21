import React from 'react';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function CategoryExpensesBarChart({ data }) {
    const surfaceColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-surface-color').trim();
    const total = data.reduce((sum, item) => sum + item.amount, 0);

    const chartData = {
        labels: ['Expenses'],
        datasets: data.map((item, idx) => ({
            label: item.name,
            data: [item.amount],
            backgroundColor: item.color,
            stack: 'stack1',
        })),
    };

    const options = {
        indexAxis: 'y', // horizontal bar
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    font: {
                        family: 'Poppins, sans-serif',
                        // color: 
                        size: 12,
                    },
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const amount = context.raw;
                        const percentage = total ? ((amount / total) * 100).toFixed(1) : 0;
                        return `${context.dataset.label}: RM ${amount.toLocaleString()} (${percentage}%)`;
                    },
                    titleFont: { family: 'Poppins', size: 14 },
                    bodyFont: { family: 'Poppins', size: 12 },
                },
            },
            datalabels: {
                display: true,
                color: '#fff',
                font: {
                    size: 12,
                    weight: 'bold',
                    family: 'Poppins, sans-serif',
                },
                formatter: (value) => `RM ${value.toLocaleString()}`,
            }
        },
        scales: {
            x: {
                stacked: true,
                display: false,
                ticks: {
                    callback: (value) => `RM ${value}`,
                    font: { family: 'Poppins', size: 12 },
                },
                grid: {
                    display: false,
                },
            },
            y: {
                stacked: true,
                display: false,
                ticks: {
                    font: { family: 'Poppins', size: 12 },
                },
                grid: {
                    display: false,
                },
            },
        },
    };

    return (
        <div className="analytics-card">
            <h2>Total Expenses by Category</h2>
            <div style={{ height: "100px"}}>
                <Bar data={chartData} options={{ ...options, maintainAspectRatio: false }} />
            </div>
        </div >
    );
}
