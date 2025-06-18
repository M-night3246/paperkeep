import HomePage from './pages/Home/HomePage';
import AuthPage from './pages/Auth/AuthPage';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard';
import TransactionList from './pages/Transactions/TransactionsPage';

// TODO: Change the below
import EditFinancialDocument from './components/functions/EditFinancialDocument2';
import UploadPage from './pages/Transactions/UploadPage';

export const routes = [
    { path: '/', element: <HomePage />, label: 'Home', showInSidebar: false },
    { path: '/auth', element: <AuthPage />, label: 'Auth', showInSidebar: false },
    { path: '/edit/:id', element: <EditFinancialDocument />, label: '', showInSidebar: false }, // dynamic route

    // Visible in sidebar
    { path: '/transactions', element: <TransactionList />, label: 'Transactions', icon: 'FaDollarSign', showInSidebar: true },
    // TODO: add documents here
    { path: '/analytics/dashboard', element: <AnalyticsDashboard />, label: 'Overview', icon: 'FaChartLine', showInSidebar: true },
    // TODO: add heatmap here
    { path: '/upload', element: <UploadPage />, label: 'Documents', icon: 'FaFolder', showInSidebar: true },
];
