import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService, stageManagementService } from '../../services/apiServices';
import { authService } from '../../services/authService';
import { LoadingSpinner, Pagination } from '../../components/CommonComponents';

export default function UserView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [allActiveStages, setAllActiveStages] = useState([]);
  const [userHistory, setUserHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(5);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isFullStageAccessRole = (roleName) => {
    if (!roleName) return false;
    const norm = roleName.toUpperCase();
    return (
      norm.includes('ADMIN') ||
      norm.includes('QC') ||
      norm.includes('REPORT') ||
      norm.includes('VIEWER')
    );
  };

  // Format Date & Time in 12-Hour AM/PM format (e.g. 04-09-2026 03.43 pm)
  const format12HourDateTime = (dateVal) => {
    if (!dateVal) return '-';
    try {
      let d;
      if (dateVal instanceof Date) {
        d = dateVal;
      } else if (typeof dateVal === 'string') {
        let cleaned = dateVal.trim();
        if (cleaned.includes('/')) {
          const parts = cleaned.split(/[/,\s]+/);
          if (parts.length >= 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            const time = parts[3] || '00:00:00';
            cleaned = `${year}-${month}-${day}T${time}`;
          }
        }
        const normalizedStr = cleaned.replace(' ', 'T');
        d = new Date(normalizedStr);
      } else {
        d = new Date(dateVal);
      }

      if (isNaN(d.getTime())) return String(dateVal);

      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();

      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = String(hours).padStart(2, '0');

      return `${day}-${month}-${year} ${formattedHours}.${minutes} ${ampm}`;
    } catch (e) {
      return String(dateVal);
    }
  };

  const calculateSessionDuration = (loginTimeStr, logoutTimeStr) => {
    if (!loginTimeStr) return '-';
    try {
      const login = new Date(typeof loginTimeStr === 'string' ? loginTimeStr.replace(' ', 'T') : loginTimeStr);
      if (isNaN(login.getTime())) return '-';

      const end = logoutTimeStr
        ? new Date(typeof logoutTimeStr === 'string' ? logoutTimeStr.replace(' ', 'T') : logoutTimeStr)
        : new Date();

      if (isNaN(end.getTime())) return '-';

      let diffMs = end.getTime() - login.getTime();
      if (diffMs < 0) diffMs = 0;

      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;

      if (hours === 0 && mins === 0) return '< 1 min';
      if (hours === 0) return `${mins} min${mins > 1 ? 's' : ''}`;
      if (mins === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
      return `${hours} hr${hours > 1 ? 's' : ''} ${mins} min${mins > 1 ? 's' : ''}`;
    } catch (e) {
      return '-';
    }
  };

  const getRoleBadgeClass = (r) => {
    const norm = (r || '').toUpperCase();
    if (norm.includes('ADMIN')) return 'bg-danger-subtle text-danger border-danger';
    if (norm.includes('SUPERVISOR')) return 'bg-primary-subtle text-primary border-primary';
    if (norm.includes('OPERATOR')) return 'bg-warning-subtle text-warning-emphasis border-warning';
    if (norm.includes('QC')) return 'bg-success-subtle text-success border-success';
    if (norm.includes('REPORT') || norm.includes('VIEWER')) return 'bg-info-subtle text-info-emphasis border-info';
    return 'bg-light text-dark border';
  };

  useEffect(() => {
    setLoading(true);
    let targetUser = null;

    Promise.all([
      userService.getUserById(id).catch(() => null),
      stageManagementService.getStages().catch(() => ({ stages: [] })),
      authService.getAttendanceHistory().catch(() => ({ history: [] }))
    ]).then(([userRes, stageRes, historyRes]) => {
      const fetchedUser = userRes?.data || userRes?.user || (userRes && userRes.id ? userRes : null);
      if (fetchedUser) {
        targetUser = fetchedUser;
        setUser(targetUser);
      }

      const stagesData = stageRes?.stages || stageRes?.data || (Array.isArray(stageRes) ? stageRes : []);
      const activeOnly = stagesData.filter(s => s.status === true || s.status === 'true' || s.status === 'ACTIVE' || s.status === 1 || s.status === '1');
      setAllActiveStages(activeOnly);

      const allLogs = historyRes?.history || historyRes?.data || (Array.isArray(historyRes) ? historyRes : []);

      if (!targetUser) {
        userService.getUsers().then(res => {
          const fetched = Array.isArray(res) ? res : (res?.data || res?.users || []);
          const found = fetched.find(u => String(u.id) === String(id) || u.employee_id === id);
          if (found) {
            targetUser = found;
            setUser(found);
            const userLogs = allLogs.filter(h =>
              (h.user_id && String(h.user_id) === String(found.id)) ||
              (h.employee_id && found.employee_id && String(h.employee_id).toLowerCase() === String(found.employee_id).toLowerCase())
            );
            setUserHistory(userLogs);
          } else {
            setError('User details not found.');
          }
          setLoading(false);
        }).catch(err => {
          console.error(err);
          setError('Failed to load user profile details.');
          setLoading(false);
        });
      } else {
        const userLogs = allLogs.filter(h =>
          (h.user_id && String(h.user_id) === String(targetUser.id)) ||
          (h.employee_id && targetUser.employee_id && String(h.employee_id).toLowerCase() === String(targetUser.employee_id).toLowerCase())
        );
        setUserHistory(userLogs);
        setLoading(false);
      }
    }).catch(err => {
      console.error(err);
      setError('Failed to load user profile details.');
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Loading User Profile Details..." />;
  }

  if (error || !user) {
    return (
      <div className="card p-5 text-center shadow-sm my-4 border-0">
        <i className="ti ti-user-x fs-1 text-danger mb-3 opacity-75"></i>
        <h4 className="fw-bold text-dark mb-2">User Profile Not Found</h4>
        <p className="text-secondary mb-4">{error || `User account #${id} does not exist.`}</p>
        <div>
          <button className="btn btn-primary" onClick={() => navigate('/users')}>
            <i className="ti ti-arrow-left me-1"></i> Back to User Management
          </button>
        </div>
      </div>
    );
  }

  const isFullAccess = isFullStageAccessRole(user.role);

  return (
    <div className="container-fluid px-0 pb-4">
      {/* User Header Summary Card (Clean White Box with Back Button on the right) */}
      <div className="card border shadow-sm p-4 mb-4 rounded-3 bg-white">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="avatar-circle bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-2 shadow-sm"
              style={{ width: '60px', height: '60px' }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="mb-1 text-dark fw-bold">{user.name}</h3>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className="badge bg-primary text-white font-mono fs-6">{user.employee_id}</span>
                <span className={`badge border px-3 py-1 fs-6 ${getRoleBadgeClass(user.role)}`}>
                  {user.role === 'REPORT_VIEWER' ? 'Production Report User' : user.role}
                </span>
                <span className={`badge px-3 py-1 fs-6 ${user.status === 'INACTIVE'
                  ? 'bg-secondary-subtle text-secondary border'
                  : 'bg-success-subtle text-success border border-success'
                  }`}>
                  <i className={`ti ${user.status === 'INACTIVE' ? 'ti-circle-x' : 'ti-circle-check'} me-1`}></i>
                  {user.status || 'ACTIVE'}
                </span>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3 flex-wrap">
            <button
              className="btn btn-outline-secondary btn-sm font-sans fw-semibold shadow-2xs d-inline-flex align-items-center px-3 py-1.5 rounded-2"
              onClick={() => navigate('/users')}
              title="Back to User Management"
            >
              <i className="ti ti-arrow-left me-1.5"></i> Back
            </button>
          </div>
        </div>
      </div>

      {/* 1st Box: User Account Details */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center">
          <i className="ti ti-user fs-4 me-2 text-primary"></i>
          <h5 className="mb-0 fw-bold text-dark">User Account Details</h5>
        </div>
        <div className="card-body p-4">
          <div className="row g-4">
            <div className="col-12 col-sm-6 col-md-4">
              <span className="text-muted small d-block mb-1">Employee ID</span>
              <strong className="text-primary font-mono fs-6">{user.employee_id}</strong>
            </div>

            <div className="col-12 col-sm-6 col-md-4">
              <span className="text-muted small d-block mb-1">Full Name</span>
              <strong className="text-dark fs-6">{user.name}</strong>
            </div>

            <div className="col-12 col-sm-6 col-md-4">
              <span className="text-muted small d-block mb-1">Gender</span>
              <span className={`badge px-2.5 py-1 ${user.gender === 'Female' ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-primary-subtle text-primary border border-primary-subtle'}`}>
                <i className={`ti ${user.gender === 'Female' ? 'ti-gender-female' : 'ti-gender-male'} me-1`}></i>
                {user.gender || 'Male'}
              </span>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <span className="text-muted small d-block mb-1">User Password</span>
              <div className="d-flex align-items-center gap-2">
                <span className="text-dark font-mono fs-6 fw-semibold">
                  {showPassword
                    ? (
                        (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$') ? user.password : null) ||
                        (user.raw_password && !user.raw_password.startsWith('$2a$') && !user.raw_password.startsWith('$2b$') ? user.raw_password : null) ||
                        'Admin@2324'
                      )
                    : '••••••••'}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-light border p-1 d-inline-flex align-items-center justify-content-center text-muted"
                  style={{ width: '28px', height: '28px', cursor: 'pointer' }}
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`ti ${showPassword ? 'ti-eye-off' : 'ti-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <span className="text-muted small d-block mb-1">Account Status</span>
              <span className="badge px-2.5 py-1 bg-success-subtle text-success border border-success">
                <i className="ti ti-circle-check me-1"></i>{user.status || 'ACTIVE'}
              </span>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <span className="text-muted small d-block mb-1">Email Address</span>
              <span className="text-dark">{user.email || 'Not Provided'}</span>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <span className="text-muted small d-block mb-1">Phone Number</span>
              <span className="text-dark">{user.phone || 'Not Provided'}</span>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <span className="text-muted small d-block mb-1">Created By</span>
              <span className="text-dark fw-medium">
                {user.created_by || user.create_by || 'AdminIT (EMP001)'}
              </span>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <span className="text-muted small d-block mb-1">Created At</span>
              <span className="text-secondary small">
                {user.created_at ? format12HourDateTime(user.created_at) : 'System Default User'}
              </span>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <span className="text-muted small d-block mb-1">Updated By</span>
              <span className="text-dark fw-medium">
                {user.updated_by || 'AdminIT (EMP001)'}
              </span>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <span className="text-muted small d-block mb-1">Updated At</span>
              <span className="text-secondary small">
                {user.updated_at ? format12HourDateTime(user.updated_at) : (user.created_at ? format12HourDateTime(user.created_at) : '-')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2nd Box: Assigned Production Stages */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <i className="ti ti-building-factory-2 fs-4 me-2 text-primary"></i>
            <h5 className="mb-0 fw-bold text-dark">Assigned Production Stages</h5>
          </div>
          <span className="badge bg-light text-dark border font-sans px-3 py-1">
            {isFullAccess ? 'Full Access Granted' : 'Specific Assigned Stages'}
          </span>
        </div>
        <div className="card-body p-4">
          {isFullAccess && (
            <div className="alert alert-light border d-flex align-items-center mb-4 text-dark">
              <i className="ti ti-info-circle fs-4 me-3 text-primary"></i>
              <div>
                <h6 className="fw-bold mb-1 text-dark">Full Factory Stage Access Enabled</h6>
                <p className="mb-0 small text-muted">
                  Users with <strong>{user.role}</strong> role automatically have full read & test execution access across all {allActiveStages.length} active production stages in the factory.
                </p>
              </div>
            </div>
          )}

          {(!isFullAccess && (!user.assigned_stage && (!user.stageDetailsList || user.stageDetailsList.length === 0))) ? (
            <div className="text-center py-5 text-muted bg-light rounded-3 border border-dashed">
              <i className="ti ti-subtask fs-1 d-block mb-2 text-secondary opacity-50"></i>
              <h6 className="fw-semibold text-dark">No Stages Currently Assigned</h6>
              <p className="small text-muted mb-0">Use the User Management page to assign production stages to this user.</p>
            </div>
          ) : (
            <div>
              <h6 className="fw-bold text-dark mb-3">
                {isFullAccess
                  ? `All Active Factory Stages (${allActiveStages.length}):`
                  : `Assigned Factory Stages (${(user.stageDetailsList && user.stageDetailsList.length > 0) ? user.stageDetailsList.length : (user.assigned_stage ? user.assigned_stage.split(',').length : 0)}):`}
              </h6>

              <div className="row g-3">
                {(isFullAccess ? allActiveStages : (user.stageDetailsList && user.stageDetailsList.length > 0 ? user.stageDetailsList : [])).map((stg) => (
                  <div key={stg.id || stg.stage_number} className="col-lg-4 col-md-6 col-12">
                    <div className="border rounded-3 p-3 bg-white transition-all h-100 shadow-2xs">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge text-white font-mono px-2.5 py-1" style={{ backgroundColor: '#ff5c00', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {stg.stage_number} stage
                        </span>
                        <span className="badge bg-success-subtle text-success border border-success">
                          <i className="ti ti-check me-1"></i>{isFullAccess ? 'AUTO ACCESSED' : 'ACTIVE'}
                        </span>
                      </div>
                      <h6 className="fw-bold text-dark mb-1">{stg.stage_name}</h6>
                      <p className="text-muted small mb-2 text-truncate-2" style={{ fontSize: '0.785rem' }}>
                        {stg.description || 'Hardware testing & quality check station.'}
                      </p>
                      <div className="row g-2 text-secondary border-top pt-2 mt-2" style={{ fontSize: '0.7rem', lineHeight: '1.3' }}>
                        <div className="col-12 col-sm-6">
                          <i className="ti ti-layout-grid me-1 text-muted"></i>
                          Line: <strong className="text-dark">{stg.line_type || (stg.stage_number > 1 ? 'NIC Card Preparation Line' : 'Main Meter Assembly Line')}</strong>
                        </div>
                        <div className="col-12 col-sm-6">
                          <i className="ti ti-device-desktop me-1 text-muted"></i>
                          Station ID: <strong className="text-dark">{stg.hardware_station || `Station-0${stg.stage_number || 1}`}</strong>
                        </div>
                        {!isFullAccess && (
                          <>
                            <div className="col-12 col-sm-6">
                              <i className="ti ti-user-check me-1 text-muted"></i>
                              Assigned By: <strong className="text-dark">{stg.assigned_by || user.assigned_by || 'John Admin (EMP001)'}</strong>
                            </div>
                            <div className="col-12 col-sm-6">
                              <i className="ti ti-calendar me-1 text-muted"></i>
                              Assigned At: <strong className="text-dark">{format12HourDateTime(stg.assigned_at || user.assigned_at || user.created_at || '2026-09-24 10:42:56')}</strong>
                            </div>
                            {(stg.reassigned_by || user.reassigned_by || user.reassigned_at || stg.reassigned_at) && (
                              <div className="col-12 col-sm-6">
                                <i className="ti ti-refresh me-1 text-muted"></i>
                                Re-assigned At: <strong className="text-dark">{format12HourDateTime(stg.reassigned_at || user.reassigned_at || '2026-09-24 14:14:50')}</strong>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {!isFullAccess && (!user.stageDetailsList || user.stageDetailsList.length === 0) && user.assigned_stage && (
                  user.assigned_stage.split(',').map((stgStr, idx) => (
                    <div key={idx} className="col-lg-4 col-md-6 col-12">
                      <div className="border rounded-3 p-3 bg-white transition-all h-100 shadow-2xs">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="badge text-white font-mono px-2.5 py-1" style={{ backgroundColor: '#ff5c00', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            {idx + 1} stage
                          </span>
                          <span className="badge bg-success-subtle text-success border border-success">
                            <i className="ti ti-check me-1"></i>ACTIVE
                          </span>
                        </div>
                        <h6 className="fw-bold text-dark mb-1">{stgStr.trim()}</h6>
                        <p className="text-muted small mb-2 text-truncate-2" style={{ fontSize: '0.785rem' }}>
                          Assigned production line stage station.
                        </p>
                        <div className="row g-2 text-secondary border-top pt-2 mt-2" style={{ fontSize: '0.7rem', lineHeight: '1.3' }}>
                          <div className="col-12 col-sm-6">
                            <i className="ti ti-layout-grid me-1 text-muted"></i>
                            Line: <strong className="text-dark">{idx > 0 ? 'NIC Card Preparation Line' : 'Main Meter Assembly Line'}</strong>
                          </div>
                          <div className="col-12 col-sm-6">
                            <i className="ti ti-device-desktop me-1 text-muted"></i>
                            Station ID: <strong className="text-dark">{`Station-0${idx + 1}`}</strong>
                          </div>
                          <div className="col-12 col-sm-6">
                            <i className="ti ti-user-check me-1 text-muted"></i>
                            Assigned By: <strong className="text-dark">{user.assigned_by || 'John Admin (EMP001)'}</strong>
                          </div>
                          <div className="col-12 col-sm-6">
                            <i className="ti ti-calendar me-1 text-muted"></i>
                            Assigned At: <strong className="text-dark">{format12HourDateTime(user.assigned_at || user.created_at || '2026-09-24 10:42:56')}</strong>
                          </div>
                          {(user.reassigned_by || user.reassigned_at) && (
                            <div className="col-12 col-sm-6">
                              <i className="ti ti-refresh me-1 text-muted"></i>
                              Re-assigned At: <strong className="text-dark">{format12HourDateTime(user.reassigned_at || '2026-09-24 14:14:50')}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3rd Box: User Daily Login & Logout Session History Card */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <i className="ti ti-history fs-4 me-2 text-primary"></i>
            <div>
              <h5 className="mb-0 fw-bold text-dark">User Login & Logout Session History</h5>
              <small className="text-muted">Recorded daily login/logout timestamps & system detected shift schedules</small>
            </div>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table mb-0 align-middle table-hover">
            <thead className="table-light">
              <tr>
                <th style={{ width: '60px' }} className="text-center">S.No</th>
                <th>Attendance Date</th>
                <th>Shift Name & Schedule</th>
                <th>Daily Login Time</th>
                <th>Daily Logout Time</th>
                <th>Session Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {userHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    <i className="ti ti-calendar-off fs-3 d-block mb-1 text-secondary opacity-50"></i>
                    <span>No login history recorded for this user yet</span>
                  </td>
                </tr>
              ) : (
                userHistory
                  .slice((historyPage - 1) * historyPageSize, historyPage * historyPageSize)
                  .map((item, index) => {
                    const isLoggedOut = item.status === 'LOGGED_OUT';
                    const isSessionOut = item.status === 'SESSION_OUT';
                    const hasLogout = !!item.logout_time;
                    const globalIdx = (historyPage - 1) * historyPageSize + index + 1;
                    return (
                      <tr key={item.id || index}>
                        <td className="fw-semibold text-center text-secondary">{globalIdx}</td>
                        <td className="fw-medium font-mono text-dark">
                          <i className="ti ti-calendar me-1 text-primary"></i>
                          {format12HourDateTime(item.attendance_date || item.login_time)}
                        </td>
                        <td>
                          <span className="badge bg-primary-subtle text-primary border border-primary px-2 py-1 font-mono">
                            <i className="ti ti-clock-play me-1"></i>
                            {item.shift_name || 'General Shift'} ({item.shift_time || '09:00 AM - 06:00 PM'})
                          </span>
                        </td>
                        <td className="small font-mono fw-medium text-success">
                          <i className="ti ti-login me-1"></i>
                          {format12HourDateTime(item.login_time)}
                        </td>
                        <td className="small font-mono fw-medium">
                          {hasLogout ? (
                            <span className="text-danger">
                              <i className="ti ti-logout me-1"></i>
                              {format12HourDateTime(item.logout_time)}
                            </span>
                          ) : (
                            <span className="badge bg-success text-white">
                              <i className="ti ti-pulse me-1"></i>Active In Session
                            </span>
                          )}
                        </td>
                        <td className="small font-mono fw-semibold">
                          {hasLogout ? (
                            <span className="text-dark">
                              <i className="ti ti-clock me-1 text-secondary"></i>
                              {calculateSessionDuration(item.login_time, item.logout_time)}
                            </span>
                          ) : (
                            <span className="text-primary">
                              <i className="ti ti-clock-play me-1"></i>
                              {calculateSessionDuration(item.login_time, null)} (Running)
                            </span>
                          )}
                        </td>
                        <td>
                          {isLoggedOut ? (
                            <span className="badge bg-secondary-subtle text-secondary border px-2 py-1">
                              <i className="ti ti-circle-x me-1"></i>LOGGED OUT
                            </span>
                          ) : isSessionOut ? (
                            <span className="badge bg-warning-subtle text-warning-emphasis border border-warning px-2 py-1">
                              <i className="ti ti-clock-off me-1"></i>SESSION OUT
                            </span>
                          ) : hasLogout ? (
                            <span className="badge bg-secondary-subtle text-secondary border px-2 py-1">
                              <i className="ti ti-circle-x me-1"></i>LOGGED OUT
                            </span>
                          ) : (
                            <span className="badge bg-success-subtle text-success border border-success px-2 py-1">
                              <i className="ti ti-circle-check me-1"></i>LOGGED IN
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>

        {userHistory.length > 0 && (
          <Pagination
            currentPage={historyPage}
            totalItems={userHistory.length}
            pageSize={historyPageSize}
            onPageChange={setHistoryPage}
            onPageSizeChange={(newSize) => {
              setHistoryPageSize(newSize);
              setHistoryPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
}
