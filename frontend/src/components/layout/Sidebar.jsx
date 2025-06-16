// import React from 'react';
// import { FaDollarSign, FaFolder, FaChartLine, FaMapMarkerAlt, FaCalculator, FaDownload } from 'react-icons/fa';
// import { Link } from 'react-router-dom';

// const Sidebar = ({ isOpen }) => {
//   return (
//     <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
//       {/* <div className="sidebar-header">
//         {isOpen ? <FiX /> : <FiMenu />}
//         <span className="logo">Paper<span className="highlight">Keep</span></span>
//       </div> */}
//       {isOpen && (
//         <nav className="sidebar-nav">
//         <SidebarItem icon={<FaDollarSign />} label="Expenses" to="/expenses" />
//         <SidebarItem icon={<FaFolder />} label="Documents" to="/documents" />
//         <SidebarItem icon={<FaChartLine />} label="Overview" to="/overview" />
//         <SidebarItem icon={<FaMapMarkerAlt />} label="Heatmap" to="/heatmap" />
//         <SidebarItem icon={<FaCalculator />} label="Calculator" to="/calculator" />
//         <SidebarItem icon={<FaDownload />} label="Export" to="/export" />
//       </nav>
//       )}
//     </aside>
//   );
// };

// const SidebarItem = ({ icon, label, active, to }) => (
//   <Link className={`nav-item ${active ? 'active' : ''}`} to={to}>
//     <div className="nav-icon">{icon}</div>
//     <div className="nav-label">{label}</div>
//   </Link>
// );

// export default Sidebar;




import React from 'react';
import { routes } from '../../routes';
import * as FaIcons from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './layout.css'

const Sidebar = ({ isOpen }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* <div className="sidebar-header">
        {isOpen ? <FiX /> : <FiMenu />}
        <span className="logo">Paper<span className="highlight">Keep</span></span>
      </div> */}
      {isOpen && (
        <nav className="sidebar-nav">
          {routes
            .filter(route => route.showInSidebar)
            .map(({ path, label, icon }) => {
              const Icon = FaIcons[icon];
              return (
                <Link key={path} to={path} className="nav-item">
                  <div className="nav-icon">{Icon && <Icon />}</div>
                  <div className="nav-label">{label}</div>
                </Link>
              );
            })}
      </nav>
      )}
    </aside>
  );
};

const SidebarItem = ({ icon, label, active, to }) => (
  <Link className={`nav-item ${active ? 'active' : ''}`} to={to}>
    <div className="nav-icon">{icon}</div>
    <div className="nav-label">{label}</div>
  </Link>
);

export default Sidebar;

