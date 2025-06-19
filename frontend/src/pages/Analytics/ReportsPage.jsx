import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import './reports-page.css';
import { useAuthFetch } from '../../hooks/authFetch';

export default function ReportsPage() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const authFetch = useAuthFetch();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [mode, setMode] = useState('monthly');

  const today = new Date();
  const thisMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const [month1, setMonth1] = useState(thisMonthStr);
  const [month2, setMonth2] = useState(thisMonthStr); // For comparison

  const getDateRange = (mode, m1, m2) => {
    const [y1, mo1] = m1.split('-').map(Number);
    const start1 = new Date(y1, mo1 - 1, 1);
    const end1 = new Date(y1, mo1, 0);

    if (mode === 'compare' && m2) {
      const [y2, mo2] = m2.split('-').map(Number);
      const start2 = new Date(y2, mo2 - 1, 1);
      const end2 = new Date(y2, mo2, 0);
      return [start1, end2];
    }

    if (mode === 'yearly') {
      return [new Date(y1, 0, 1), new Date(y1, 11, 31)];
    }

    return [start1, end1];
  };

  useEffect(() => {
    async function fetchSummary() {
      setLoading(true);
      const [start, end] = getDateRange(mode, month1, month2);
      const dateFrom = start.toISOString().split('T')[0];
      const dateTo = end.toISOString().split('T')[0];

      try {
        // const res = await authFetch(
        //   `${API_BASE_URL}/api/analytics/summary/?mode=${mode}&from=${dateFrom}&to=${dateTo}`
        // );
        // if (res.summary) {
        //   setSummary(res.summary);
        // } else {
        //   setSummary('No summary returned.');
        // }
      } catch (err) {
        console.error('Failed to load summary:', err);
        setSummary('An error occurred while generating the summary.');
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [mode, month1, month2]);

  return (
    <AppLayout>
      <h1>Spending Overview</h1>
      <div className="report-controls">
        <label>
          Mode:&nbsp;
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="compare">Compare Months</option>
          </select>
        </label>

        <label>
          {mode === 'yearly' ? 'Year:' : 'Month:'}&nbsp;
          <input
            type="month"
            value={month1}
            onChange={(e) => setMonth1(e.target.value)}
          />
        </label>

        {mode === 'compare' && (
          <label>
            Compare To:&nbsp;
            <input
              type="month"
              value={month2}
              onChange={(e) => setMonth2(e.target.value)}
            />
          </label>
        )}
      </div>

      <div className="summary-report-box">
        <h2>📊 AI Spending Summary</h2>
        {loading ? (
          <p>Generating summary...</p>
        ) : (
          <pre className="summary-report-text">{summary}</pre>
        )}
      </div>
    </AppLayout>
  );
}
