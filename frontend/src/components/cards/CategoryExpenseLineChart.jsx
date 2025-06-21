import React, { useState } from 'react';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Select from 'react-select';
import './category-expense-line-chart.css';
import FullColorSelect from '../dropdowns/FullColorSelect';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export default function CategoryExpenseLineChart({ data, categories }) {
    const [selectedCategories, setSelectedCategories] = useState([categories[0]]);
    const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'monthly'

    const colorPalette = [
        '#e6a1a6',
        '#f2be6f',
        '#e0d77e',
        '#addfad',
        '#a9c3f5',
        '#c5a6e1',

        '#e6aed2',
        '#f0c7bd',
        '#f8f09c',
        '#c9e7b3',
        '#b0e0e6',
        '#e6d0de',
    ];


    const VIEW_MODES = [
        { id: 'daily', name: 'Daily' },
        { id: 'monthly', name: 'Monthly' },
    ];

    const labels =
        viewMode === 'daily'
            ? Array.from({ length: 31 }, (_, i) => i + 1)
            : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const chartData = {
        labels,
        datasets: selectedCategories.map((cat, index) => {
            const raw = data[cat.id] || {};
            const values = viewMode === 'daily' ? raw.daily || [] : raw.monthly || [];

            return {
                label: cat.name,
                data: values,
                fill: true,
                backgroundColor: colorPalette[index % colorPalette.length] + '22', // transparent fill
                borderColor: colorPalette[index % colorPalette.length],
                tension: 0.3,
                pointRadius: 3,
            };
        }),
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        plugins: {
            legend: {
                labels: {
                    font: {
                        family: 'Poppins, sans-serif',
                        size: 12,
                    },
                },
            },
            tooltip: {
                callbacks: {
                    label: context => `RM ${context.parsed.y.toFixed(2)}`,
                },
            },
            title: {
                display: true,
                text: viewMode === 'daily' ? 'Day of Month' : 'Current Year',
                font: {
                    size: 18,
                    weight: 'bold',
                    family: "Poppins",
                },
            },
            datalabels: {
                // display: true,
                display: false,
                // font: {
                //     size: 12,
                //     weight: 'bold',
                //     family: 'Poppins, sans-serif',
                // },
                // formatter: (value) => `${value.toLocaleString()}`,
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: '#444',
                    font: {
                        family: 'Poppins', size: 12
                    },
                },
                title: {
                    display: true,
                    text: viewMode === 'daily' ? 'Day of Month' : 'Month',
                    font: {
                        family: 'Poppins', size: 12
                    },
                },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => `RM ${value}`,
                    color: '#444',
                    font: {
                        family: 'Poppins', size: 12
                    },
                },
                title: {
                    display: true,
                    text: 'Amount (RM)',
                    font: {
                        family: 'Poppins', size: 12
                    },
                },
            },
        },
    };


    return (
        <div className="analytics-card">
            <h2 style={{ marginTop: "0px" }} >Category Expense Comparison by {viewMode === 'daily' ? 'Day' : 'Month'}</h2>
            <div className="selector-row">
                <Select
                    options={categories}
                    getOptionLabel={(c) => c.name}
                    getOptionValue={(c) => c.id}
                    isMulti
                    value={selectedCategories}
                    onChange={(selected) => setSelectedCategories(selected)}
                    className="category-multi-select"
                    styles={{
                        control: (base, state) => ({
                            ...base,
                            borderColor: state.isFocused ? 'var(--accent-color)' : base.borderColor,
                            boxShadow: state.isFocused ? '0 0 0 1px var(--accent-color)' : base.boxShadow,
                            '&:hover': {
                                borderColor: 'var(--accent-color)',
                            },
                        }),
                        option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused ? 'var(--accent-color)' : 'base.backgroundColor',
                            color: state.isFocused ? 'white' : 'var(--black)',
                            cursor: 'pointer',
                        }),
                        multiValueLabel: (base) => ({
                            ...base,
                            fontFamily: 'Poppins, sans-serif',
                        }),
                    }}
                />
                <FullColorSelect
                    value={VIEW_MODES.find((m) => m.id === viewMode)}
                    onChange={(selected) => setViewMode(selected?.id)}
                    className="view-mode-select"
                    options={VIEW_MODES}
                    isInt={false}
                />
            </div>

            <div className="chart-container">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
}
