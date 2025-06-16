import React, { useEffect, useState } from "react";
import AppLayout from '../../components/layout/AppLayout';
import { useAuthFetch } from "../../hooks/authFetch";
import { useNavigate } from 'react-router-dom';
import "./transactions-page.css";

export default function TransactionList() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const authFetch = useAuthFetch();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const data = await authFetch(`${API_BASE_URL}/api/receipts/documents/`, {
          method: "GET",
        });
        setTransactions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const res = await authFetch(`${API_BASE_URL}/api/receipts/documents/${id}/`, {
        method: "DELETE",
      });
      setTransactions(transactions.filter((t) => t.id !== id));
      setDeleteMessage("Transaction deleted successfully.");
      setTimeout(() => setDeleteMessage(""), 3000);
    } catch (err) {
      setDeleteMessage(`Error: ${err.message}`);
    }
  }

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <AppLayout>
      <h1>All Transactions</h1>
      {deleteMessage && (
        <p className={`transaction-message ${deleteMessage.startsWith("Error") ? "error" : ""}`}>
          {deleteMessage}
        </p>
      )}
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Business Name</th>
            <th>Total Amount</th>
            <th>Transaction Date</th>
            <th>Upload Date</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={5} className="no-transactions">No transactions found.</td>
            </tr>
          ) : (
            transactions.map((transaction) => (
              <tr key={transaction.id} onClick={() => navigate(`/edit/${transaction.id}`)}>
                <td>{transaction.business_name}</td>
                <td className="text-center">RM{transaction.total_amount.toFixed(2)}</td>
                <td>{new Date(transaction.transaction_datetime).toLocaleString()}</td>
                <td>{new Date(transaction.upload_datetime).toLocaleString()}</td>
                <td className="text-center">
                  <button onClick={() => handleDelete(transaction.id)} className="delete-button">Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <a href="/upload" className="upload-button">Add New Transaction</a>
    </AppLayout>

  );
}
