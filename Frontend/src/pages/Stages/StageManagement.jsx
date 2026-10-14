import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../app/store';
import { stageManagementService } from '../../services/apiServices';
import { Modal, SkeletonTable, Pagination } from '../../components/CommonComponents';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '../../utils/swal';

export default function StageManagement() {
  const { user } = useAuth();
  const currentUserEmail = user?.email || user?.employee_id || 'admin@zenmeter.com';

  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Create Stage Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [stageNumber, setStageNumber] = useState(1);
  const [stageName, setStageName] = useState('');
  const [description, setDescription] = useState('');
  const [lineType, setLineType] = useState('Main Meter Assembly Line');
  const [submitting, setSubmitting] = useState(false);

  // Edit Stage Modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [editStageNumber, setEditStageNumber] = useState(1);
  const [editStageName, setEditStageName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLineType, setEditLineType] = useState('Main Meter Assembly Line');
  const [editStatus, setEditStatus] = useState(true);

  // Date formatting helper: dd/mm/yyyy hh:mm AM/PM
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

  const loadStages = () => {
    setLoading(true);
    stageManagementService.getStages().then(res => {
      const data = Array.isArray(res) ? res : (res?.data || res?.stages || []);
      const sortedData = [...data].sort((a, b) => Number(a.stage_number) - Number(b.stage_number));
      setStages(sortedData);
      // Auto-compute next stage number for create modal
      const nextNum = sortedData.length > 0 ? Math.max(...sortedData.map(s => Number(s.stage_number) || 0)) + 1 : 1;
      setStageNumber(nextNum);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadStages();
  }, []);

  const handleCreateStage = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await stageManagementService.createStage({
        stage_number: Number(stageNumber),
        stage_name: stageName,
        description: description,
        line_type: lineType,
        hardware_station: `Station-${String(stageNumber).padStart(2, '0')}`,
        status: true, // Automatically set to true on DB save
        created_by: currentUserEmail
      });

      showSuccessAlert('Stage Created', res.message || `Production Stage #${stageNumber} created successfully!`);
      setIsCreateOpen(false);
      setStageName('');
      setDescription('');
      loadStages();
    } catch (err) {
      showErrorAlert('Create Stage Failed', err.message || 'Failed to create stage.');
    } finally {
      setSubmitting(false);
    }
  };

  // Change Detection Ref
  const initialStageRef = useRef(null);

  const isStageChanged = Boolean(
    initialStageRef.current &&
    editStageNumber &&
    Number(editStageNumber) > 0 && (
      Number(editStageNumber) !== initialStageRef.current.stageNumber ||
      editStageName.trim() !== initialStageRef.current.stageName ||
      editDescription.trim() !== initialStageRef.current.description ||
      editLineType !== initialStageRef.current.lineType ||
      editStatus !== initialStageRef.current.status
    )
  );

  const handleOpenEdit = (sObj) => {
    setEditingStage(sObj);
    const num = sObj.stage_number || 1;
    const nameStr = sObj.stage_name || '';
    const descStr = sObj.description || '';
    const lType = sObj.line_type || 'Main Meter Assembly Line';
    const isActive = sObj.status === true || sObj.status === 'true' || sObj.status === 'ACTIVE' || sObj.status === 1 || sObj.status === '1';

    setEditStageNumber(num);
    setEditStageName(nameStr);
    setEditDescription(descStr);
    setEditLineType(lType);
    setEditStatus(isActive);

    initialStageRef.current = {
      stageNumber: Number(num),
      stageName: nameStr.trim(),
      description: descStr.trim(),
      lineType: lType,
      status: isActive
    };

    setIsEditOpen(true);
  };

  const handleUpdateStage = async (e) => {
    e.preventDefault();
    if (!editingStage) return;
    setSubmitting(true);
    try {
      const res = await stageManagementService.updateStage(editingStage.id, {
        stage_number: Number(editStageNumber),
        stage_name: editStageName,
        description: editDescription,
        line_type: editLineType,
        hardware_station: editingStage.hardware_station || `Station-${String(editStageNumber).padStart(2, '0')}`,
        status: editStatus,
        updated_by: currentUserEmail
      });

      showSuccessAlert('Stage Updated', res.message || `Production Stage #${editStageNumber} updated successfully!`);
      setIsEditOpen(false);
      loadStages();
    } catch (err) {
      showErrorAlert('Update Stage Failed', err.message || 'Failed to update stage.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStage = async (sObj) => {
    const confirmed = await showConfirmAlert({
      title: 'Delete Production Stage?',
      text: `Are you sure you want to delete Stage #${sObj.stage_number} '${sObj.stage_name}'?`,
      icon: 'warning',
      confirmButtonText: 'Yes, Delete Stage',
      cancelButtonText: 'Cancel'
    });
    if (!confirmed) return;

    try {
      const res = await stageManagementService.deleteStage(sObj.id);
      showSuccessAlert('Stage Deleted', res.message || `Stage '${sObj.stage_name}' deleted successfully!`);
      loadStages();
    } catch (err) {
      showErrorAlert('Delete Failed', err.message || 'Failed to delete stage.');
    }
  };

  const activeStages = stages.filter(s => s.status === true || s.status === 'true' || s.status === 'ACTIVE' || s.status === 1 || s.status === '1');
  const mainLineStages = activeStages.filter(s => (s.line_type || '').includes('Main'));
  const nicLineStages = activeStages.filter(s => (s.line_type || '').includes('NIC'));

  const conflictingStage = editingStage && editStageNumber && Number(editStageNumber) !== Number(editingStage.stage_number)
    ? stages.find(s => Number(s.stage_number) === Number(editStageNumber) && s.id !== editingStage.id)
    : null;

  const paginatedStages = stages.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      {/* Header & Title */}
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="fs-3 mb-1 fw-bold text-dark d-flex align-items-center gap-2">
              <i className="ti ti-subtask text-primary"></i>
              <span>Stage Management</span>
            </h1>
            {/* <p className="text-secondary mb-0">Configure Factory Production Flow Stages</p> */}
          </div>
          <button className="btn btn-primary btn-sm fw-semibold shadow-sm" onClick={() => setIsCreateOpen(true)}>
            <i className="ti ti-plus me-1"></i> Create New Stage
          </button>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      {/* <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 border-start border-primary border-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted fw-semibold text-uppercase d-block mb-1">Main Meter Assembly Line</small>
                <h4 className="fw-bold mb-0 text-dark">{mainLineStages.length} Active Stages</h4>
                <small className="text-primary fw-medium font-mono">Stages 1, 5, 6, 7, 8, 9, 10, 11</small>
              </div>
              <div className="p-3 bg-primary-subtle text-primary rounded-3 fs-3">
                <i className="ti ti-cpu"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 border-start border-info border-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted fw-semibold text-uppercase d-block mb-1">NIC Card Preparation Line</small>
                <h4 className="fw-bold mb-0 text-dark">{nicLineStages.length} Active Stages</h4>
                <small className="text-info-emphasis fw-medium font-mono">Stages 2, 3, 4</small>
              </div>
              <div className="p-3 bg-info-subtle text-info-emphasis rounded-3 fs-3">
                <i className="ti ti-wifi"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 border-start border-success border-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted fw-semibold text-uppercase d-block mb-1">Total Factory Flow Stages</small>
                <h4 className="fw-bold mb-0 text-dark">{activeStages.length} Total Active</h4>
                <small className="text-success fw-medium font-mono">Configured Production Pipeline</small>
              </div>
              <div className="p-3 bg-success-subtle text-success rounded-3 fs-3">
                <i className="ti ti-list-check"></i>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Stages Data Table */}
      {loading ? (
        <SkeletonTable rows={5} columns={8} />
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table mb-0 align-middle table-hover">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '60px' }} className="text-center">S.No</th>
                  <th style={{ width: '90px' }} className="text-center">Stage No</th>
                  <th>Stage Name & Line Type</th>
                  <th>Process Checks & Description</th>
                  <th>Created At / By</th>
                  <th>Updated At / By</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stages.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <i className="ti ti-subtask fs-2 d-block mb-2 text-secondary opacity-50"></i>
                      <span className="fw-semibold">No production stages found</span>
                    </td>
                  </tr>
                ) : (
                  paginatedStages.map((s, index) => {
                    const active = s.status === true || s.status === 'true' || s.status === 'ACTIVE' || s.status === 1 || s.status === '1';
                    const createdBy = s.created_by || 'admin@zenmeter.com';
                    const updatedBy = s.updated_by || '-';
                    const isNic = (s.line_type || '').includes('NIC');

                    return (
                      <tr key={s.id}>
                        {/* Plain text S.No without badge border box */}
                        <td className="fw-semibold text-center text-secondary">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="text-center fw-semibold text-dark font-mono">
                          {s.stage_number} stage
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{s.stage_name}</div>
                          <small className="text-muted text-xs">{s.line_type || 'Main Meter Assembly Line'}</small>
                        </td>
                        <td className="small text-dark text-wrap" style={{ maxWidth: '320px' }}>
                          <span className="text-secondary">{s.description || '-'}</span>
                        </td>
                        <td className="small font-mono">
                          <div className="text-dark fw-medium">{formatDateTimeDDMMYYYY(s.created_at)}</div>
                          <div className="text-muted text-xs"><i className="ti ti-user me-1"></i>{createdBy}</div>
                        </td>
                        <td className="small font-mono">
                          <div className="text-dark fw-medium">{formatDateTimeDDMMYYYY(s.updated_at)}</div>
                          <div className="text-muted text-xs">{updatedBy !== '-' ? <><i className="ti ti-user me-1"></i>{updatedBy}</> : '-'}</div>
                        </td>
                        <td>
                          <span className={`badge px-2 py-1 ${active
                            ? 'bg-success-subtle text-success border border-success'
                            : 'bg-secondary-subtle text-secondary border'
                            }`}>
                            <i className={`ti ${active ? 'ti-circle-check' : 'ti-circle-x'} me-1`}></i>
                            {active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <div className="d-flex align-items-center justify-content-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(s)}
                              className="btn btn-sm btn-action-edit border-0"
                              title="Edit Stage"
                            >
                              <i className="ti ti-edit fs-5"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteStage(s)}
                              className="btn btn-sm btn-action-delete border-0"
                              title="Delete Stage"
                            >
                              <i className="ti ti-trash fs-5"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={stages.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Create Stage Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Production Stage">
        <form onSubmit={handleCreateStage}>
          <div className="row g-2 mb-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold text-dark small">Stage Number *</label>
              <input
                type="number"
                className="form-control"
                min="1"
                value={stageNumber}
                onChange={(e) => setStageNumber(Number(e.target.value))}
                required
              />
            </div>
            <div className="col-md-8">
              <label className="form-label fw-semibold text-dark small">Stage Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. PCB Code Loading Test"
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small">Process Validation & Checks Description</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="e.g. Power & boot test, Code loading, serial no., UID, firmware update..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold text-dark small">Production Line Type *</label>
            <select
              className="form-select"
              value={lineType}
              onChange={(e) => setLineType(e.target.value)}
            >
              <option value="Main Meter Assembly Line">Main Meter Assembly Line</option>
              <option value="NIC Card Preparation Line">NIC Card Preparation Line</option>
            </select>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-2">
            <button className="btn btn-light" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Creating Stage...' : 'Create Stage'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Stage Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Stage #${editingStage?.stage_number}: ${editingStage?.stage_name || ''}`}>
        <form onSubmit={handleUpdateStage}>
          <div className="row g-2 mb-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold text-dark small">Stage Number *</label>
              <input
                type="number"
                className="form-control"
                min="1"
                value={editStageNumber}
                onChange={(e) => setEditStageNumber(e.target.value === '' ? '' : Number(e.target.value))}
                required
              />
            </div>
            <div className="col-md-8">
              <label className="form-label fw-semibold text-dark small">Stage Name *</label>
              <input
                type="text"
                className="form-control"
                value={editStageName}
                onChange={(e) => setEditStageName(e.target.value)}
                required
              />
            </div>
          </div>

          {conflictingStage && (
            <div className="alert alert-warning py-2 px-3 mb-3 d-flex align-items-center gap-2 small border-0 bg-warning-subtle text-warning-emphasis rounded-2">
              <i className="ti ti-arrows-left-right fs-4 text-warning flex-shrink-0"></i>
              <div>
                <strong>Stage #{editStageNumber}</strong> is currently assigned to <strong>"{conflictingStage.stage_name}"</strong>.
                Saving will swap <strong>Stage #{editingStage?.stage_number}</strong> and <strong>Stage #{editStageNumber}</strong> in the production table.
              </div>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small">Process Validation & Checks Description</label>
            <textarea
              className="form-control"
              rows="3"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small">Production Line Type *</label>
            <select
              className="form-select"
              value={editLineType}
              onChange={(e) => setEditLineType(e.target.value)}
            >
              <option value="Main Meter Assembly Line">Main Meter Assembly Line</option>
              <option value="NIC Card Preparation Line">NIC Card Preparation Line</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold text-dark small">Status *</label>
            <select
              className="form-select"
              value={editStatus ? 'true' : 'false'}
              onChange={(e) => setEditStatus(e.target.value === 'true')}
            >
              <option value="true">ACTIVE</option>
              <option value="false">INACTIVE</option>
            </select>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-2">
            <button className="btn btn-light" type="button" onClick={() => setIsEditOpen(false)}>Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={submitting || !isStageChanged}>
              {submitting ? 'Saving Changes...' : 'Save Stage'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
