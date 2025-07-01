import React, { useEffect, useState } from "react";
import AppLayout from '../../components/layout/AppLayout';
import { useAuthFetch } from "../../hooks/authFetch";
import LoadingOverlay from "../../components/layout/LoadingOverlay";
import MonthPicker from "../../components/datePicker/MonthPicker";

// import CategoryExpenseBar from "../../components/charts/CategoryExpenseBar";
import BudgetSummaryCard from "../../components/cards/BudgetSummaryCard";
import BudgetProgressDonut from "../../components/cards/BudgetProgressDonut";
import CategoryExpensePieChart from "../../components/cards/CategoryExpensePieChart";
import BudgetExpenseCard from "../../components/cards/BudgetExpenseCard";
import TopItemsList from "../../components/cards/TopItemsList";
import TopMerchantsList from "../../components/cards/TopMerchantsList";
import SpendingLineChart from "../../components/cards/SpendingLineChart";
import CategoryExpenseLineChart from "../../components/cards/CategoryExpenseLineChart";

const DashboardPage = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const authFetch = useAuthFetch()
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  const fetchDashboardData = async (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    try {
      const response = await authFetch(`${API_BASE_URL}/api/analytics/dashboard/?month=${month}&year=${year}`, {
        method: "GET",
      });
      setDashboardData(response);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData(selectedDate);
  }, [selectedDate]);

  if (!dashboardData) return
  (
    <div className="overlay">
      <LoadingOverlay
        messages={[
          { delay: 0, text: 'Loading...' },
        ]}
      />
    </div>
  )

  return (
    <AppLayout>

      <div style={{ maxWidth: "100%" }}>
        <div style={{ display: "flex", width: "100%", alignItems: "end", justifyContent: "space-between" }}>
          <div>
            <h1>Spending Dashboard</h1>
            <div style={{ padding: "0rem 0.5rem 0rem 0.5rem", textAlign: "justify", marginBottom: "1.5rem"}}>
              Disclaimer: All figures are calculated with line item prices, except for Top Merchants and Spending Over Time, which use total amounts (including tax where applicable)
            </div>
          </div>
          <div style={{ margin: "0rem 0rem 1rem 1rem"}}>
            <MonthPicker
                value={selectedDate}
                onChange={setSelectedDate}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
          {/* 1. budget_summary */}
          <BudgetSummaryCard totalBudget={dashboardData.budget_summary.total_budget} totalExpenses={dashboardData.budget_summary.total_spent} />
          <BudgetProgressDonut label="This month" spent={dashboardData.budget_summary.total_spent} budget={dashboardData.budget_summary.total_budget} />
          {/* 2. budget_summary_prev_month */}
          <BudgetProgressDonut label="Last month"
            spent={dashboardData.budget_summary_prev_month.total_spent}
            budget={dashboardData.budget_summary_prev_month.total_budget}
          />
        </div>
        
        <div style={{ display: "flex", gap: '2rem' }}>
          {/* 3. category_spending */}
          <CategoryExpensePieChart
            data={dashboardData.category_spending}
            colors={colorPalette}
          />
          {/* 4. budget_data */}
          <BudgetExpenseCard
            data={dashboardData.budget_data}
            colors={colorPalette} 
          />
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
          <TopItemsList items={dashboardData.top_items} />
          <TopMerchantsList merchants={dashboardData.top_merchants} />
        </div>

        {/* 5. daily_spending,  */}
        <SpendingLineChart dailyData={dashboardData.daily_spending} monthlyData={dashboardData.monthly_spending} />

        <div>
          {/* 6. category_expense_lines, category_expense_categories */}
          <CategoryExpenseLineChart
            data={dashboardData.category_expense_lines}
            categories={dashboardData.category_expense_categories}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;