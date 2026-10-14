import React, { useState, useEffect } from 'react';
import { jigService, meterService, stageManagementService } from '../../services/apiServices';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { Button, Input, Modal, SkeletonTable, Pagination } from '../../components/CommonComponents';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/store';
import { ALL_STAGE_MODULES, getUserAssignedStages, isFullAccessUser } from '../../utils/stageUtils';

export default function ProductionOverview() {
  const { user, selectedStageId } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlStage = searchParams.get('stage') || '';

  const normRole = (user?.role || '').toUpperCase().replace(/\s+/g, '_');
  const isOperator = normRole === 'OPERATOR' || (normRole.includes('OPERATOR') && !normRole.includes('SUPERVISOR') && !normRole.includes('ADMIN'));

  const isFullAccess = isFullAccessUser(user);
  const assignedStages = getUserAssignedStages(user);
  const assignedStageNumbers = assignedStages.map(s => String(s.id));

  const [jigRecords, setJigRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stageFilter, setStageFilter] = useState(() => {
    if (urlStage) return urlStage;
    if (selectedStageId && selectedStageId !== 'all') return String(selectedStageId);
    if (!isFullAccess && assignedStageNumbers.length > 0) return assignedStageNumbers[0];
    if (user?.stage_id) return String(user.stage_id);
    return isOperator ? '4' : '';
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selected Record View Modal state
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Register Meter Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meterNo, setMeterNo] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [batchNo, setBatchNo] = useState('BATCH-2026-01');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [dbStages, setDbStages] = useState([]);

  // Fetch production stages dynamically from DB
  useEffect(() => {
    stageManagementService.getStages().then(res => {
      const list = Array.isArray(res) ? res : (res?.stages || res?.data || []);
      const active = list.filter(s => s.status === true || s.status === 'true' || s.status === 'ACTIVE' || s.status === 1 || s.status === '1');
      if (active.length > 0) {
        setDbStages(active);
      }
    }).catch(e => console.error('Error fetching stages for overview:', e));
  }, []);

  // Keep stage filter in sync with URL parameter or assigned stage
  useEffect(() => {
    if (urlStage) {
      setStageFilter(urlStage);
    } else if (!isFullAccess && assignedStageNumbers.length === 1) {
      setStageFilter(assignedStageNumbers[0]);
    }
  }, [urlStage, isFullAccess]);

  const fetchJigRecords = () => {
    setLoading(true);
    const params = { search, status: statusFilter };
    if (stageFilter) {
      params.stage_id = stageFilter;
    }
    if (isOperator && user) {
      params.operator_id = user.employee_id || user.user_name || user.id;
    }
    jigService.getJigRecords(params).then(res => {
      const recordsData = Array.isArray(res) ? res : (res?.records || res?.data || []);
      setJigRecords(recordsData);
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching JIG records:', err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchJigRecords();
    setCurrentPage(1);
  }, [search, statusFilter, stageFilter, user]);

  const handleRegisterMeter = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await meterService.createMeter({
        meter_no: meterNo,
        serial_no: serialNo,
        batch_no: batchNo
      });
      setIsModalOpen(false);
      setMeterNo('');
      setSerialNo('');
      fetchJigRecords();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter records by operator, stage & search term
  const filteredRecords = jigRecords.filter(rec => {
    // 1. Strict operator filter for operators: do not show other operators' tests
    if (isOperator && user) {
      const userIdentifiers = [
        user.employee_id,
        user.user_name,
        user.name,
        String(user.id)
      ].filter(Boolean).map(s => String(s).toLowerCase().trim());

      const recOp = String(rec.operator_id || '').toLowerCase().trim();
      const recDisplay = String(rec.operator_display || '').toLowerCase().trim();

      const isMatch = userIdentifiers.some(uid => recOp === uid || recDisplay.includes(uid));
      if (!isMatch) {
        return false;
      }
    }

    // 2. Stage filter
    const recStageStr = String(rec.stage_id || rec.stage_number || rec.stage || '4');

    if (stageFilter) {
      if (recStageStr !== String(stageFilter)) {
        return false;
      }
    } else if (!isFullAccess && assignedStageNumbers.length > 0) {
      // If no stage filter selected, filter by all assigned stages for this user
      if (!assignedStageNumbers.includes(recStageStr)) {
        return false;
      }
    }

    // 3. Search filter
    if (!search) return true;
    const term = search.toLowerCase();
    const hasChannelMatch = (rec.channels || []).some(
      ch => (ch.nic_uuid && ch.nic_uuid.toLowerCase().includes(term)) || (ch.imei && String(ch.imei).includes(term))
    );

    return (
      (rec.cycle_uuid && rec.cycle_uuid.toLowerCase().includes(term)) ||
      (rec.operator_id && rec.operator_id.toLowerCase().includes(term)) ||
      (rec.operator_display && rec.operator_display.toLowerCase().includes(term)) ||
      hasChannelMatch
    );
  });

  // Compute paginated subset of records
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
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h1 className="fs-3 mb-1 fw-bold text-dark d-flex align-items-center gap-2">
              <i className="ti ti-cpu text-primary"></i>
              {stageFilter
                ? `Stage ${stageFilter} Production View`
                : !isFullAccess && assignedStageNumbers.length > 0
                  ? `Assigned Stages (${assignedStageNumbers.map(n => `Stage ${n}`).join(', ')}) Production View`
                  : 'All Factory Production Stages'}
            </h1>
            <p className="text-secondary mb-0">
              Real-time Factory Production Database Telemetry & Channel Hardware Test Records
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar with Stage Selector */}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-3 d-flex flex-wrap gap-3 align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: '680px' }}>
            {/* Search Input */}
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="ti ti-search text-muted"></i>
              </span>
              <input
                type="text"
                placeholder="Search Cycle ID / Operator / IMEI / NIC UUID..."
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
                onChange={(e) => {
                  const val = e.target.value;
                  setStageFilter(val);
                  if (val) {
                    setSearchParams({ stage: val });
                  } else {
                    setSearchParams({});
                  }
                }}
                className="form-select border-start-0 font-mono fw-semibold text-dark"
              >
                {isFullAccess ? (
                  <>
                    <option value="">All Factory Stages</option>
                    {(dbStages.length > 0 ? dbStages : ALL_STAGE_MODULES).map(stg => {
                      const sId = stg.stage_number || stg.id;
                      const sName = stg.stage_name || stg.name;
                      return (
                        <option key={sId} value={String(sId)}>
                          Stage {sId}: {sName}
                        </option>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {assignedStages.length > 1 ? (
                      <option value="">All Assigned Stages ({assignedStageNumbers.join(', ')})</option>
                    ) : assignedStages.length === 1 ? (
                      <option value={assignedStageNumbers[0]}>Stage {assignedStageNumbers[0]}: {assignedStages[0].name || assignedStages[0].stage_name}</option>
                    ) : (
                      <option value="4">Stage 4: NIC Card Inside Print</option>
                    )}
                    {assignedStages.length > 1 && assignedStages.map(stg => {
                      const sId = stg.stage_number || stg.id;
                      const sName = stg.stage_name || stg.name;
                      return (
                        <option key={sId} value={String(sId)}>
                          Stage {sId}: {sName}
                        </option>
                      );
                    })}
                    {assignedStages.length === 0 && (dbStages.length > 0 ? dbStages : ALL_STAGE_MODULES).map(stg => {
                      const sId = stg.stage_number || stg.id;
                      const sName = stg.stage_name || stg.name;
                      return (
                        <option key={sId} value={String(sId)}>
                          Stage {sId}: {sName}
                        </option>
                      );
                    })}
                  </>
                )}
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
              <option value="PASS">PASS / CON</option>
              <option value="FAIL">FAIL</option>
              <option value="DUPLICATE">DUPLICATE</option>
            </select>
            <button
              className="btn btn-sm btn-light border ms-1"
              onClick={fetchJigRecords}
              title="Refresh Data"
            >
              <i className="ti ti-refresh text-primary"></i> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* JIG Records Table - Grouped by Cycle ID */}
      {loading ? (
        <SkeletonTable rows={6} columns={8} />
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table mb-0 align-middle table-hover text-nowrap">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '60px' }}>S.No</th>
                  <th>Cycle ID</th>
                  <th>Current Stage</th>
                  <th>Channels Passed</th>
                  <th>Operator / User</th>
                  <th>Status</th>
                  <th>Saved Timestamp</th>
                  <th className="text-end pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length > 0 ? (
                  paginatedRecords.map((r, index) => {
                    const serialNoIndex = (currentPage - 1) * pageSize + index + 1;
                    const passedCnt = r.passed_channels !== undefined ? r.passed_channels : (r.channels || []).filter(c => c.status === 'PASS').length;
                    const totalCnt = r.total_channels || 8;

                    return (
                      <tr key={r.id || r.cycle_uuid || `cycle-${index}`}>
                        <td className="fw-bold text-muted">{serialNoIndex}</td>
                        <td className="fw-bold text-dark">
                          <span className="badge bg-light text-primary border fs-6 px-2.5 py-1">
                            {r.cycle_uuid || `ZMRJIG${String(r.cycle_id || 1).padStart(4, '0')}`}
                          </span>
                        </td>
                        <td className="fw-semibold text-secondary">
                          {r.stage_name || (r.stage_id ? `Stage ${String(r.stage_id).padStart(2, '0')}` : 'Stage 04: NIC Card Inside Print')}
                        </td>
                        <td>
                          <span className="badge bg-primary-subtle text-primary fw-bold px-2.5 py-1.5">
                            <i className="ti ti-cpu me-1"></i>
                            {passedCnt} / {totalCnt} Channels Passed
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1.5">
                            <i className="ti ti-user text-primary fs-6"></i>
                            <span className="fw-semibold text-dark">
                              {r.operator_display || (r.operator_id ? `${r.operator_id}` : (user?.name ? `${user.name} (${user.employee_id || ''})` : 'Operator'))}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 fw-bold">
                            <i className="ti ti-circle-check me-1"></i>
                            {r.status || 'PASS'}
                          </span>
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
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <i className="ti ti-folder-off fs-2 d-block mb-2 text-secondary opacity-50"></i>
                      <span className="fw-semibold">
                        {isOperator
                          ? `No test records found for ${user?.name || 'Operator'} (${user?.employee_id || ''}) in Stage ${stageFilter || 'Selected'}`
                          : 'No JIG Test cycle records found matching filters'}
                      </span>
                      {isOperator && (
                        <div className="mt-2">
                          <Link to={`/stages/${stageFilter || 4}`} className="btn btn-sm btn-outline-primary mt-2">
                            <i className="ti ti-cpu me-1"></i> Go to Jig Test Console
                          </Link>
                        </div>
                      )}
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

      {/* Record View Full 8-Channel Telemetry Details Modal */}
      {selectedRecord && (
        <Modal
          isOpen={Boolean(selectedRecord)}
          onClose={() => setSelectedRecord(null)}
          title={`Stage ${selectedRecord.stage_id || stageFilter || 4} Hardware Telemetry View - ${selectedRecord.cycle_uuid || 'ZMRJIG0025'}`}
          size="xl"
        >
          <div className="p-2">
            {/* Cycle Header & Summary Bar */}
            <div className="d-flex justify-content-between align-items-center p-3 mb-4 rounded-3 bg-light border flex-wrap gap-2 shadow-2xs">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className="badge bg-primary px-3 py-2 fw-bold fs-6">
                  <i className="ti ti-cpu me-1"></i>
                  {selectedRecord.cycle_uuid || `ZMRJIG${String(selectedRecord.cycle_id || 25).padStart(4, '0')}`}
                </span>
                <span className="badge bg-success-subtle text-success border border-success px-2.5 py-1.5 fw-semibold">
                  <i className="ti ti-check me-1"></i>
                  {(selectedRecord.passed_channels !== undefined ? selectedRecord.passed_channels : (selectedRecord.channels || []).filter(c => c.status === 'PASS').length)} / {selectedRecord.total_channels || 8} Passed
                </span>
                <span className="badge bg-success px-2.5 py-1.5 fw-semibold text-white">
                  <i className="ti ti-database-check me-1"></i> DB SAVED
                </span>
              </div>
              <div className="text-end">
                <div className="small fw-bold text-dark">
                  <i className="ti ti-user me-1 text-primary"></i>
                  Operator: {selectedRecord.operator_display || selectedRecord.operator_id || (user?.name ? `${user.name} (${user.employee_id || ''})` : 'Operator')}
                </div>
                <div className="small text-muted font-mono">
                  Tested: {formatDate(selectedRecord.created_at)}
                </div>
              </div>
            </div>

            {/* 8-Channel Hardware Telemetry Output Grid */}
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <i className="ti ti-layout-grid text-primary fs-5"></i>
              <span>8-Channel Hardware Telemetry Output for {selectedRecord.cycle_uuid}</span>
            </h6>

            <div className="row g-3 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((chNo) => {
                const chList = selectedRecord.channels || [];
                const chData = chList.find(c => c.channel_no === chNo || c.ch === chNo) || {};

                const statusStr = chData.status || 'NCON';
                const isPass = statusStr === 'PASS' || statusStr === 'CON';
                const isDup = statusStr === 'DUPLICATE';

                const nicUuid = chData.nic_uuid || (isPass ? `ZMRDNIC000${chNo}` : '-');
                const imeiVal = chData.imei || '-';
                const hwvVal = chData.hwv || (isPass ? 'v1.2' : '-');
                const fwvVal = chData.fwv || (isPass ? 'v2.0' : '-');
                const sigVal = chData.sig || (isPass ? '-65dBm' : '-');

                return (
                  <div className="col-lg-3 col-md-6 col-12" key={`ch-${chNo}`}>
                    <div
                      className={`border rounded-3 p-3 h-100 bg-white shadow-2xs transition-all ${isPass ? 'border-success border-2 shadow-sm' : isDup ? 'border-warning border-2' : ''}`}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                        <span className="fw-bold small text-dark d-flex align-items-center gap-1.5">
                          <i className="ti ti-box text-warning fs-6"></i>
                          <span>Channel {chNo}</span>
                        </span>
                        <span className={`badge ${isPass ? 'bg-success text-white' : (isDup ? 'bg-warning text-dark' : 'bg-secondary text-white')} px-2.5 py-1 font-mono text-uppercase`} style={{ fontSize: '11px' }}>
                          {isPass ? '✓ PASS' : (isDup ? 'DUPLICATE' : 'NCON')}
                        </span>
                      </div>

                      <div className="font-mono space-y-1" style={{ fontSize: '12px', lineHeight: '1.7' }}>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted">nic_uuid:</span>
                          <span className={`fw-bold font-mono ${nicUuid && nicUuid !== '-' ? 'text-primary' : 'text-muted'}`}>{nicUuid}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted">imei:</span>
                          <span className={`fw-semibold font-mono ${isDup ? 'text-warning text-dark' : 'text-dark'}`}>{imeiVal}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted">hwv:</span>
                          <span className="text-dark">{hwvVal}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted">fwv:</span>
                          <span className="text-dark">{fwvVal}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted">sig:</span>
                          <span className="text-dark font-mono">{sigVal}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-1.5 pt-1.5 border-top border-dashed">
                          <span className="text-muted">DB Status:</span>
                          {isPass && nicUuid ? (
                            <span className="badge bg-success-subtle text-success border border-success px-2 py-0.5 fw-semibold" style={{ fontSize: '10px' }}>
                              SAVED
                            </span>
                          ) : isDup ? (
                            <span className="badge bg-warning-subtle text-warning-emphasis border border-warning px-2 py-0.5 fw-semibold" style={{ fontSize: '10px' }}>
                              DUPLICATE / SKIPPED
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="d-flex justify-content-end pt-2">
              <button className="btn btn-secondary px-4 py-2 fw-bold" type="button" onClick={() => setSelectedRecord(null)}>
                Close Details
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Meter Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Production Meter">
        <form onSubmit={handleRegisterMeter}>
          {error && <div className="alert alert-danger py-2 px-3 small mb-3">{error}</div>}
          <Input
            label="Meter No"
            placeholder="e.g. MTR000013"
            value={meterNo}
            onChange={(e) => setMeterNo(e.target.value)}
            required
          />
          <Input
            label="Serial No"
            placeholder="e.g. SN-2026-0013"
            value={serialNo}
            onChange={(e) => setSerialNo(e.target.value)}
            required
          />
          <Input
            label="Batch No"
            value={batchNo}
            onChange={(e) => setBatchNo(e.target.value)}
            required
          />
          <div className="d-flex justify-content-end gap-2 pt-3">
            <button className="btn btn-light" type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Registering...' : 'Register Meter'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
