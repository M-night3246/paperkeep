import React, { useEffect, useState } from 'react';
import { useAuthFetch } from '../../hooks/authFetch';
import AppLayout from '../../components/layout/AppLayout';
import FullColorSelect from '../../components/dropdowns/FullColorSelect';
import './budgets-categories-page.css';
import LoadingOverlay from '../../components/layout/LoadingOverlay';
import RoundDeleteButton from '../../components/buttons/RoundDeleteButton';

export default function BudgetsCategoriesPage() {
  const authFetch = useAuthFetch();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [categories, setCategories] = useState([]);
  const [systemCategories, setSystemCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryParent, setNewCategoryParent] = useState(null);

  const [editableCategories, setEditableCategories] = useState([]);

  const MAX_CUSTOM_CATEGORIES = 6;
  const customCategoryCount = categories.filter(cat => !cat.is_main).length;
  const reachedLimit = customCategoryCount >= MAX_CUSTOM_CATEGORIES;

  const fetchData = async () => {
    const catData = await authFetch(`${API_BASE_URL}/api/main/user-categories/`);
    const sysCatData = await authFetch(`${API_BASE_URL}/api/main/system-categories/`);
    const budgetData = await authFetch(`${API_BASE_URL}/api/main/budgets/`);
    setCategories(catData);
    setSystemCategories(sysCatData);
    setBudgets(budgetData);

    // Clone to allow editing without committing instantly
    setEditableCategories(catData.map(cat => ({
      ...cat,
      editedName: cat.name,
      editedSystemCat: cat.system_category,
    })));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateCategory = async (cat) => {
    await authFetch(`${API_BASE_URL}/api/main/user-categories/${cat.id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: cat.editedName,
        system_category_id: cat.editedSystemCat?.id || null,
      }),
    });

    // If there's a valid budget amount, save or update it
    if (cat.editedBudget !== undefined && cat.editedBudget !== "") {
      await authFetch(`${API_BASE_URL}/api/main/budgets/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: cat.id,
          amount: cat.editedBudget,
        }),
      });
    }

    fetchData();
  };

  const handleDeleteCategory = async (catId) => {
    await authFetch(`${API_BASE_URL}/api/main/user-categories/${catId}/`, {
      method: "DELETE",
    });
    fetchData();
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !newCategoryParent || reachedLimit) return;

    await authFetch(`${API_BASE_URL}/api/main/user-categories/`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newCategoryName,
        system_category_id: newCategoryParent.id,
      }),
    });
    setNewCategoryName('');
    setNewCategoryParent(null);
    fetchData();
  };

  // Utility to sum budgets by system category
  const groupedBudgets = systemCategories.map(systemCat => {
    const relatedCategories = categories.filter(cat => cat.system_category?.id === systemCat.id);

    const totalAmount = relatedCategories.reduce((sum, cat) => {
      const budget = budgets.find(b => b.category.id === cat.id);
      return sum + (budget?.amount ? parseFloat(budget.amount) : 0);
    }, 0);

    return {
      systemCategoryName: systemCat.default_name,
      amount: totalAmount.toFixed(2),
    };
  });


  if (!editableCategories) return
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
      <h1>Category and Budget Management</h1>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center"}}>
        
      <div style={{ padding: "0rem 0.5rem 0rem 0.5rem", textAlign: "justify", marginBottom: "1.5rem"}}>
        Your expenses are organized into system categories (like Entertainment & Leisure, Food & Groceries, 
        or Living Expenses) to help with consistent tracking. You can also create your own custom categories 
        for better budget tracking. Custom categories are grouped under a related system category for better 
        analysis.
      </div>
      <div className="category-budget-container">
        <h2 style={{ marginTop: "0rem"}}>Budget Summary by System Category</h2>
        <table style={{ marginBottom: "2rem" }}>
          <thead>
            <tr>
              <th>System Category</th>
              <th>Total Budget (RM)</th>
            </tr>
          </thead>
          <tbody>
            {groupedBudgets.map((entry, idx) => (
              <tr key={idx}>
                <td>{entry.systemCategoryName}</td>
                <td>{entry.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="category-budget-container">
        <ul>
          {[...editableCategories]
            .sort((a, b) => a.id - b.id).map(cat => {
              const budget = budgets.find(b => b.category.id === cat.id) || {};
              return (
                <li key={cat.id} className="category-item">
                  <input
                    value={cat.editedName}
                    onChange={(e) =>
                      setEditableCategories(prev =>
                        prev.map(c =>
                          c.id === cat.id ? { ...c, editedName: e.target.value } : c
                        )
                      )
                    }
                    className="category-name-input"
                  />

                  <FullColorSelect
                    value={cat.editedSystemCat}
                    onChange={(selected) =>
                      setEditableCategories(prev =>
                        prev.map(c =>
                          c.id === cat.id ? { ...c, editedSystemCat: selected } : c
                        )
                      )
                    }
                    options={systemCategories.map(s => ({ ...s, name: s.default_name }))}
                    className="system-category-select"
                    disabled={cat.is_main}
                    required
                  />

                  <input
                    type="number"
                    step={100}
                    className="budget-input"
                    placeholder="Budget (RM)"
                    value={cat.editedBudget ?? budget.amount ?? ""}
                    onChange={(e) =>
                      setEditableCategories(prev =>
                        prev.map(c =>
                          c.id === cat.id ? { ...c, editedBudget: e.target.value } : c
                        )
                      )
                    }
                  />

                  <button onClick={() => handleUpdateCategory(cat)}>Update</button>

                  {!cat.is_main ? (
                    <div style={{ width: "5%" }}>
                      <RoundDeleteButton
                        onClick={() => handleDeleteCategory(cat.id)}
                        size={20}
                        shape="rect"
                      />
                    </div>

                  ) : (
                    <span className="main-label" title="Main categories are used for automatic AI categorization and cannot be deleted.">Main</span>
                  )}
                </li>
              );
            })}
        </ul>

        <div className="new-category-form">
          <input
            placeholder="New category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <FullColorSelect
            value={newCategoryParent}
            onChange={setNewCategoryParent}
            options={systemCategories.map(s => ({ ...s, name: s.default_name }))}
            required
          />
          <button
            onClick={handleAddCategory}
            disabled={reachedLimit}
            title={reachedLimit ? "Maximum of 12 custom categories reached." : ""}
            style={{
              cursor: reachedLimit ? "not-allowed" : "pointer",
              opacity: reachedLimit ? 0.8 : 1,
            }}
          >
            Add Category
          </button>
        </div>
        <div style={{ fontSize: "0.8rem", color: "var(--grey)" }}>
          * Maximum of 12 categories
        </div>
      </div>
      </div>

    </AppLayout>
  );
}
