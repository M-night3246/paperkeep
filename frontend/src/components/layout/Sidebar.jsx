import React from 'react';
import { routes } from '../../routes';
import * as FaIcons from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './layout.css'

const Sidebar = ({ isOpen }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
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

