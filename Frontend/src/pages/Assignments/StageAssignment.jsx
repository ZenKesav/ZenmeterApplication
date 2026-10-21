import React, { useState, useEffect } from 'react';
import { assignmentService, userService, stageManagementService } from '../../services/apiServices';
import { PRODUCTION_STAGES } from '../../constants/stages';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { Modal, LoadingSpinner, Pagination } from '../../components/CommonComponents';

export default function StageAssignment() {
  const [assignments, setAssignments] = useState([]);
  const [operators, setOperators] = useState([]);
  const [stagesList, setStagesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // New assignment modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState('');
  const [selectedStage, setSelectedStage] = useState('1');
  const [stationId, setStationId] = useState('JIG-01');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      assignmentService.getAssignments(),
      userService.getUsers(),
      stageManagementService.getStages().catch(() => ({ stages: [] }))
    ]).then(([assignRes, userRes, stagesRes]) => {
      const aList = Array.isArray(assignRes) ? assignRes : (assignRes?.data || assignRes?.assignments || []);
      setAssignments(aList);
      const uList = Array.isArray(userRes) ? userRes : (userRes?.data || userRes?.users || []);
      const opers = uList.filter(u => (u.role || '').toUpperCase() === 'OPERATOR');
      setOperators(opers);
      if (opers.length > 0) setSelectedOperator(opers[0].employee_id);

      const sList = Array.isArray(stagesRes) ? stagesRes : (stagesRes?.stages || stagesRes?.data || []);
      const activeStages = sList.filter(s => s.status === true || s.status === 'true' || s.status === 'ACTIVE' || s.status === 1 || s.status === '1');
      if (activeStages.length > 0) {
        setStagesList(activeStages);
        setSelectedStage(String(activeStages[0].stage_number || activeStages[0].id));
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const res = await assignmentService.assignStage({
        employee_id: selectedOperator,
        stage_id: Number(selectedStage),
        station_id: stationId
      });
      setMessage(res.message);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to assign stage.');
    } finally {
      setSubmitting(false);
    }
  };

  const paginatedAssignments = assignments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="fs-3 mb-0 fw-bold text-dark">Stage & Station Assignments</h1>
          </div>
          <button className="btn btn-primary btn-sm fw-medium shadow-sm" onClick={() => setIsModalOpen(true)}>
            <i className="ti ti-plus me-1"></i> Create New Assignment
          </button>
        </div>
      </div>

      {message && (
        <div className="alert alert-success py-2 px-3 small mb-3">
          <i className="ti ti-check me-1"></i> {message}
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Fetching Current Assignments..." />
      ) : (
        <div className="card shadow-sm border">
          <div className="table-responsive">
            <table className="table mb-0 align-middle table-hover">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '60px' }} className="text-center">S.No</th>
                  <th>Operator</th>
                  <th>Employee ID</th>
                  <th>Assigned Stage</th>
                  <th>Hardware Station</th>
                  <th>Assigned By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAssignments.map((a, index) => (
                  <tr key={a.id}>
                    <td className="fw-semibold text-center text-secondary">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="fw-bold text-dark">
                      <i className="ti ti-user-check me-2 text-primary"></i>
                      <span>{a.operator_name || a.employee_id}</span>
                    </td>
                    <td><span className="badge bg-light text-dark border">{a.employee_id}</span></td>
                    <td className="fw-semibold text-primary">{a.stage_name}</td>
                    <td className="text-muted">{a.station_id}</td>
                    <td className="text-muted">{a.assigned_by}</td>
                    <td><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
                {assignments.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <i className="ti ti-folder-off fs-2 d-block mb-2 text-secondary opacity-50"></i>
                      <span className="fw-semibold">Data not found</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={assignments.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Assign Stage Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Stage to Operator">
        <form onSubmit={handleAssign}>
          {error && <div className="alert alert-danger py-2 px-3 small mb-3">{error}</div>}

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small">Select Operator</label>
            <select
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              className="form-select"
              required
            >
              {operators.map((op) => (
                <option key={op.id} value={op.employee_id}>
                  {op.name} ({op.employee_id})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small">Select Production Stage</label>
            <select
              value={selectedStage}
              onChange={(e) => {
                setSelectedStage(e.target.value);
                setStationId(`JIG-0${e.target.value}`);
              }}
              className="form-select"
              required
            >
              {(stagesList.length > 0 ? stagesList : PRODUCTION_STAGES).map((stg) => {
                const sId = stg.stage_number || stg.id;
                const sName = stg.stage_name || stg.name;
                const isManual = stg.isManual || (stg.description && stg.description.toLowerCase().includes('manual'));
                return (
                  <option key={sId} value={sId}>
                    Stage {sId}: {sName} {isManual ? '(MANUAL)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small">Station / Jig ID</label>
            <input
              type="text"
              className="form-control"
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
              required
            />
          </div>

          <div className="d-flex justify-content-end gap-2 pt-3">
            <button className="btn btn-light" type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Assigning...' : 'Assign Stage'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
