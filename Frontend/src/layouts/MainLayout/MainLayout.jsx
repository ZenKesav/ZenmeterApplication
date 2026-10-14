import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../app/store';
import './MainLayout.css';

const MainLayout = () => {
  const { isCollapsed, isMobileOpen, closeMobileSidebar } = useAuth();

  return (
    <div className="app-container bg-light min-vh-100">
      <div
        id="overlay"
        className={`overlay ${isMobileOpen ? 'show' : ''}`}
        onClick={closeMobileSidebar}
      ></div>

      <Topbar />
      <Sidebar />

      <main
        id="content"
        className={`content d-flex flex-column justify-content-between min-vh-100 ${isCollapsed ? 'full' : ''}`}
        style={{ paddingTop: '76px', backgroundColor: '#f8fafc' }}
      >
        <div className="container-fluid px-4 flex-grow-1 pb-4">
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default MainLayout;
