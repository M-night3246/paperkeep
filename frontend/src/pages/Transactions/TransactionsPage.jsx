import React, { useEffect, useState } from "react";
import AppLayout from '../../components/layout/AppLayout';
import { FiTrash2, FiDownload, FiExternalLink } from 'react-icons/fi';
import { useAuthFetch } from "../../hooks/authFetch";
import { downloadFetch } from "../../hooks/downloadFetch";
import { useNavigate } from 'react-router-dom';
import "./transactions-page.css";
import NotificationModal from "../../components/popups/NotificationModal";
import IconSelect from "../../components/dropdowns/IconSelect";
import FullCellCheckbox from "../../components/checkbox/FullCellCheckbox";
import ToggleSwitch from "../../components/buttons/ToggleSwitch";
import LoadingOverlay from "../../components/layout/LoadingOverlay";
import LargeButton from "../../components/buttons/LargeButton";
import OptionModal from "../../components/popups/OptionModal";

export default function TransactionsPage() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const authFetch = useAuthFetch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showErrNotifModal, setShowErrNotifModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'transaction_datetime', direction: 'desc' });
  const [showLineItemsView, setShowLineItemsView] = useState(false);
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

  const sortedTransactions = [...transactions].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const lineItems = transactions.flatMap((transaction) =>
    transaction.line_items.map((lineItem) => ({
      id: `${transaction.id}-${lineItem.id}`,
      documentId: transaction.id,
      business_name: transaction.business_name,
      transaction_datetime: transaction.transaction_datetime,
      item: lineItem.item,
      price: lineItem.price,
      category: lineItem.category?.name || "",
    }))
  );

  const grouped = Object.entries(
    Object.groupBy(lineItems, item => item.documentId)
  );

  const flattenedWithDividers = grouped.flatMap(([docId, items]) =>
    items.map((item, index) => ({
      ...item,
      documentId: docId,
      isLastInGroup: index === items.length - 1,
    }))
  );

  const sortedLineItems = [...flattenedWithDividers].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortConfig.direction === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return sortConfig.direction === "asc"
      ? aVal - bVal
      : bVal - aVal;
  });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      } else {
        return { key, direction: 'asc' };
      }
    });
  };

  const getSortArrow = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

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
        setShowDeleteModal(true);
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

  async function confirmDeleteTransactions() {
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
      setShowNotifModal(true);
    } catch (err) {
      setError(err);
      setShowErrNotifModal(true);
      console.log(err);
    } finally {
      setShowDeleteModal(false);
    }
  }

  function handleOpenInNewTab() {
    selectedIds.forEach((id) => {
      window.open(`/edit/${id}`, "_blank");
    });
  }

  function sanitizeFilename(name) {
    return name.split('.').slice(0, -1).join('.').replace(/[^a-z0-9]/gi, "_").toLowerCase();
  }

  async function handleDownload() {
    try {
      const allData = [];

      for (const id of selectedIds) {
        const blob = await downloadFetch(`${API_BASE_URL}/api/receipts/documents/${id}/download/`);
        const text = await blob.text();
        const json = JSON.parse(text);
        allData.push(json);
      }

      const isSingle = allData.length === 1;
      const filename = isSingle
        ? `document-${sanitizeFilename(allData[0]?.image.split('/').pop() || selectedIds[0])}.json`
        : `documents.json`;

      const combinedBlob = new Blob(
        [JSON.stringify(isSingle ? allData[0] : allData, null, 2)],
        { type: "application/json" }
      );

      const url = URL.createObjectURL(combinedBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Combined download error:", err);
    }
  }

  if (loading) return
  <div className="overlay">
    <LoadingOverlay
      messages={[
        { delay: 0, text: 'Loading Transactions...' }
      ]}
    />
  </div>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <AppLayout>
      <NotificationModal
        isOpen={showNotifModal}
        onClose={() => {
          setShowNotifModal(false);
        }}
        title="Deletion Successful"
        message="Document(s) have been deleted successfully!"
      />
      <NotificationModal
        isOpen={showErrNotifModal}
        onClose={() => {
          setShowErrNotifModal(false);
        }}
        title="Something Went Wrong"
        message={error.message}
      />
      <OptionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
        message="Are you sure you want to delete the selected transactions?"
        actions={[
          {
            label: "Cancel",
            onClick: () => setShowDeleteModal(false),
            style: { backgroundColor: 'var(--grey-light)', color: 'var(--black)' }
          },
          {
            label: "Delete",
            onClick: confirmDeleteTransactions,
            style: { backgroundColor: 'var(--red)', color: 'var(--white)' }
          }
        ]}
      />
      <div style={{ display: "flex", height: "100%" }}>
        <h1 style={{ maxWidth: "fit-content" }}>All Transactions</h1>
        <div className={"bottom-right-align"} style={{ marginBottom: "1rem" }}>
          <IconSelect
            options={bulkActionOptions}
            onChange={handleBulkAction}
            disabled={selectedIds.length < 1}
          />
          <LargeButton className="add-button" onClick={() => navigate('/upload')}>
            + Add
          </LargeButton>
          <div style={{ width: "50%", gap: "0.5rem" }}>
            <ToggleSwitch
              value={showCategoryTotals}
              onChange={() => setShowCategoryTotals(!showCategoryTotals)}
              label="Show categories"
              disabled={showLineItemsView}
              height={15}
              width={30}
              handleSize={10}
              textSize="0.75rem"
            />
            <ToggleSwitch
              value={showLineItemsView}
              onChange={() => setShowLineItemsView(!showLineItemsView)}
              label="Show line items"
              height={15}
              width={30}
              handleSize={10}
              textSize="0.75rem"
            />
          </div>
        </div>
      </div>
      <table className="transaction-table">
        <thead>
          <tr>
            {showLineItemsView ? (
              <>
                <th onClick={() => handleSort('item')} style={{ cursor: 'pointer' }}>
                  Item {getSortArrow('item')}
                </th>
                <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
                  Price {getSortArrow('price')}
                </th>
                <th onClick={() => handleSort('business_name')} style={{ cursor: 'pointer' }}>
                  Business Name {getSortArrow('business_name')}
                </th>
                <th onClick={() => handleSort('category')} style={{ cursor: 'pointer' }}>
                  Category {getSortArrow('category')}
                </th>
                <th onClick={() => handleSort('transaction_datetime')} style={{ cursor: 'pointer' }}>
                  Transaction Date {getSortArrow('transaction_datetime')}
                </th>
              </>
            ) : (
              <>
                <th>
                  <div className="transaction-table-checkbox">
                    <FullCellCheckbox
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      onClick={(e) => e.stopPropagation()}
                      variant="header"
                    />
                  </div>
                </th>
                <th onClick={() => handleSort('business_name')} style={{ cursor: 'pointer' }}>
                  Business Name {getSortArrow('business_name')}
                </th>
                <th onClick={() => handleSort('total_amount')} style={{ cursor: 'pointer' }}>
                  Total Amount {getSortArrow('total_amount')}
                </th>
                <th onClick={() => handleSort('transaction_datetime')} style={{ cursor: 'pointer' }}>
                  Transaction Date {getSortArrow('transaction_datetime')}
                </th>
                <th onClick={() => handleSort('upload_datetime')} style={{ cursor: 'pointer' }}>
                  Upload Date {getSortArrow('upload_datetime')}
                </th>
                {showCategoryTotals && <th className="categories-cell">Categories</th>}
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {showLineItemsView ? (
            lineItems.length === 0 ? (
              <tr><td colSpan={5} className="no-transactions">No line items found.</td></tr>
            ) : (
              sortedLineItems.map((item) => (
                <tr
                  key={item.id}
                  className="line-item-row"
                  onClick={() => navigate(`/edit/${item.documentId}`)}
                  style={{
                    cursor: "pointer",
                    borderBottom:
                      item.isLastInGroup && ['transaction_datetime', 'business_name'].includes(sortConfig.key)
                        ? "2px solid #ccc"
                        : "none"
                  }}
                >
                  <td>{item.item}</td>
                  <td className="text-center">RM{parseFloat(item.price).toFixed(2)}</td>
                  <td>{item.business_name}</td>
                  <td>{item.category}</td>
                  <td>{new Date(item.transaction_datetime).toLocaleString('en-GB', { timeZone: 'UTC' })}</td>
                </tr>
              ))
            )
          ) : (
            sortedTransactions.length === 0 ? (
              <tr><td colSpan={5} className="no-transactions">No transactions found.</td></tr>
            ) : (
              sortedTransactions.map((transaction) => (
                <tr key={transaction.id} onClick={() => navigate(`/edit/${transaction.id}`)}>
                  <td>
                    <div className="transaction-table-checkbox">
                      <FullCellCheckbox
                        checked={selectedIds.includes(transaction.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleSelect(transaction.id)}
                      />
                    </div>
                  </td>
                  <td>{transaction.business_name}</td>
                  <td className="text-center">RM{transaction.total_amount.toFixed(2)}</td>
                  <td>{new Date(transaction.transaction_datetime).toLocaleString('en-GB', { timeZone: 'UTC' })}</td>
                  <td>{new Date(transaction.upload_datetime).toLocaleString('en-GB', { timeZone: 'UTC' })}</td>
                  {showCategoryTotals && (
                    <td className="categories-cell">
                      {transaction.category_totals ? (
                        <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                          {Object.entries(transaction.category_totals).map(([cat, amt]) => (
                            <li key={cat}>
                              {cat}: RM{parseFloat(amt).toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        '-'
                      )}
                    </td>
                  )}
                </tr>
              ))
            )
          )}
        </tbody>
      </table>
    </AppLayout>

  );
}
