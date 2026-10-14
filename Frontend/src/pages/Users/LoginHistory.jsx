import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/store';
import { authService } from '../../services/authService';
import { SkeletonTable, Pagination } from '../../components/CommonComponents';

export default function LoginHistory() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Determine user role & scope
  const normRole = (user?.role || '').toUpperCase();
  const isAdmin = (normRole === 'ADMIN' || normRole.includes('ADMIN')) && !normRole.includes('SUPERVISOR');
  const scopeParam = searchParams.get('scope');
  // Non-admins (Supervisors, Operators, QC) are strictly limited to 'self'
  // Admins default to 'self' (e.g. from top-right popup) unless explicitly 'all' (from User Management)
  const currentScope = !isAdmin ? 'self' : (scopeParam === 'all' ? 'all' : 'self');

  // Date formatting helpers: dd/mm/yyyy
  const formatDateDDMMYYYY = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const normalizedStr = typeof dateStr === 'string' ? dateStr.replace(' ', 'T') : dateStr;
      const d = new Date(normalizedStr);
      if (isNaN(d.getTime())) {
        if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          const [y, m, day] = dateStr.split('-');
          return `${day}/${m}/${y}`;
        }
        return String(dateStr);
      }
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return String(dateStr);
    }
  };

  // DateTime formatting helper: dd/mm/yyyy hh:mm AM/PM
  const formatDateTimeDDMMYYYY = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const normalizedStr = typeof dateStr === 'string' ? dateStr.replace(' ', 'T') : dateStr;
      const d = new Date(normalizedStr);
      if (isNaN(d.getTime())) return String(dateStr);

      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();

      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = String(hours).padStart(2, '0');

      return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
    } catch (e) {
      return String(dateStr);
    }
  };

  // Session duration calculator
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

  const loadHistory = (scopeToLoad = currentScope) => {
    setLoading(true);
    authService.getAttendanceHistory({ scope: scopeToLoad })
      .then(res => {
        const logs = res?.data || res?.history || (Array.isArray(res) ? res : []);
        setHistory(logs);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load login history:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadHistory(currentScope);
  }, [currentScope]);

  // Filter history based on scope, search term & date filter
  const filteredHistory = history.filter(item => {
    // If viewing self scope (or non-admin): strictly show own logs
    if ((currentScope === 'self' || !isAdmin) && user) {
      const matchUserId = item.user_id && String(item.user_id) === String(user.id);
      const matchEmpId = item.employee_id && user.employee_id && item.employee_id.toLowerCase() === user.employee_id.toLowerCase();
      const matchUsername = item.user_name && user.user_name && item.user_name.toLowerCase() === user.user_name.toLowerCase();
      if (!matchUserId && !matchEmpId && !matchUsername) return false;
    }

    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || (
      (item.name || '').toLowerCase().includes(term) ||
      (item.user_name || '').toLowerCase().includes(term) ||
      (item.employee_id || '').toLowerCase().includes(term) ||
      (item.shift_name || '').toLowerCase().includes(term) ||
      (item.status || '').toLowerCase().includes(term)
    );

    const matchesDate = !filterDate || (
      item.attendance_date === filterDate ||
      (item.login_time && item.login_time.startsWith(filterDate))
    );

    return matchesSearch && matchesDate;
  });

  // Calculate paginated slice
  const totalItems = filteredHistory.length;
  const paginatedData = filteredHistory.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      {/* Header & Title */}
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h1 className="fs-3 mb-1 fw-bold text-dark d-flex align-items-center gap-2">
              <i className="ti ti-history text-primary"></i>
              <span>{currentScope === 'self' ? 'My Daily Login & Logout History' : 'User Daily Login & Logout History'}</span>
            </h1>
            <p className="text-secondary mb-0">
              {currentScope === 'self'
                ? `System-recorded personal session activity & attendance history for ${user?.name || user?.user_name || 'logged-in user'} (${user?.employee_id || ''})`
                : 'System-recorded user attendance history log with shift timing check & daily session tracking'}
            </p>
          </div>
          <button className="btn btn-outline-primary btn-sm fw-semibold shadow-xs" onClick={() => loadHistory(currentScope)}>
            <i className="ti ti-refresh me-1"></i> Refresh History Log
          </button>
        </div>
      </div>

      {/* Admin Toggle Tabs: Switch between Personal History and All System Users */}
      {isAdmin && (
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="btn-group p-1 bg-white border rounded-pill shadow-xs" role="group">
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 fw-semibold ${currentScope === 'self' ? 'btn-primary shadow-xs' : 'btn-light text-secondary'}`}
              onClick={() => {
                setSearchParams({ scope: 'self' });
                setCurrentPage(1);
              }}
            >
              <i className="ti ti-user me-1"></i>
              My Login History ({user?.name || user?.employee_id || 'Admin'})
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 fw-semibold ${currentScope === 'all' ? 'btn-primary shadow-xs' : 'btn-light text-secondary'}`}
              onClick={() => {
                setSearchParams({ scope: 'all' });
                setCurrentPage(1);
              }}
            >
              <i className="ti ti-users me-1"></i>
              All Users Login History
            </button>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white text-muted border-end-0">
                  <i className="ti ti-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search by Employee ID, User Name, or Shift..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white text-muted">
                  <i className="ti ti-calendar"></i>
                </span>
                <input
                  type="date"
                  className="form-control"
                  value={filterDate}
                  onChange={(e) => {
                    setFilterDate(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            <div className="col-md-3 text-end">
              {(searchTerm || filterDate) && (
                <button
                  className="btn btn-link text-danger text-decoration-none btn-sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterDate('');
                    setCurrentPage(1);
                  }}
                >
                  <i className="ti ti-x me-1"></i> Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* History Data Table Card */}
      <div className="card shadow-sm border-0">
        {loading ? (
          <SkeletonTable rows={8} columns={8} />
        ) : (
          <>
            <div className="table-responsive">
              <table className="table mb-0 align-middle table-hover">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '60px' }} className="text-center">S.No</th>
                    <th>Attendance Date</th>
                    <th>Employee ID & User</th>
                    <th>System Detected Shift</th>
                    <th>Daily Login Time</th>
                    <th>Daily Logout Time</th>
                    <th>Session Time</th>
                    <th>Session Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-muted">
                        <i className="ti ti-calendar-off fs-2 d-block mb-2 text-secondary opacity-50"></i>
                        <span className="fw-semibold">No attendance history records found</span>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item, index) => {
                      const isLoggedOut = item.status === 'LOGGED_OUT';
                      const isSessionOut = item.status === 'SESSION_OUT';
                      const hasLogout = !!item.logout_time;
                      const globalIndex = (currentPage - 1) * pageSize + index + 1;

                      return (
                        <tr key={item.id || index}>
                          <td className="fw-semibold text-center text-secondary">{globalIndex}</td>
                          <td className="fw-medium font-mono text-dark">
                            <i className="ti ti-calendar me-1 text-primary"></i>
                            {formatDateDDMMYYYY(item.attendance_date || item.login_time)}
                          </td>
                          <td>
                            <div className="fw-bold text-dark">{item.name || item.user_name || 'Zenmeter User'}</div>
                            <small className="text-primary font-mono text-xs">{item.employee_id || 'EMP001'}</small>
                          </td>
                          <td>
                            <span className="badge bg-primary-subtle text-primary border border-primary px-2 py-1 font-mono">
                              <i className="ti ti-clock-play me-1"></i>
                              {item.shift_name || 'General Shift'} ({item.shift_time || '09:00 AM - 06:00 PM'})
                            </span>
                          </td>
                          <td className="small font-mono fw-medium text-success">
                            <i className="ti ti-login me-1"></i>
                            {formatDateTimeDDMMYYYY(item.login_time)}
                          </td>
                          <td className="small font-mono fw-medium">
                            {hasLogout ? (
                              <span className="text-danger">
                                <i className="ti ti-logout me-1"></i>
                                {formatDateTimeDDMMYYYY(item.logout_time)}
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

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          </>
        )}
      </div>
    </>
  );
}
