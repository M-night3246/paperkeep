import HomePage from './pages/Home/HomePage';
import AuthPage from './pages/Auth/AuthPage';
import TransactionsPage from './pages/Transactions/TransactionsPage';
import DashboardPage from './pages/Analytics/DashboardPage';
import ReportsPage from './pages/Analytics/ReportsPage';
import MapPage from './pages/Analytics/MapPage';
// TODO: Change the below
import EditTransactionsPage from './pages/Transactions/EditTransactionsPage';
import UploadPage from './pages/Transactions/UploadPage';

export const routes = [
    { path: '/', element: <HomePage />, label: 'Home', showInSidebar: false },
    { path: '/auth', element: <AuthPage />, label: 'Auth', showInSidebar: false },
    { path: '/edit/:id', element: <EditTransactionsPage />, label: '', showInSidebar: false }, // dynamic route

    // Visible in sidebar
    { path: '/transactions', element: <TransactionsPage />, label: 'Transactions', icon: 'FaDollarSign', showInSidebar: true },
    { path: '/upload', element: <UploadPage />, label: 'Upload', icon: 'FaUpload', showInSidebar: true },
    // TODO: add documents here
    { path: '/analytics/dashboard', element: <DashboardPage />, label: 'Dashboard', icon: 'FaChartLine', showInSidebar: true },
    { path: '/analytics/report', element: <ReportsPage />, label: 'Report', icon: 'FaFileContract', showInSidebar: true },
    { path: '/analytics/map', element: <MapPage />, label: 'Map', icon: 'FaMapMarkerAlt', showInSidebar: true },
    // TODO: add settings here
];
