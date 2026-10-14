import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../app/store';
import { roleService } from '../../services/apiServices';
import { Modal, SkeletonTable, Pagination } from '../../components/CommonComponents';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '../../utils/swal';

export default function RoleManagement() {
  const { user } = useAuth();
  const currentUserEmail = user?.email || user?.employee_id || 'admin@zenmeter.com';

  const [roles, setRoles] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Roles Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Create Role Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Edit Role Modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editPerms, setEditPerms] = useState([]);

  // Roles Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadRoles = (searchVal = searchTerm, statusVal = statusFilter) => {
    setLoading(true);
    const params = {};
    if (searchVal && searchVal.trim()) params.search = searchVal.trim();
    if (statusVal && statusVal.trim()) params.status = statusVal.trim();

    roleService.getRoles(params).then(res => {
      const fetchedRoles = Array.isArray(res) ? res : (res?.roles || res?.data || []);
      const fetchedPerms = res?.availablePermissions || [];
      setRoles(Array.isArray(fetchedRoles) ? fetchedRoles : []);
      setAvailablePermissions(Array.isArray(fetchedPerms) ? fetchedPerms : []);
      setLoading(false);
    }).catch(err => {
      console.error('loadRoles Error:', err);
      setRoles([]);
      setAvailablePermissions([]);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadRoles();
  }, []);

  // Format Date Helper (12-Hour AM/PM)
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const normalizedStr = typeof dateStr === 'string' ? dateStr.replace(' ', 'T') : dateStr;
      const d = new Date(normalizedStr);
      if (isNaN(d.getTime())) return String(dateStr);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');

      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = String(hours).padStart(2, '0');

      return `${year}-${month}-${day} ${formattedHours}:${minutes} ${ampm}`;
    } catch (e) {
      return String(dateStr);
    }
  };

  // Check if Role Status is Active
  const isRoleActive = (r) => {
    if (!r) return false;
    return r.status === true || r.status === 'ACTIVE' || r.status === 1 || r.status === 'true';
  };

  // Delete Role
  const handleDeleteRole = async (targetRole) => {
    if (!targetRole) return;
    const targetName = targetRole.role_name || targetRole.name;
    const targetIdentifier = targetRole.id || targetRole.role_id || targetName;
    const confirmed = await showConfirmAlert({
      title: 'Delete System Role?',
      text: `Are you sure you want to delete role '${targetName}'? Users assigned to this role may lose authorization.`,
      icon: 'warning',
      confirmButtonText: 'Yes, Delete Role',
      cancelButtonText: 'Cancel'
    });
    if (!confirmed) return;

    try {
      const res = await roleService.deleteRole(targetIdentifier);
      const alertMsg = res?.message || `Role '${targetName}' deleted successfully!`;
      showSuccessAlert('Role Deleted', alertMsg);
      loadRoles();
    } catch (err) {
      showErrorAlert('Delete Failed', err.message || 'Failed to delete role.');
    }
  };

  // Change Detection Ref
  const initialRoleRef = useRef(null);

  const isRoleChanged = Boolean(
    initialRoleRef.current && (
      (editDesc || '').trim() !== initialRoleRef.current.desc ||
      editStatus !== initialRoleRef.current.status ||
      JSON.stringify([...editPerms].sort()) !== JSON.stringify(initialRoleRef.current.perms)
    )
  );

  // Open Edit Modal
  const handleOpenEdit = (roleObj) => {
    if (!roleObj) return;
    setEditingRole(roleObj);
    const initialDesc = (roleObj.role_description || roleObj.description || '').trim();
    const initialStat = isRoleActive(roleObj) ? 'ACTIVE' : 'INACTIVE';
    const initialP = Array.isArray(roleObj.permissions) ? [...roleObj.permissions].sort() : [];
    
    setEditDesc(initialDesc);
    setEditStatus(initialStat);
    setEditPerms(initialP);

    initialRoleRef.current = {
      desc: initialDesc,
      status: initialStat,
      perms: initialP
    };

    setIsEditOpen(true);
  };

  // Handle Edit Submit
  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!editingRole) return;
    setSubmitting(true);

    try {
      const targetName = editingRole.role_name || editingRole.name;
      const targetIdentifier = editingRole.id || editingRole.role_id || targetName;
      const res = await roleService.updateRole(targetIdentifier, {
        role_description: editDesc,
        description: editDesc,
        status: editStatus === 'ACTIVE',
        updated_by: currentUserEmail
      });
      const alertMsg = res?.message || `Role '${targetName}' updated successfully!`;
      showSuccessAlert('Role Updated', alertMsg);
      setIsEditOpen(false);
      loadRoles();
    } catch (err) {
      showErrorAlert('Update Failed', err.message || 'Failed to update role.');
    } finally {
      setSubmitting(false);
    }
  };

  // Create Role Submit
  const handleCreateRole = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await roleService.createRole({
        role_name: roleName,
        name: roleName,
        role_description: roleDesc,
        description: roleDesc,
        created_by: currentUserEmail,
        permissions: selectedPerms
      });
      const alertMsg = res?.message || `Role '${roleName}' created successfully!`;
      showSuccessAlert('Role Created', alertMsg);
      setIsCreateOpen(false);
      setRoleName('');
      setRoleDesc('');
      setSelectedPerms([]);
      loadRoles();
    } catch (err) {
      setError(err.message || 'Failed to create role.');
      showErrorAlert('Create Role Failed', err.message || 'Failed to create role.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadgeClass = (rName) => {
    switch (rName) {
      case 'ADMIN': return 'bg-danger-subtle text-danger border-danger';
      case 'SUPERVISOR': return 'bg-primary-subtle text-primary border-primary';
      case 'OPERATOR': return 'bg-warning-subtle text-warning-emphasis border-warning';
      case 'QC': return 'bg-success-subtle text-success border-success';
      case 'REPORT_VIEWER': return 'bg-info-subtle text-info-emphasis border-info';
      default: return 'bg-light text-dark border';
    }
  };

  const safeRoles = Array.isArray(roles) ? roles : [];
  const paginatedRoles = safeRoles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      {/* Page Title & Action Bar */}
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="fs-3 mb-1 fw-bold text-dark d-flex align-items-center gap-2">
              <i className="ti ti-user-shield text-primary"></i>
              <span>Role Management</span>
            </h1>
            {/* <p className="text-secondary mb-0">Manage Authorization Roles, Descriptions, Status & Audit Logs</p> */}
          </div>
          <button className="btn btn-primary btn-sm fw-semibold shadow-sm" onClick={() => setIsCreateOpen(true)}>
            <i className="ti ti-plus me-1"></i> Create New Role
          </button>
        </div>
      </div>

      {/* Roles Data Table */}
      {loading ? (
        <SkeletonTable rows={5} columns={7} />
      ) : (
        <div className="card shadow-sm border-0">
          <div className="p-3 bg-light-subtle rounded-top border-bottom">
            <div className="row g-2 align-items-center">
              <div className="col-md-5 col-lg-4">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <i className="ti ti-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-sm border-start-0"
                    placeholder="Search Role Name or Description..."
                    value={searchTerm}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchTerm(val);
                      setCurrentPage(1);
                      loadRoles(val);
                    }}
                  />
                  {searchTerm && (
                    <button
                      className="btn btn-sm btn-outline-secondary border-start-0"
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setCurrentPage(1);
                        loadRoles('', statusFilter);
                      }}
                    >
                      <i className="ti ti-x"></i>
                    </button>
                  )}
                </div>
              </div>
              <div className="col-md-3 col-lg-2">
                <select
                  className="form-select form-select-sm"
                  value={statusFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStatusFilter(val);
                    setCurrentPage(1);
                    loadRoles(searchTerm, val);
                  }}
                >
                  <option value="">All Status</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table mb-0 align-middle table-hover">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '80px' }} className="text-center">S.No</th>
                  <th>Role Name</th>
                  <th>Description</th>
                  <th>Created At / By</th>
                  <th>Updated At / By</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {safeRoles.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <i className="ti ti-database-off fs-2 d-block mb-2 text-secondary opacity-50"></i>
                      <span className="fw-semibold">Data not found</span>
                    </td>
                  </tr>
                ) : (
                  paginatedRoles.map((r, index) => {
                    const active = isRoleActive(r);
                    const rId = r?.role_id || r?.id;
                    const rName = r?.role_name || r?.name || 'ROLE';
                    const rDesc = r?.role_description || r?.description || 'Custom System Role';
                    const createdBy = r?.created_by || 'admin@zenmeter.com';
                    const updatedBy = r?.updated_by || '-';

                    return (
                      <tr key={rId || rName}>
                        <td className="fw-semibold text-center text-secondary">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td>
                          <span className={`badge border px-2 py-1 ${getRoleBadgeClass(rName)}`}>
                            {rName}
                          </span>
                        </td>
                        <td className="text-dark small">{rDesc}</td>
                        <td className="small font-mono">
                          <div className="text-dark fw-medium">{formatDate(r?.created_at)}</div>
                          <div className="text-muted text-xs"><i className="ti ti-user me-1"></i>{createdBy}</div>
                        </td>
                        <td className="small font-mono">
                          <div className="text-dark fw-medium">{formatDate(r?.updated_at)}</div>
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
                              onClick={() => handleOpenEdit(r)}
                              className="btn btn-sm btn-action-edit border-0"
                              title="Edit Role"
                            >
                              <i className="ti ti-edit fs-5"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteRole(r)}
                              className="btn btn-sm btn-action-delete border-0"
                              title="Delete Role"
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
            totalItems={safeRoles.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Create Role Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create System Authorization Role">
        <form onSubmit={handleCreateRole}>
          {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small">Role Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. AUDITOR"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value.toUpperCase())}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small">Role Description *</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Enter details of role authorization scope..."
              value={roleDesc}
              onChange={(e) => setRoleDesc(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="d-flex justify-content-end gap-2 pt-2">
            <button className="btn btn-light" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Creating Role...' : 'Create Role'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit System Role: ${editingRole?.role_name || editingRole?.name}`}>
        <form onSubmit={handleUpdateRole}>
          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small">Role Description *</label>
            <textarea
              className="form-control"
              rows="3"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold text-dark small">Role Status</label>
            <select
              className="form-select"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
          <div className="d-flex justify-content-end gap-2 pt-2">
            <button className="btn btn-light" type="button" onClick={() => setIsEditOpen(false)}>Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={submitting || !isRoleChanged}>
              {submitting ? 'Updating Role...' : 'Save Role'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
