import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/store';
import { clearSavedStageForUser, isFullAccessUser, isSupervisorUser } from '../../utils/stageUtils';
import { showSuccessAlert } from '../../utils/swal';

const Topbar = () => {
  const navigate = useNavigate();
  const { isCollapsed, toggleSidebar, toggleMobileSidebar, user, currentShift, logout, selectedStageId, setSelectedStageId } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const profileRef = useRef(null);

  const handleClearSavedStage = () => {
    setShowProfile(false);
    clearSavedStageForUser(user);
    showSuccessAlert(
      'Stage Cache Cleared',
      'Saved stage selection preference has been cleared. Next time you log in, the stage selection page will be shown.'
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Compute Topbar Left Side Stage/Role Badge Label & Config
  const getStageBadgeConfig = () => {
    if (!user) return { label: 'Zenmeter', bgStyle: { backgroundColor: '#6c757d', color: '#ffffff' }, icon: 'ti-user' };

    const roleUpper = (user.role || '').toUpperCase();

    // 1. Admin / IT Admin -> "Admin(IT)"
    if (roleUpper === 'ADMIN' || roleUpper.includes('ADMIN')) {
      return { label: 'Admin(IT)', bgStyle: { backgroundColor: '#0f172a', color: '#ffffff' }, icon: 'ti-shield-lock' };
    }

    // 2. Supervisor -> "Supervisor"
    if (roleUpper === 'SUPERVISOR' || roleUpper.includes('SUPERVISOR')) {
      if (selectedStageId === 'all') {
        return { label: 'Supervisor (All Stages)', bgStyle: { backgroundColor: '#0284c7', color: '#ffffff' }, icon: 'ti-layout-grid' };
      }
      if (selectedStageId && selectedStageId !== 'all') {
        return { label: `Supervisor (Stage ${selectedStageId})`, bgStyle: { backgroundColor: '#0284c7', color: '#ffffff' }, icon: 'ti-user-check' };
      }
      return { label: 'Supervisor', bgStyle: { backgroundColor: '#0284c7', color: '#ffffff' }, icon: 'ti-user-check' };
    }

    // 3. QC Inspector -> "QC Inspector"
    if (roleUpper === 'QC' || roleUpper.includes('QC')) {
      return { label: 'QC Inspector', bgStyle: { backgroundColor: '#16a34a', color: '#ffffff' }, icon: 'ti-shield-check' };
    }

    // 4. Report Viewer -> "Report Viewer"
    if (roleUpper.includes('REPORT') || roleUpper.includes('VIEWER')) {
      return { label: 'Report Viewer', bgStyle: { backgroundColor: '#0891b2', color: '#ffffff' }, icon: 'ti-file-analytics' };
    }

    // 5. Stage Users / Operators (e.g. Operator (4-Stage), Operator (1-Stage), etc.)
    let stageNum = selectedStageId && selectedStageId !== 'all' ? selectedStageId : user?.stage_id;
    if (!stageNum && user?.assigned_stage) {
      const rawStage = String(user.assigned_stage).trim();
      if (/^\d+$/.test(rawStage)) {
        stageNum = rawStage;
      } else {
        const match = rawStage.match(/(\d+)/);
        if (match) stageNum = match[1];
      }
    }

    if (stageNum) {
      return { label: `Operator (${stageNum}-Stage)`, bgStyle: { backgroundColor: '#ff5c00', color: '#ffffff' }, icon: 'ti-subtask' };
    }

    if (user?.assigned_stage) {
      const stageStr = String(user.assigned_stage).trim();
      if (stageStr.toLowerCase().includes('stage')) {
        return { label: `Operator (${stageStr})`, bgStyle: { backgroundColor: '#ff5c00', color: '#ffffff' }, icon: 'ti-subtask' };
      }
      return { label: `Operator (${stageStr}-Stage)`, bgStyle: { backgroundColor: '#ff5c00', color: '#ffffff' }, icon: 'ti-subtask' };
    }

    return { label: 'Operator', bgStyle: { backgroundColor: '#ff5c00', color: '#ffffff' }, icon: 'ti-subtask' };
  };

  const stageBadge = getStageBadgeConfig();
  const isAdmin = (user?.role || '').toUpperCase().includes('ADMIN');

  return (
    <nav
      id="topbar"
      className={`navbar bg-white border-bottom fixed-top topbar px-3 ${isCollapsed ? 'full' : ''
        }`}
      style={{ marginLeft: 'unset' }}
    >
      {/* LEFT SIDE: TOGGLE BUTTONS & CURRENT STAGE/ROLE BADGE */}
      <div className="d-flex align-items-center gap-2">
        {/* DESKTOP TOGGLE BUTTON */}
        <button
          id="toggleBtn"
          className="d-none d-lg-inline-flex btn btn-light btn-icon btn-sm"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <i className="ti ti-layout-sidebar-left-expand"></i>
        </button>

        {/* MOBILE TOGGLE BUTTON */}
        <button
          id="mobileBtn"
          className="btn btn-light btn-icon btn-sm d-lg-none me-2"
          onClick={toggleMobileSidebar}
          aria-label="Toggle Mobile Sidebar"
        >
          <i className="ti ti-layout-sidebar-left-expand"></i>
        </button>

        {/* TOP BAR LEFT SIDE STAGE DISPLAY BADGE */}
        {user && (
          <div className="d-flex align-items-center gap-2 ms-2">
            <span
              className="badge px-3 py-1.5 fs-6 shadow-2xs font-mono d-flex align-items-center gap-1.5"
              style={{
                ...stageBadge.bgStyle,
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '0.85rem',
                letterSpacing: '0.2px'
              }}
              title={`Logged in stage: ${stageBadge.label}`}
            >
              <i className={`ti ${stageBadge.icon} fs-6`}></i>
              <span>{stageBadge.label}</span>
            </span>
          </div>
        )}
      </div>

      {/* RIGHT SIDE: SHIFT NAME + USER NAME & EMP ID + USER ICON DROPDOWN */}
      <div className="d-flex align-items-center gap-3">

        {/* LOGGED IN USER NAME & EMP ID & SHIFT NAME */}
        <div className="d-none d-sm-flex flex-column text-end lh-tight">
          <span className="fw-bold text-dark small">{user?.name || user?.user_name || 'Zenmeter User'}</span>
          <small className="text-muted text-xs font-mono">
            {user?.employee_id ? `${user.employee_id} • ` : ''}{currentShift?.shift_name || (typeof currentShift === 'string' ? currentShift : 'General Shift')}
          </small>
        </div>

        {/* USER PROFILE AVATAR & DROPDOWN */}
        <div className="position-relative ms-1" ref={profileRef}>
          <button
            className="btn btn-link p-0 border-0 rounded-circle d-flex align-items-center gap-2 text-decoration-none shadow-xs"
            onClick={() => setShowProfile(prev => !prev)}
            aria-label="User profile"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
              alt={user?.name || user?.username || 'User'}
              className="avatar avatar-sm rounded-circle border border-2 border-primary"
              style={{ width: '38px', height: '38px', objectFit: 'cover' }}
            />
          </button>

          {/* USER FRIENDLY UI/UX PROFILE CARD */}
          {showProfile && (
            <div
              className="dropdown-menu dropdown-menu-end p-0 show position-absolute end-0 mt-2 shadow-lg border-0 rounded-3 overflow-hidden"
              style={{ width: '280px', zIndex: 1050 }}
            >
              {/* Profile Card Header */}
              <div className="p-3 bg-primary text-white position-relative">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                    alt={user?.name || user?.username || 'User'}
                    className="avatar avatar-md rounded-circle border border-2 border-white shadow-sm"
                    style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                  />
                  <div>
                    <h6 className="mb-0 fw-bold text-white text-truncate" style={{ maxWidth: '170px' }}>
                      {user?.name || 'Zenmeter Operator'}
                    </h6>
                    <small className="opacity-90 font-mono text-xs d-block">
                      {user?.employee_id || 'EMP001'} &bull; {user?.role ? user.role.toUpperCase() : 'USER'}
                    </small>
                    <small className="opacity-75 text-xs text-truncate d-block" style={{ maxWidth: '170px' }}>
                      {user?.email || 'user@zenmeter.com'}
                    </small>
                  </div>
                </div>

                {/* Shift Pill inside profile header */}
                {currentShift && (
                  <div className="mt-2 pt-2 border-top border-white-20 d-flex justify-content-between align-items-center">
                    <small className="opacity-90 text-xs">Active Shift:</small>
                    <span className="badge bg-white text-primary fw-bold font-mono text-xs shadow-xs">
                      <i className="ti ti-clock-play me-1"></i>{currentShift.shift_name}
                    </span>
                  </div>
                )}
              </div>

              {/* Profile Card Body Menu */}
              <div className="p-2 bg-white">
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `dropdown-item py-2 px-3 rounded-2 d-flex align-items-center gap-2 fw-medium ${isActive ? 'active' : ''}`
                  }
                  onClick={() => setShowProfile(false)}
                >
                  <i className="ti ti-user-circle fs-5"></i>
                  <span>User Profile</span>
                </NavLink>

                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `dropdown-item py-2 px-3 rounded-2 d-flex align-items-center gap-2 fw-medium ${isActive ? 'active' : ''}`
                  }
                  onClick={() => setShowProfile(false)}
                >
                  <i className="ti ti-home fs-5"></i>
                  <span>Dashboard</span>
                </NavLink>

                <NavLink
                  to="/users/login-history?scope=self"
                  className={({ isActive }) =>
                    `dropdown-item py-2 px-3 rounded-2 d-flex align-items-center gap-2 fw-medium ${isActive ? 'active' : ''}`
                  }
                  onClick={() => setShowProfile(false)}
                >
                  <i className="ti ti-history fs-5"></i>
                  <span>Daily Login & Logout History</span>
                </NavLink>

                {isAdmin && (
                  <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                      `dropdown-item py-2 px-3 rounded-2 d-flex align-items-center gap-2 fw-medium ${isActive ? 'active' : ''}`
                    }
                    onClick={() => setShowProfile(false)}
                  >
                    <i className="ti ti-settings fs-5"></i>
                    <span>System Settings</span>
                  </NavLink>
                )}

                {!isFullAccessUser(user) && !isSupervisorUser(user) && (
                  <button
                    type="button"
                    className="dropdown-item py-2 px-3 rounded-2 text-warning d-flex align-items-center gap-2 fw-medium border-0 bg-transparent w-100 text-start"
                    onClick={handleClearSavedStage}
                    title="Clear saved stage preference and view all assigned stage options"
                  >
                    <i className="ti ti-trash-x fs-5 text-warning"></i>
                    <span>Clear Saved Stage Cache</span>
                  </button>
                )}

                <div className="dropdown-divider my-2"></div>

                <button
                  type="button"
                  className="dropdown-item py-2 px-3 rounded-2 text-danger d-flex align-items-center gap-2 fw-bold"
                  onClick={() => {
                    setShowProfile(false);
                    logout();
                  }}
                >
                  <i className="ti ti-logout fs-5"></i>
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Topbar;
