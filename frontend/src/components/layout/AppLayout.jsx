import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import './layout.css';

const Layout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <>
      <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
      <div style={isSidebarOpen ? { paddingTop: "60px" } : {}}>
        <main className="layout-content">{children}</main>
      </div>
      {isSidebarOpen && (
        <div className="backdrop" onClick={toggleSidebar}></div>
      )}
    </>
  );
};

export default Layout;
