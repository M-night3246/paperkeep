import React, { useEffect, useState } from "react";
import AppLayout from '../../components/layout/AppLayout';
import { FiTrash2, FiDownload, FiExternalLink } from 'react-icons/fi';
import { useAuthFetch } from "../../hooks/authFetch";
import { useNavigate } from 'react-router-dom';
import "./transactions-page.css";
import IconSelect from "../../components/dropdowns/IconSelect";
import FullCellCheckbox from "../../components/checkbox/FullCellCheckbox";
import Select from 'react-select';
import LargeButton from "../../components/buttons/LargeButton";

export default function TransactionList() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const authFetch = useAuthFetch();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [showCategoryTotals, setShowCategoryTotals] = useState(false);

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

  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  const isAllSelected = transactions.length > 0 && selectedIds.length === transactions.length;

  function toggleSelectAll() {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map((t) => t.id));
    }
  }

  const bulkActionOptions = [
    { value: 'delete', label: 'Delete', Icon: FiTrash2 },
    { value: 'download', label: 'Download', Icon: FiDownload },
    { value: 'open', label: 'Open', Icon: FiExternalLink },
  ];

  const handleBulkAction = (selectedOption) => {
    switch (selectedOption.value) {
      case 'delete':
        handleBatchDelete();
        break;
      case 'download':
        handleDownload();
        break;
      case 'open':
        handleOpenInNewTab();
        break;
      default:
        break;
    }
  };

  async function handleBatchDelete() {
    if (!window.confirm("Are you sure you want to delete the selected transactions?")) return;
    try {
      await Promise.all(
        selectedIds.map((id) =>
          authFetch(`${API_BASE_URL}/api/receipts/documents/${id}/`, {
            method: "DELETE",
          })
        )
      );
      setTransactions(transactions.filter((t) => !selectedIds.includes(t.id)));
      setSelectedIds([]);
      setDeleteMessage("Transactions deleted successfully.");
      setTimeout(() => setDeleteMessage(""), 3000);
    } catch (err) {
      setDeleteMessage(`Error: ${err.message}`);
    }
  }

  function handleOpenInNewTab() {
    selectedIds.forEach((id) => {
      window.open(`/edit/${id}`, "_blank");
    });
  }

  function handleDownload() {
    selectedIds.forEach((id) => {
      // Example implementation: you can change this as needed
      window.open(`${API_BASE_URL}/api/receipts/documents/${id}/download/`, "_blank");
    });
  }

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <AppLayout>
      <div style={{ display: "flex", height: "100%" }}>
        <h1 style={{ maxWidth: "fit-content" }}>All Transactions</h1>

        {deleteMessage && (
          <p className={`transaction-message ${deleteMessage.startsWith("Error") ? "error" : ""}`}>
            {deleteMessage}
          </p>
        )}
        <div className={"bottom-right-align"} style={{ marginBottom: "1rem" }}>
          <IconSelect
            options={bulkActionOptions}
            onChange={handleBulkAction}
            disabled={selectedIds.length < 1}
          />
          <LargeButton onClick={() => navigate('/upload')}>
            + Add
          </LargeButton>
          <label htmlFor="toggleCategory">Show Category Totals</label>
          <input
            type="checkbox"
            id="toggleCategory"
            checked={showCategoryTotals}
            onChange={() => setShowCategoryTotals(!showCategoryTotals)}
          />
        </div>
      </div>
      <table className="transaction-table">
        <thead>
          <tr>
            <th className="transaction-table-checkbox">
              <FullCellCheckbox
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
                onClick={(e) => e.stopPropagation()}
                variant="header"
              />
            </th>
            <th>Business Name</th>
            <th>Total Amount</th>
            <th>Transaction Date</th>
            <th>Upload Date</th>
            {/* <th>Details</th> */}
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={5} className="no-transactions">No transactions found.</td>
            </tr>
          ) : (
            transactions.map((transaction) => (
              <React.Fragment key={transaction.id}>
                <tr key={transaction.id} onClick={() => navigate(`/edit/${transaction.id}`)}>
                  <td className="transaction-table-checkbox">
                    <FullCellCheckbox
                      checked={selectedIds.includes(transaction.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleSelect(transaction.id)}
                    />
                  </td>
                  <td>{transaction.business_name}</td>
                  <td className="text-center">RM{transaction.total_amount.toFixed(2)}</td>
                  <td>{new Date(transaction.transaction_datetime).toLocaleString()}</td>
                  <td>{new Date(transaction.upload_datetime).toLocaleString()}</td>
                  {/* <td className="text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBatchDelete(transaction.id);
                      }}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </td> */}
                </tr>
                {showCategoryTotals && transaction.category_totals && (
                  <tr className="category-breakdown-row">
                    <td></td>
                    <td colSpan={4}>
                      <strong>Category Breakdown:</strong>
                      <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                        {Object.entries(transaction.category_totals).map(([category, amount]) => (
                          <li key={category}>
                            {category}: RM{parseFloat(amount).toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </AppLayout>

  );
}
