import React, { useEffect, useState } from "react";
import AppLayout from '../../components/layout/AppLayout';
import MonthlySpendingChart from "../../components/charts/MonthlySpendingChart";
import CategorySpendingChart from "../../components/charts/CategorySpendingChart";
import TopMerchantsChart from "../../components/charts/TopMerchantsChart";
import TopItemsChart from "../../components/charts/TopItemsChart";
import DailySpendingChart from "../../components/charts/DailySpendingChart";
import { useAuthFetch } from "../../hooks/authFetch";

const DashboardPage = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const authFetch = useAuthFetch()
  const [selectedMonth, setSelectedMonth] = useState("");
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData = async (month = "") => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/analytics/dashboard/`, {
        method: "GET",
      });
      setDashboardData(response);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    fetchDashboardData(month);
  };

  if (!dashboardData) return <div>Loading dashboard...</div>;

  return (
    <AppLayout>
      <div style={{ maxWidth: "80%" }}>
        <h1>Spending Dashboard</h1>

        <form>
          <label htmlFor="month">Input Month:</label>
          <input
            type="month"
            id="month"
            name="month"
            value={selectedMonth}
            onChange={handleMonthChange}
          />
        </form>

        <div className="charts-grid">
          <div className="chart-box">
            <h2>Monthly Spending</h2>
            <MonthlySpendingChart data={dashboardData.monthly_spending} />
          </div>

          <div className="chart-box">
            <h2>Spending by Category</h2>
            <CategorySpendingChart data={dashboardData.category_spending} />
          </div>

          {/* <div className="chart-box">
            <h2>Top Merchants</h2>
            <TopMerchantsChart data={dashboardData.top_merchants} />
          </div> */}

          <div className="chart-box">
            <h2>Top Items</h2>
            <TopItemsChart data={dashboardData.top_items} />
          </div>

          <div className="chart-box full-width">
            <h2>Daily Spending</h2>
            <DailySpendingChart data={dashboardData.daily_spending} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;

// import React, { useEffect, useState, useRef } from 'react';
// import Chart from 'chart.js/auto';
// import ChartDataLabels from 'chartjs-plugin-datalabels';

// Chart.register(ChartDataLabels);

// const AnalyticsDashboard = () => {
//   const [month, setMonth] = useState('');
//   const [data, setData] = useState(null);

//   const monthlyChartRef = useRef(null);
//   const categoryChartRef = useRef(null);
//   const merchantChartRef = useRef(null);
//   const itemChartRef = useRef(null);
//   const dailyChartRef = useRef(null);

//   const fetchData = async (selectedMonth = '') => {
//     try {
//       const res = await fetch(`/dashboard-data/?month=${selectedMonth}`);
//       const json = await res.json();
//       setData(json);
//     } catch (err) {
//       console.error("Error fetching dashboard data:", err);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   useEffect(() => {
//     if (!data) return;

//     // Destroy any existing charts before rendering new ones
//     Chart.getChart(monthlyChartRef.current)?.destroy();
//     Chart.getChart(categoryChartRef.current)?.destroy();
//     Chart.getChart(merchantChartRef.current)?.destroy();
//     Chart.getChart(itemChartRef.current)?.destroy();
//     Chart.getChart(dailyChartRef.current)?.destroy();

//     // Monthly Spending
//     const monthlyLabels = data.monthly_spending.map(m =>
//       new Date(m.month).toLocaleString('default', { month: 'short', year: 'numeric' })
//     );
//     const monthlyTotals = data.monthly_spending.map(m => m.total_spent);
//     new Chart(monthlyChartRef.current, {
//       type: 'line',
//       data: {
//         labels: monthlyLabels,
//         datasets: [{
//           label: 'Monthly Spending (RM)',
//           data: monthlyTotals,
//           borderColor: '#4bc0c0',
//           fill: true,
//           tension: 0.3
//         }]
//       }
//     });

//     // Category Breakdown
//     const categoryLabels = data.category_breakdown.map(c => c.category__name || 'Uncategorized');
//     const categoryTotals = data.category_breakdown.map(c => c.total_spent);
//     new Chart(categoryChartRef.current, {
//       type: 'pie',
//       data: {
//         labels: categoryLabels,
//         datasets: [{
//           label: 'Spending by Category',
//           data: categoryTotals,
//           backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4bc0c0', '#9966ff'],
//         }]
//       }
//     });

//     // Top Merchants
//     const merchantLabels = data.top_merchants.map(m => m.business_name);
//     const merchantTotals = data.top_merchants.map(m => m.total_spent);
//     new Chart(merchantChartRef.current, {
//       type: 'bar',
//       data: {
//         labels: merchantLabels,
//         datasets: [{
//           label: 'Total Spent (RM)',
//           data: merchantTotals,
//           backgroundColor: '#4bc0c0'
//         }]
//       }
//     });

//     // Top Items
//     const items = data.top_items.map(item => item.item);
//     const totalSpent = data.top_items.map(item => item.total_spent);
//     const timesBought = data.top_items.map(item => item.times_bought);
//     new Chart(itemChartRef.current, {
//       type: 'bar',
//       data: {
//         labels: items,
//         datasets: [{
//           label: 'Total Spent (RM)',
//           data: totalSpent,
//           backgroundColor: '#4bc0c0',
//           borderColor: '#4bc0c0',
//           borderWidth: 1
//         }]
//       },
//       options: {
//         plugins: {
//           datalabels: {
//             color: '#000',
//             anchor: 'end',
//             align: 'start',
//             offset: -10,
//             formatter: (value, context) => `×${timesBought[context.dataIndex]}`
//           },
//           title: {
//             display: true,
//             text: 'Top Items by Spending with Frequency'
//           }
//         },
//         scales: {
//           y: {
//             beginAtZero: true,
//             title: {
//               display: true,
//               text: 'Total Spent (RM)'
//             }
//           }
//         }
//       }
//     });

//     // Daily Spending
//     const dailyLabels = data.daily_spending.map(d => new Date(d.day).toLocaleDateString());
//     const dailyTotals = data.daily_spending.map(d => d.total_spent);
//     new Chart(dailyChartRef.current, {
//       type: 'bar',
//       data: {
//         labels: dailyLabels,
//         datasets: [{
//           label: 'Daily Spending (RM)',
//           data: dailyTotals,
//           backgroundColor: '#4bc0c0'
//         }]
//       }
//     });

//   }, [data]);

//   const handleFilterSubmit = (e) => {
//     e.preventDefault();
//     fetchData(month);
//   };

//   return (
//     <div style={{ padding: '40px', fontFamily: 'Arial' }}>
//       <form onSubmit={handleFilterSubmit}>
//         <label htmlFor="month">Input Month: </label>
//         <input
//           type="month"
//           id="month"
//           name="month"
//           value={month}
//           onChange={(e) => setMonth(e.target.value)}
//         />
//         <button type="submit">Filter</button>
//       </form>

//       <h1>Spending Dashboard</h1>

//       <h2>Monthly Spending</h2>
//       <canvas ref={monthlyChartRef} width="600" height="300" />

//       <h2>Spending by Category</h2>
//       <canvas ref={categoryChartRef} width="400" height="400" />

//       <h2>Top Merchants</h2>
//       <canvas ref={merchantChartRef} width="600" height="300" />

//       <h2>Top Items</h2>
//       <canvas ref={itemChartRef} width="600" height="300" />

//       <h2>Daily Spending</h2>
//       <canvas ref={dailyChartRef} width="600" height="300" />
//     </div>
//   );
// };

// export default AnalyticsDashboard;
