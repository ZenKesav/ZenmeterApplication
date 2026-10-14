import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/store';
import { getUserAssignedStages, isFullAccessUser, isSupervisorUser, saveStageForUser } from '../../utils/stageUtils';
import zenmeterLogo from '../../assets/images/zenmeter_logo.png';

export default function StageSelection() {
  const navigate = useNavigate();
  const { user, currentShift, logout, setSelectedStageId } = useAuth();

  const assignedStages = getUserAssignedStages(user);
  const isFullAccess = isFullAccessUser(user);
  const isSupervisor = isSupervisorUser(user);

  useEffect(() => {
    if (isSupervisor) {
      navigate('/dashboard', { replace: true });
    }
  }, [isSupervisor, navigate]);

  const normRole = (user?.role || '').toUpperCase().replace(/\s+/g, '_');
  const isOperator = normRole === 'OPERATOR' || (normRole.includes('OPERATOR') && !normRole.includes('SUPERVISOR'));

  const handleSelectStage = (stageId) => {
    saveStageForUser(user, stageId);
    if (setSelectedStageId) {
      setSelectedStageId(stageId);
    }
    // replace: true ensures hitting browser back button does not get trapped on selection page or login
    if (stageId === 'all') {
      navigate('/dashboard', { replace: true });
    } else {
      navigate(`/stages/${stageId}`, { replace: true });
    }
  };

  return (
    <div className="min-vh-100 w-100 bg-light d-flex flex-column justify-content-between p-3 p-md-4 p-lg-5" style={{ backgroundColor: '#f8fafc' }}>
      <div>
        {/* STANDALONE TOP HEADER BAR WITH LOGO & LOGOUT BUTTON */}
        <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
          <div className="d-flex align-items-center gap-3">
            <img src={zenmeterLogo} alt="Zenmeter Logo" style={{ height: '42px', width: 'auto' }} />
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="d-none d-sm-flex flex-column text-end lh-tight">
              <span className="fw-bold text-dark small">{user?.name || user?.user_name || 'Zenmeter Operator'}</span>
              <small className="text-muted text-xs font-mono">
                {user?.employee_id || 'EMP001'} &bull; {currentShift?.shift_name || 'General Shift'}
              </small>
            </div>
            <button
              className="btn btn-outline-danger btn-sm fw-semibold d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 shadow-xs"
              onClick={logout}
              title="Logout of account"
            >
              <i className="ti ti-logout fs-6"></i>
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* CONTAINER MATCHING IMAGE 2 EXACTLY */}
        <div className="mx-auto" style={{ maxWidth: '1280px' }}>
          {/* WELCOME BANNER (DARK NAVY CARD MATCHING IMAGE 2) */}
          <div
            className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 text-white"
            style={{ backgroundColor: '#0f172a' }}
          >
            <div className="card-body p-4 p-md-5">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                <div>
                  {/* BADGES ROW: ROLE | EMP ID | SHIFT */}
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span
                      className="badge px-3 py-1.5 font-mono text-uppercase shadow-2xs"
                      style={{ backgroundColor: '#fef08a', color: '#854d0e', fontWeight: 'bold', fontSize: '0.75rem' }}
                    >
                      {user?.role || 'OPERATOR'}
                    </span>
                    {user?.employee_id && (
                      <span
                        className="badge bg-white text-dark font-mono px-3 py-1.5 shadow-2xs"
                        style={{ fontWeight: 'bold', fontSize: '0.75rem' }}
                      >
                        {user.employee_id}
                      </span>
                    )}
                    {currentShift?.shift_name && (
                      <span
                        className="badge font-mono px-3 py-1.5 shadow-2xs"
                        style={{ backgroundColor: '#cff4fc', color: '#055160', fontWeight: 'bold', fontSize: '0.75rem' }}
                      >
                        {currentShift.shift_name}
                      </span>
                    )}
                  </div>

                  <h1 className="h2 fw-bold mb-2 text-white">
                    Welcome, {user?.name?.split(' ')[0] || user?.user_name || 'Operator'}!
                  </h1>
                  <p className="text-white-50 mb-0 fs-6">
                    {isFullAccess
                      ? 'You have full factory stage access. Select any stage console below to launch its dashboard.'
                      : `You are assigned to ${assignedStages.length} production stage${assignedStages.length > 1 ? 's' : ''}. Select a stage console to launch its dashboard.`}
                  </p>
                </div>

                <div className="align-self-start align-self-md-center">
                  <span className="badge bg-white text-dark font-mono px-3.5 py-2 fs-6 shadow-sm rounded-3 d-inline-flex align-items-center gap-2">
                    <i className="ti ti-subtask text-danger fs-5"></i>
                    <span>{assignedStages.length} Assigned Stages</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION HEADER MATCHING IMAGE 2 */}
          <div className="mb-4">
            <h3 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <i className="ti ti-chart-histogram text-danger fs-3"></i>
              Select Production Stage Dashboard
            </h3>
            <p className="text-secondary small mb-0">
              Click on any assigned stage card below to directly open its execution console &amp; dashboard.
            </p>
          </div>

          {/* STAGE CARDS GRID MATCHING IMAGE 2 */}
          {assignedStages.length === 0 ? (
            <div className="card shadow-sm border-0 p-5 text-center my-4 rounded-4 bg-white">
              <i className="ti ti-subtask fs-1 text-secondary opacity-50 mb-3 d-block"></i>
              <h5 className="fw-bold text-dark mb-2">No Stages Assigned</h5>
              <p className="text-muted small mb-0">
                Please contact your System Administrator or Supervisor to assign production stages to your account.
              </p>
            </div>
          ) : (
            <div className="row g-4">
              {assignedStages.length > 1 && !isOperator && (
                <div className="col-12 col-md-6 col-xl-4">
                  <div
                    className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden bg-white stage-card-hover position-relative"
                    style={{
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      cursor: 'pointer',
                      borderLeft: '4px solid #0284c7'
                    }}
                    onClick={() => handleSelectStage('all')}
                  >
                    <div className="card-body p-4 d-flex flex-column justify-content-between">
                      <div>
                        {/* CARD TOP BADGES: ALL STAGES & ACTIVE STATUS */}
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <span
                            className="badge text-white font-mono px-3 py-1.5 rounded-2"
                            style={{ backgroundColor: '#0f172a', fontSize: '0.8rem', fontWeight: 'bold' }}
                          >
                            ALL STAGES
                          </span>
                          <span
                            className="badge border px-2.5 py-1 font-mono rounded-2 d-flex align-items-center gap-1"
                            style={{ backgroundColor: '#d1e7dd', color: '#0f5132', borderColor: '#a3cfbb' }}
                          >
                            <i className="ti ti-circle-check"></i>
                            <span>ACTIVE</span>
                          </span>
                        </div>

                        {/* STAGE TITLE & ICON */}
                        <div className="d-flex align-items-start gap-3 mb-2">
                          <div
                            className="rounded-3 p-2.5 d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ backgroundColor: '#e0f2fe', color: '#0284c7', width: '48px', height: '48px' }}
                          >
                            <i className="ti ti-layout-grid fs-3"></i>
                          </div>
                          <div>
                            <h5 className="fw-bold text-dark mb-0.5 lh-sm">All Assigned Stages</h5>
                            <span className="text-secondary small fw-medium">All Stages Dashboard Console</span>
                          </div>
                        </div>

                        {/* DESCRIPTION */}
                        <p className="text-muted small mb-3 mt-2 lh-base" style={{ fontSize: '0.835rem', minHeight: '38px' }}>
                          Access and monitor all {assignedStages.length} assigned production stage consoles and metrics simultaneously.
                        </p>

                        {/* METADATA BOX */}
                        <div className="p-3 bg-light rounded-3 border text-secondary mb-3" style={{ fontSize: '0.785rem' }}>
                          <div className="row g-2">
                            <div className="col-12 col-sm-6">
                              <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Production Line:</span>
                              <strong className="text-dark">
                                <i className="ti ti-layout-grid me-1 text-primary"></i>
                                All Assigned Lines
                              </strong>
                            </div>
                            <div className="col-12 col-sm-6">
                              <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Station ID:</span>
                              <strong className="text-dark font-mono">
                                <i className="ti ti-device-desktop me-1 text-primary"></i>
                                All Stations ({assignedStages.length})
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* LAUNCH ALL STAGES CONSOLE BUTTON */}
                      <button
                        className="btn text-white w-100 fw-semibold py-2.5 d-flex align-items-center justify-content-center gap-2 rounded-3 shadow-xs"
                        style={{ backgroundColor: '#0284c7', borderColor: '#0284c7' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectStage('all');
                        }}
                      >
                        <span>Launch All Stages Console</span>
                        <i className="ti ti-arrow-right fs-5"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {assignedStages.map((stg) => (
                <div key={stg.id} className="col-12 col-md-6 col-xl-4">
                  <div
                    className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden bg-white stage-card-hover"
                    style={{
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleSelectStage(stg.id)}
                  >
                    <div className="card-body p-4 d-flex flex-column justify-content-between">
                      <div>
                        {/* CARD TOP BADGES: STAGE NUMBER & ACTIVE STATUS */}
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <span
                            className="badge text-white font-mono px-3 py-1.5 rounded-2"
                            style={{ backgroundColor: '#ff5c00', fontSize: '0.8rem', fontWeight: 'bold' }}
                          >
                            {stg.stage_number || stg.id} stage
                          </span>
                          <span
                            className="badge border px-2.5 py-1 font-mono rounded-2 d-flex align-items-center gap-1"
                            style={{ backgroundColor: '#d1e7dd', color: '#0f5132', borderColor: '#a3cfbb' }}
                          >
                            <i className="ti ti-circle-check"></i>
                            <span>ACTIVE</span>
                          </span>
                        </div>

                        {/* STAGE TITLE & ICON */}
                        <div className="d-flex align-items-start gap-3 mb-2">
                          <div
                            className="rounded-3 p-2.5 d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ backgroundColor: '#ffe8de', color: '#ff5c00', width: '48px', height: '48px' }}
                          >
                            <i className={`ti ${stg.icon || 'ti-tools'} fs-3`}></i>
                          </div>
                          <div>
                            <h5 className="fw-bold text-dark mb-0.5 lh-sm">{stg.name}</h5>
                            <span className="text-secondary small fw-medium">{stg.shortName}</span>
                          </div>
                        </div>

                        {/* DESCRIPTION */}
                        <p className="text-muted small mb-3 mt-2 lh-base" style={{ fontSize: '0.835rem', minHeight: '38px' }}>
                          {stg.description || 'Hardware testing, assembly line operation and quality checking console.'}
                        </p>

                        {/* METADATA BOX */}
                        <div className="p-3 bg-light rounded-3 border text-secondary mb-3" style={{ fontSize: '0.785rem' }}>
                          <div className="row g-2">
                            <div className="col-12 col-sm-6">
                              <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Production Line:</span>
                              <strong className="text-dark">
                                <i className="ti ti-layout-grid me-1 text-danger"></i>
                                {stg.lineType || (stg.id > 1 && stg.id < 5 ? 'NIC Card Preparation Line' : 'Main Meter Assembly Line')}
                              </strong>
                            </div>
                            <div className="col-12 col-sm-6">
                              <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Station ID:</span>
                              <strong className="text-dark font-mono">
                                <i className="ti ti-device-desktop me-1 text-danger"></i>
                                {stg.hardwareStation || `Station-0${stg.id}`}
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* LAUNCH STAGE CONSOLE BUTTON */}
                      <button
                        className="btn text-white w-100 fw-semibold py-2.5 d-flex align-items-center justify-content-center gap-2 rounded-3 shadow-xs"
                        style={{ backgroundColor: '#eb5e28', borderColor: '#eb5e28' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectStage(stg.id);
                        }}
                      >
                        <span>Launch Stage Console</span>
                        <i className="ti ti-arrow-right fs-5"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center text-muted small mt-5 pt-3 border-top" style={{ fontSize: '0.75rem' }}>
        &copy; 2026 Zenmeter - Redefining Metering Possibilities. All rights reserved.
      </div>
    </div>
  );
}
