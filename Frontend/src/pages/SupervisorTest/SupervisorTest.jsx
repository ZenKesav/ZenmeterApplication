import React, { useState, useEffect, useRef } from 'react';
import { supervisorTestService } from '../../services/apiServices';
import { Modal, SkeletonTable, Pagination } from '../../components/CommonComponents';
import { useAuth } from '../../app/store';
import { getUserAssignedStages, isFullAccessUser } from '../../utils/stageUtils';

export default function SupervisorTest() {
  const { user } = useAuth();

  const isFullAccess = isFullAccessUser(user);
  const assignedStages = getUserAssignedStages(user);
  const assignedStageNumbers = assignedStages.map(s => String(s.id));

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selected Record View Modal state
  const [selectedRecord, setSelectedRecord] = useState(null);

  const rawRole = (user?.role || '').toUpperCase().replace(/\s+/g, '_');
  const isSupervisor = rawRole === 'SUPERVISOR' || rawRole.includes('SUPERVISOR');
  const isAdmin = rawRole === 'ADMIN' || rawRole.includes('ADMIN') || rawRole.includes('IT');

  if (!isAdmin && !isSupervisor) {
    return (
      <div className="card shadow-sm border-0 my-4 text-center py-5 bg-white">
        <div className="card-body">
          <i className="ti ti-lock-access fs-1 text-danger d-block mb-3"></i>
          <h4 className="fw-bold text-dark mb-1">Supervisor Access Restricted</h4>
          <p className="text-secondary mb-0">
            The Supervisor Test Portal is accessible exclusively by Production Supervisors and System Administrators.
          </p>
        </div>
      </div>
    );
  }

  const latestSupervisorReqRef = useRef(0);

  const fetchSupervisorTests = () => {
    const reqId = ++latestSupervisorReqRef.current;
    setLoading(true);
    const supervisorId = !isFullAccess ? (user?.employee_id || user?.user_name) : undefined;
    const assignedStagesStr = assignedStageNumbers.length > 0 ? assignedStageNumbers.join(',') : undefined;

    supervisorTestService.getTests({
      supervisor_id: supervisorId,
      stage_id: stageFilter,
      assigned_stages: !stageFilter ? assignedStagesStr : undefined,
      status: statusFilter,
      search
    }).then(res => {
      if (reqId === latestSupervisorReqRef.current) {
        const recordsData = Array.isArray(res) ? res : (res?.tests || res?.data || []);
        setTests(recordsData);
        setLoading(false);
        setInitialLoading(false);
      }
    }).catch(err => {
      if (reqId === latestSupervisorReqRef.current) {
        console.error('Error fetching Supervisor Test records:', err);
        setTests([]);
        setLoading(false);
        setInitialLoading(false);
      }
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSupervisorTests();
      setCurrentPage(1);
    }, 150);
    return () => clearTimeout(timer);
  }, [search, statusFilter, stageFilter]);

  // Filter local tests list
  const filteredRecords = tests.filter(rec => {
    if (stageFilter && String(rec.stage_id) !== String(stageFilter)) {
      return false;
    }
    if (statusFilter && String(rec.status) !== String(statusFilter)) {
      return false;
    }
    if (search) {
      const term = search.toLowerCase();
      const matchMeter = rec.meter_no && rec.meter_no.toLowerCase().includes(term);
      const matchSerial = rec.serial_no && rec.serial_no.toLowerCase().includes(term);
      const matchSup = rec.supervisor_name && rec.supervisor_name.toLowerCase().includes(term);
      const matchEmp = rec.supervisor_id && rec.supervisor_id.toLowerCase().includes(term);
      return matchMeter || matchSerial || matchSup || matchEmp;
    }
    return true;
  });

  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (e) {
      return String(dateStr);
    }
  };

  return (
    <>
      {/* Header Bar */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fs-3 mb-0 fw-bold text-dark d-flex align-items-center gap-2">
            <i className="ti ti-user-check text-primary"></i>
            Supervisor Stage Test Portal
          </h1>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card shadow-sm border mb-4">
        <div className="card-body p-3 d-flex flex-wrap gap-3 align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: '680px' }}>
            {/* Search Input */}
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                {loading && !initialLoading ? (
                  <span className="spinner-border spinner-border-sm text-primary" style={{ width: '0.85rem', height: '0.85rem' }} role="status"></span>
                ) : (
                  <i className="ti ti-search text-muted"></i>
                )}
              </span>
              <input
                type="text"
                placeholder="Search Meter No / Serial No / Supervisor / ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-control border-start-0"
              />
            </div>

            {/* Stage Dropdown Filter */}
            <div className="input-group" style={{ minWidth: '240px' }}>
              <span className="input-group-text bg-white border-end-0 text-primary">
                <i className="ti ti-subtask"></i>
              </span>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="form-select border-start-0 font-mono fw-semibold text-dark"
              >
                <option value="">
                  {isFullAccess ? 'All Stages' : 'All Assigned Stages'}
                </option>
                {assignedStages.map(stg => (
                  <option key={stg.id} value={String(stg.id)}>
                    Stage {stg.id}: {stg.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted fw-semibold uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select form-select-sm"
              style={{ minWidth: '150px' }}
            >
              <option value="">ALL STATUSES</option>
              <option value="PASS">PASS</option>
              <option value="FAIL">FAIL</option>
              <option value="HOLD">HOLD</option>
            </select>
            <button
              className="btn btn-sm btn-light border ms-1"
              onClick={fetchSupervisorTests}
              title="Refresh Data"
            >
              <i className="ti ti-refresh text-primary"></i> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Supervisor Test Records Table */}
      {initialLoading ? (
        <SkeletonTable rows={6} columns={8} />
      ) : (
        <div className="card shadow-sm border">
          <div className="table-responsive">
            <table className="table mb-0 align-middle table-hover text-nowrap">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '60px' }}>S.No</th>
                  <th>Meter / Unit ID</th>
                  <th>Serial No</th>
                  <th>Assigned Stage</th>
                  <th>Supervisor Details</th>
                  <th>Status</th>
                  <th>Remarks / Notes</th>
                  <th>Saved Timestamp</th>
                  <th className="text-end pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length > 0 ? (
                  paginatedRecords.map((r, index) => {
                    const serialNoIndex = (currentPage - 1) * pageSize + index + 1;
                    const isPass = r.status === 'PASS';
                    const isFail = r.status === 'FAIL';

                    return (
                      <tr key={r.id || `sup-test-${index}`}>
                        <td className="fw-bold text-muted">{serialNoIndex}</td>
                        <td className="fw-bold text-dark">
                          <span className="badge bg-light text-primary border fs-6 px-2.5 py-1">
                            {r.meter_no || `MTR-SUP-00${r.id}`}
                          </span>
                        </td>
                        <td className="font-mono small text-dark">
                          {r.serial_no || '-'}
                        </td>
                        <td className="fw-semibold text-secondary">
                          {r.stage_name || `Stage ${r.stage_id}`}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1.5">
                            <i className="ti ti-user-check text-primary fs-6"></i>
                            <span className="fw-semibold text-dark">{r.supervisor_name}</span>
                            <small className="text-muted font-mono">({r.supervisor_id})</small>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${isPass ? 'bg-success-subtle text-success border border-success-subtle' : isFail ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'} px-2.5 py-1 fw-bold`}>
                            <i className={`ti ${isPass ? 'ti-circle-check' : isFail ? 'ti-alert-circle' : 'ti-clock-pause'} me-1`}></i>
                            {r.status || 'PASS'}
                          </span>
                        </td>
                        <td className="small text-muted" style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.remarks || 'Validation completed'}
                        </td>
                        <td className="small text-muted font-mono">
                          {formatDate(r.created_at)}
                        </td>
                        <td className="text-end pe-4">
                          <button
                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 fw-semibold px-3"
                            onClick={() => setSelectedRecord(r)}
                          >
                            <i className="ti ti-eye fs-6"></i>
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-5 text-muted">
                      <i className="ti ti-folder-off fs-2 d-block mb-2 text-secondary opacity-50"></i>
                      <span className="fw-semibold fs-6 text-dark d-block mb-1">Data not found</span>
                      <small className="text-muted">No supervisor test records found matching the selected filters in database.</small>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredRecords.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* View Record Details Modal */}
      {selectedRecord && (
        <Modal
          isOpen={Boolean(selectedRecord)}
          onClose={() => setSelectedRecord(null)}
          title={`Supervisor Test Record #${selectedRecord.id} - ${selectedRecord.meter_no}`}
          size="lg"
        >
          <div className="p-2">
            <div className="d-flex justify-content-between align-items-center p-3 mb-3 rounded-3 bg-light border">
              <div>
                <span className="badge bg-primary px-3 py-1.5 fw-bold fs-6 me-2">
                  {selectedRecord.meter_no}
                </span>
                <span className="badge bg-outline-secondary px-2.5 py-1 text-dark border">
                  SN: {selectedRecord.serial_no || 'N/A'}
                </span>
              </div>
              <div>
                <span className={`badge ${selectedRecord.status === 'PASS' ? 'bg-success' : selectedRecord.status === 'FAIL' ? 'bg-danger' : 'bg-warning text-dark'} px-3 py-1.5 fw-bold fs-6`}>
                  {selectedRecord.status}
                </span>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="p-3 border rounded bg-white">
                  <small className="text-muted text-uppercase fw-bold d-block mb-1">Supervisor Info</small>
                  <div className="fw-bold text-dark">{selectedRecord.supervisor_name}</div>
                  <div className="text-muted font-mono small">Employee ID: {selectedRecord.supervisor_id}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 border rounded bg-white">
                  <small className="text-muted text-uppercase fw-bold d-block mb-1">Testing Stage</small>
                  <div className="fw-bold text-primary">{selectedRecord.stage_name}</div>
                  <div className="text-muted font-mono small">Saved: {formatDate(selectedRecord.created_at)}</div>
                </div>
              </div>
            </div>

            {/* Test Data JSON or Telemetry */}
            <div className="p-3 border rounded bg-light mb-3 font-mono" style={{ fontSize: '13px' }}>
              <div className="fw-bold text-dark mb-2">Recorded Hardware Telemetry Data:</div>
              <pre className="mb-0 text-dark bg-white p-2.5 rounded border">
                {(() => {
                  try {
                    const parsed = typeof selectedRecord.test_data === 'string' ? JSON.parse(selectedRecord.test_data) : selectedRecord.test_data;
                    return JSON.stringify(parsed, null, 2);
                  } catch (e) {
                    return String(selectedRecord.test_data || 'No extra telemetry');
                  }
                })()}
              </pre>
            </div>

            {selectedRecord.remarks && (
              <div className="p-3 border rounded bg-white mb-3">
                <small className="text-muted text-uppercase fw-bold d-block mb-1">Supervisor Remarks</small>
                <div className="text-dark small">{selectedRecord.remarks}</div>
              </div>
            )}

            <div className="d-flex justify-content-end pt-2">
              <button className="btn btn-secondary px-4" onClick={() => setSelectedRecord(null)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
