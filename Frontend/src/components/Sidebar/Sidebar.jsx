import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/store';
import zenmeterLogo from '../../assets/images/zenmeter_logo.png';
import zenIcon from '../../assets/images/favicon_io/zen.jpg';

import { getUserAssignedStages, isFullAccessUser } from '../../utils/stageUtils';

const Sidebar = () => {
  const location = useLocation();
  const { isCollapsed, isMobileOpen, closeMobileSidebar, user, logout, hasPermission, selectedStageId, setSelectedStageId } = useAuth();

  const handleLinkClick = () => {
    if (isMobileOpen) {
      closeMobileSidebar();
    }
  };

  const rawRole = user?.role || 'ADMIN';
  const normRole = rawRole.toUpperCase().replace(/\s+/g, '_');

  const isAdmin = normRole === 'ADMIN' || normRole.includes('ADMIN') || normRole.includes('IT');
  const isSupervisor = normRole === 'SUPERVISOR' || normRole.includes('SUPERVISOR');
  const isOperator = normRole === 'OPERATOR' || normRole.includes('OPERATOR');
  const isQC = normRole === 'QC' || normRole.includes('QC');
  const isReportViewer = normRole === 'REPORT_VIEWER' || normRole.includes('REPORT') || normRole.includes('VIEWER');

  const userAssignedStages = getUserAssignedStages(user);

  // Extract selected stage mode ('all' vs specific stage ID) from store or sessionStorage
  let selectedMode = selectedStageId;
  if (!selectedMode) {
    try {
      const saved = sessionStorage.getItem('zenmeter_selected_stage_id');
      if (saved === 'all') selectedMode = 'all';
      else if (saved) selectedMode = Number(saved);
    } catch (e) { }
  }

  let visibleStageModules = userAssignedStages;
  if (!isAdmin && !isSupervisor && !isQC && !isFullAccessUser(user) && selectedMode && selectedMode !== 'all') {
    const activeMod = userAssignedStages.find(stg => Number(stg.id) === Number(selectedMode));
    if (activeMod) {
      visibleStageModules = [activeMod];
    }
  }

  return (
    <aside
      id="sidebar"
      className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-show' : ''}`}
    >
      <div className="logo-area border-bottom">
        <NavLink to="/dashboard" className="d-inline-flex align-items-center text-decoration-none" onClick={handleLinkClick}>
          {isCollapsed ? (
            <img
              src={zenIcon}
              alt="Zenmeter Icon"
              style={{ height: '36px', width: '36px', borderRadius: '6px', objectFit: 'cover' }}
            />
          ) : (
            <img
              src={zenmeterLogo}
              alt="Zenmeter Logo"
              style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
            />
          )}
        </NavLink>
      </div>

      <ul className="nav flex-column mt-2">
        <li className="px-3 py-2">
          <small className="nav-text text-uppercase text-muted fw-semibold">Main Menu</small>
        </li>
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
            title="Dashboard"
          >
            <i className="ti ti-home"></i>
            <span className="nav-text">Dashboard</span>
          </NavLink>
        </li>

        {/* MAIN PRODUCTION & DYNAMIC STAGE MODULE NAVIGATION */}
        <li>
          <NavLink
            to="/stage-production"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
            title={isAdmin ? "All Stage Production" : "Stage Production"}
          >
            <i className="ti ti-box-seam"></i>
            <span className="nav-text">{isAdmin ? "All Stage Production" : "Stage Production"}</span>
          </NavLink>
        </li>

        {(isAdmin || isSupervisor) && !isOperator && !isReportViewer && !isQC && (
          <li>
            <NavLink
              to="/supervisor-test"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={handleLinkClick}
              title="Supervisor Test"
            >
              <i className="ti ti-user-check"></i>
              <span className="nav-text">Supervisor Test</span>
            </NavLink>
          </li>
        )}

        {(isAdmin || isQC) && !isOperator && !isReportViewer && !isSupervisor && (
          <li>
            <NavLink
              to="/qc-test"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={handleLinkClick}
              title="QC Test"
            >
              <i className="ti ti-shield-check"></i>
              <span className="nav-text">QC Test</span>
            </NavLink>
          </li>
        )}

        {(isAdmin || (isReportViewer && !isQC)) && (
          <li>
            <NavLink
              to="/reports"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={handleLinkClick}
              title="Reports"
            >
              <i className="ti ti-receipt"></i>
              <span className="nav-text">Reports</span>
            </NavLink>
          </li>
        )}

        {/* SYSTEM & SUPERVISOR SECTION FOR SUPERVISORS */}
        {isSupervisor && !isAdmin && (
          <>
            <li className="px-3 pt-3 pb-2">
              <small className="nav-text text-uppercase text-muted fw-semibold">System & Supervisor</small>
            </li>
            <li>
              <NavLink
                to="/users"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={handleLinkClick}
                title="User Management"
              >
                <i className="ti ti-users"></i>
                <span className="nav-text">User Management</span>
              </NavLink>
            </li>
          </>
        )}

        {/* DYNAMIC STAGE CONSOLES ACCORDING TO LOGGED-IN USER ASSIGNED STAGES */}
        {visibleStageModules.length > 0 && !isReportViewer && !isAdmin && (
          <>
            <li className="px-3 pt-3 pb-1">
              <small className="nav-text text-uppercase text-muted fw-semibold" style={{ fontSize: '0.685rem' }}>
                Assigned Stage Modules
              </small>
            </li>
            {visibleStageModules.map((stg) => (
              <React.Fragment key={stg.id}>
                <li>
                  <NavLink
                    to={`/stages/${stg.id}`}
                    end
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={handleLinkClick}
                    title={`${stg.badge || `${stg.id}-Stage`}: ${stg.name}`}
                  >
                    <i className={`ti ${stg.icon || 'ti-tools'}`}></i>
                    <span className="nav-text">{stg.shortName || stg.name}</span>
                  </NavLink>
                </li>
                {Number(stg.id) === 4 && (
                  <li>
                    <NavLink
                      to="/stages/4/demo"
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                      onClick={handleLinkClick}
                      title="Demo Test (NIC Card Inside Print Simulation)"
                    >
                      <i className="ti ti-flask text-warning-emphasis"></i>
                      <span className="nav-text">Demo Test</span>
                      <span className="badge bg-warning-subtle text-warning border border-warning-subtle ms-auto font-mono" style={{ fontSize: '0.62rem', padding: '2px 5px' }}>
                        DEMO
                      </span>
                    </NavLink>
                  </li>
                )}
              </React.Fragment>
            ))}
          </>
        )}

        {isAdmin && (
          <>
            <li className="px-3 pt-3 pb-2">
              <small className="nav-text text-uppercase text-muted fw-semibold">System & Admin</small>
            </li>
            {(isAdmin || hasPermission('USER_VIEW')) && (
              <>
                <li>
                  <NavLink
                    to="/users"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={handleLinkClick}
                    title="Users"
                  >
                    <i className="ti ti-users"></i>
                    <span className="nav-text">User Management</span>
                  </NavLink>
                </li>
              </>
            )}
            {(isAdmin || hasPermission('ROLE_MANAGE')) && (
              <li>
                <NavLink
                  to="/roles"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={handleLinkClick}
                  title="Role Management"
                >
                  <i className="ti ti-user-shield"></i>
                  <span className="nav-text">Role Management</span>
                </NavLink>
              </li>
            )}
            {(isAdmin || hasPermission('ROLE_MANAGE') || hasPermission('SYSTEM_SETTINGS')) && (
              <li>
                <NavLink
                  to="/shifts"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={handleLinkClick}
                  title="Shift Management"
                >
                  <i className="ti ti-clock-play"></i>
                  <span className="nav-text">Shift Management</span>
                </NavLink>
              </li>
            )}
            {(isAdmin || hasPermission('STAGE_VIEW') || hasPermission('SYSTEM_SETTINGS')) && (
              <li>
                <NavLink
                  to="/stage-management"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={handleLinkClick}
                  title="Stage Management"
                >
                  <i className="ti ti-subtask"></i>
                  <span className="nav-text">Stage Management</span>
                </NavLink>
              </li>
            )}
            {(isAdmin || hasPermission('SYSTEM_SETTINGS')) && (
              <li>
                <NavLink
                  to="/settings"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={handleLinkClick}
                  title="Settings"
                >
                  <i className="ti ti-settings"></i>
                  <span className="nav-text">Settings</span>
                </NavLink>
              </li>
            )}
          </>
        )}



        <li className="px-3 pt-3 pb-2">
          <small className="nav-text text-uppercase text-muted fw-semibold">Account</small>
        </li>
        {user ? (
          <>
            <li>
              <NavLink
                to="/profile"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={handleLinkClick}
                title="User Profile"
              >
                <i className="ti ti-user-circle"></i>
                <span className="nav-text">User Profile</span>
              </NavLink>
            </li>
            <li>
              <button
                type="button"
                className="nav-link border-0 bg-transparent text-danger w-100 text-start"
                onClick={() => {
                  handleLinkClick();
                  logout();
                }}
                title="Log out"
              >
                <i className="ti ti-logout text-danger"></i>
                <span className="nav-text text-danger">Log out</span>
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink
                to="/signin"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={handleLinkClick}
                title="Sign In"
              >
                <i className="ti ti-logout"></i>
                <span className="nav-text">Sign In</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/signup"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={handleLinkClick}
                title="Sign Up"
              >
                <i className="ti ti-user-plus"></i>
                <span className="nav-text">Sign Up</span>
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;
