import ProtectedRoute from './components/ProtectedRoute';

// import HomePage from './pages/Home/HomePage';
import AuthPage from './pages/Auth/AuthPage';

import TransactionsPage from './pages/Transactions/TransactionsPage';
import EditTransactionsPage from './pages/Transactions/EditTransactionsPage';
import UploadPage from './pages/Transactions/UploadPage';
import BudgetsCategoriesPage from './pages/Budget/BudgetsCategoriesPage';
import DashboardPage from './pages/Analytics/DashboardPage';
import ReportsPage from './pages/Analytics/ReportsPage';
import MapPage from './pages/Analytics/MapPage';

export const routes = [
  // Public routes
//   { path: '/', element: <HomePage />, label: 'Home', showInSidebar: false },
  { path: '/auth', element: <AuthPage />, label: 'Auth', showInSidebar: false },

  // Protected routes
  {
    path: '/edit/:id',
    element: (
      <ProtectedRoute>
        <EditTransactionsPage />
      </ProtectedRoute>
    ),
    label: '',
    showInSidebar: false,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <TransactionsPage />
      </ProtectedRoute>
    ),
    label: 'Transactions',
    icon: 'FaDollarSign',
    showInSidebar: true,
  },
  {
    path: '/upload',
    element: (
      <ProtectedRoute>
        <UploadPage />
      </ProtectedRoute>
    ),
    label: 'Upload',
    icon: 'FaUpload',
    showInSidebar: true,
  },
  {
    path: '/analytics/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
    label: 'Dashboard',
    icon: 'FaChartLine',
    showInSidebar: true,
  },
  {
    path: '/analytics/report',
    element: (
      <ProtectedRoute>
        <ReportsPage />
      </ProtectedRoute>
    ),
    label: 'Report',
    icon: 'FaFileContract',
    showInSidebar: true,
  },
  {
    path: '/analytics/map',
    element: (
      <ProtectedRoute>
        <MapPage />
      </ProtectedRoute>
    ),
    label: 'Map',
    icon: 'FaMapMarkerAlt',
    showInSidebar: true,
  },
  {
    path: '/budgets-categories',
    element: (
      <ProtectedRoute>
        <BudgetsCategoriesPage />
      </ProtectedRoute>
    ),
    label: 'Categories & Budgets',
    icon: 'FaTags',
    showInSidebar: true,
  },
];