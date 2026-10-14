import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, roleService, stageManagementService } from '../../services/apiServices';
import { Modal, SkeletonTable, Pagination, PasswordRequirements, validatePasswordCriteria } from '../../components/CommonComponents';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '../../utils/swal';

export default function UserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [activeRoles, setActiveRoles] = useState([]);
  const [activeStages, setActiveStages] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Create User Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [empId, setEmpId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [password, setPassword] = useState('');
  const [createPasswordTouched, setCreatePasswordTouched] = useState(false);
  const [role, setRole] = useState('Operator');
  const [assignedStages, setAssignedStages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Edit User Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editGender, setEditGender] = useState('Male');
  const [editRole, setEditRole] = useState('Operator');
  const [editAssignedStages, setEditAssignedStages] = useState([]);
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editPassword, setEditPassword] = useState('');
  const [editPasswordTouched, setEditPasswordTouched] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Re-assign Stage Modal State
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [reassignUser, setReassignUser] = useState(null);
  const [reassignStages, setReassignStages] = useState([]);

  // Change Detection Refs
  const initialEditRef = useRef(null);
  const initialReassignRef = useRef([]);

  const isEditUserChanged = Boolean(
    initialEditRef.current && (
      editName.trim() !== initialEditRef.current.name ||
      editEmail.trim() !== initialEditRef.current.email ||
      editPhone.trim() !== initialEditRef.current.phone ||
      editGender !== initialEditRef.current.gender ||
      editRole !== initialEditRef.current.role ||
      editStatus !== initialEditRef.current.status ||
      (editPassword && editPassword.trim() !== '') ||
      JSON.stringify([...editAssignedStages].sort()) !== JSON.stringify([...(initialEditRef.current.assignedStages || [])].sort())
    )
  );

  const isReassignChanged = Boolean(
    initialReassignRef.current &&
    JSON.stringify([...reassignStages].sort()) !== JSON.stringify([...(initialReassignRef.current || [])].sort())
  );

  // View User Details Modal State
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [showViewPassword, setShowViewPassword] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchUsers = (searchVal = searchTerm, roleVal = roleFilter, statusVal = statusFilter) => {
    setLoading(true);
    const params = {};
    if (searchVal && searchVal.trim()) params.search = searchVal.trim();
    if (roleVal && roleVal.trim()) params.role = roleVal.trim();
    if (statusVal && statusVal.trim()) params.status = statusVal.trim();

    userService.getUsers(params).then(res => {
      setUsers(Array.isArray(res) ? res : (res?.data || res?.users || []));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  const fetchActiveRoles = () => {
    roleService.getRoles({ status: 'ACTIVE' }).then(res => {
      const fetched = Array.isArray(res) ? res : (res?.roles || res?.data || []);
      const activeOnly = fetched.filter(r => r.status === true || r.status === 'ACTIVE' || r.status === 'true' || r.status === 1);
      setActiveRoles(activeOnly);
      if (activeOnly.length > 0) {
        const firstRoleName = activeOnly[0].role_name || activeOnly[0].name;
        setRole(prev => prev || firstRoleName);
      }
    }).catch(err => {
      console.error('fetchActiveRoles error:', err);
    });
  };

  const fetchActiveStages = () => {
    stageManagementService.getStages().then(res => {
      const data = res.stages || [];
      const activeOnly = data.filter(s => s.status === true || s.status === 'true' || s.status === 'ACTIVE' || s.status === 1 || s.status === '1');
      setActiveStages(activeOnly);
    }).catch(err => {
      console.error('fetchActiveStages error:', err);
    });
  };

  useEffect(() => {
    fetchUsers();
    fetchActiveRoles();
    fetchActiveStages();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const pwdRes = validatePasswordCriteria(password);
      if (!pwdRes.isValid) {
        setError(pwdRes.message);
        showErrorAlert('Invalid Password', pwdRes.message);
        setSubmitting(false);
        return;
      }

      if (phone && phone.trim() !== '') {
        const cleanPhone = phone.trim();
        if (!/^\d{10}$/.test(cleanPhone)) {
          setError('Phone number must contain exactly 10 numeric digits (e.g. 9876543210).');
          showErrorAlert('Invalid Phone Number', 'Phone number must contain exactly 10 numeric digits (e.g. 9876543210).');
          setSubmitting(false);
          return;
        }
      }

      const selectedStageNames = assignedStages.join(', ');
      let selectedStageId = null;
      if (assignedStages.length > 0) {
        const firstStage = activeStages.find(s => `${s.stage_number} stage - ${s.stage_name}` === assignedStages[0] || s.stage_name === assignedStages[0]);
        if (firstStage) {
          selectedStageId = firstStage.stage_number || firstStage.id;
        }
      }

      const res = await userService.createUser({
        employee_id: empId,
        password,
        name,
        email,
        phone: phone ? phone.trim() : null,
        gender,
        role,
        stage_id: selectedStageId,
        assigned_stage: selectedStageNames || null,
        status: 'ACTIVE'
      });

      const alertMsg = res.message || `User '${name}' (${empId}) created successfully in Database!`;
      showSuccessAlert('User Created', alertMsg);
      setIsCreateOpen(false);
      setEmpId('');
      setName('');
      setEmail('');
      setPhone('');
      setGender('Male');
      setPassword('');
      setCreatePasswordTouched(false);
      setAssignedStages([]);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to create user.');
      showErrorAlert('Create User Failed', err.message || 'Failed to create user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (userObj) => {
    setEditUser(userObj);
    setEditName(userObj.name || '');
    setEditEmail(userObj.email || '');
    setEditPhone(userObj.phone || '');
    setEditGender(userObj.gender || 'Male');
    setEditRole(userObj.role || 'Operator');

    let initialStages = [];
    if (userObj.assigned_stage) {
      initialStages = userObj.assigned_stage.split(',').map(s => s.trim()).filter(Boolean);
    }
    setEditAssignedStages(initialStages);
    setEditStatus(userObj.status || 'ACTIVE');
    setEditPassword('');
    setEditPasswordTouched(false);

    initialEditRef.current = {
      name: (userObj.name || '').trim(),
      email: (userObj.email || '').trim(),
      phone: (userObj.phone || '').trim(),
      gender: userObj.gender || 'Male',
      role: userObj.role || 'Operator',
      assignedStages: initialStages,
      status: userObj.status || 'ACTIVE'
    };

    setIsEditOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    setSubmitting(true);
    try {
      if (editPassword && editPassword.trim() !== '') {
        const pwdRes = validatePasswordCriteria(editPassword);
        if (!pwdRes.isValid) {
          showErrorAlert('Invalid Password', pwdRes.message);
          setSubmitting(false);
          return;
        }

        const currentPwd = editUser?.raw_password || editUser?.password;
        if (currentPwd && editPassword === currentPwd) {
          showErrorAlert('Password Cannot Be Same', 'New password cannot be the same as the old password. Please enter a different password.');
          setSubmitting(false);
          return;
        }
      }

      if (editPhone && editPhone.trim() !== '') {
        const cleanPhone = editPhone.trim();
        if (!/^\d{10}$/.test(cleanPhone)) {
          showErrorAlert('Invalid Phone Number', 'Phone number must contain exactly 10 numeric digits (e.g. 9876543210).');
          setSubmitting(false);
          return;
        }
      }

      const selectedStageNames = editAssignedStages.join(', ');
      let selectedStageId = null;
      if (editAssignedStages.length > 0) {
        const firstStage = activeStages.find(s => `${s.stage_number} stage - ${s.stage_name}` === editAssignedStages[0] || s.stage_name === editAssignedStages[0]);
        if (firstStage) {
          selectedStageId = firstStage.stage_number || firstStage.id;
        }
      }

      const payload = {
        name: editName,
        email: editEmail,
        phone: editPhone ? editPhone.trim() : null,
        gender: editGender,
        role: editRole,
        stage_id: selectedStageId,
        assigned_stage: selectedStageNames || null,
        status: editStatus
      };
      if (editPassword) payload.password = editPassword;

      const res = await userService.updateUser(editUser.id, payload);
      const alertMsg = res.message || `User '${editName}' (${editUser.employee_id}) updated successfully in Database!`;
      showSuccessAlert('User Updated', alertMsg);
      setIsEditOpen(false);
      fetchUsers();
    } catch (err) {
      showErrorAlert('Update Failed', err.message || 'Failed to update user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (userObj) => {
    const newStatus = userObj.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
    try {
      const res = await userService.updateUser(userObj.id, {
        name: userObj.name,
        email: userObj.email,
        phone: userObj.phone,
        gender: userObj.gender || 'Male',
        role: userObj.role,
        stage_id: userObj.stage_id,
        assigned_stage: userObj.assigned_stage,
        status: newStatus
      });
      const alertMsg = res.message || `User '${userObj.name}' (${userObj.employee_id}) status set to ${newStatus}!`;
      showSuccessAlert('Status Updated', alertMsg);
      fetchUsers();
    } catch (err) {
      showErrorAlert('Status Update Failed', err.message || 'Failed to update user status.');
    }
  };

  const handleDelete = async (id, empIdCode) => {
    const confirmed = await showConfirmAlert({
      title: 'Delete System User?',
      text: `Are you sure you want to permanently delete user account '${empIdCode}'?`,
      icon: 'warning',
      confirmButtonText: 'Yes, Delete User',
      cancelButtonText: 'Cancel'
    });
    if (!confirmed) return;

    try {
      const res = await userService.deleteUser(id);
      const alertMsg = res.message || `User '${empIdCode}' deleted successfully from Database!`;
      showSuccessAlert('User Deleted', alertMsg);
      fetchUsers();
    } catch (err) {
      showErrorAlert('Delete Failed', err.message || 'Failed to delete user.');
    }
  };

  const handleOpenReassign = (userObj) => {
    setReassignUser(userObj);
    let initialStages = [];
    if (userObj.assigned_stage) {
      initialStages = userObj.assigned_stage.split(',').map(s => s.trim()).filter(Boolean);
    }
    setReassignStages(initialStages);
    initialReassignRef.current = initialStages;
    setIsReassignOpen(true);
  };

  const handleSaveReassign = async (e) => {
    e.preventDefault();
    if (!reassignUser) return;
    setSubmitting(true);
    try {
      const selectedStageNames = reassignStages.join(', ');
      let selectedStageId = null;
      if (reassignStages.length > 0) {
        const firstStage = activeStages.find(s => `${s.stage_number} stage - ${s.stage_name}` === reassignStages[0] || s.stage_name === reassignStages[0]);
        if (firstStage) {
          selectedStageId = firstStage.stage_number || firstStage.id;
        }
      }

      await userService.updateUser(reassignUser.id, {
        name: reassignUser.name,
        email: reassignUser.email,
        phone: reassignUser.phone,
        gender: reassignUser.gender || 'Male',
        role: reassignUser.role,
        stage_id: selectedStageId,
        assigned_stage: selectedStageNames || null,
        status: reassignUser.status || 'ACTIVE'
      });

      showSuccessAlert('Stage Re-assigned', `Production stages for '${reassignUser.name}' (${reassignUser.employee_id}) updated successfully!`);
      setIsReassignOpen(false);
      fetchUsers();
    } catch (err) {
      showErrorAlert('Re-assign Failed', err.message || 'Failed to reassign stages.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenView = (userObj) => {
    if (userObj && (userObj.id || userObj.employee_id)) {
      navigate(`/users/view/${userObj.id || userObj.employee_id}`);
    } else {
      setViewUser(userObj);
      setIsViewOpen(true);
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

  const renderAssignedStageCell = (u) => {
    if (isFullStageAccessRole(u.role)) {
      return (
        <span className="badge bg-light text-secondary border font-sans px-2.5 py-1">
          <i className="ti ti-check-all me-1 text-primary"></i>All Stages
        </span>
      );
    }

    return (
      <button
        onClick={() => handleOpenReassign(u)}
        className="btn btn-sm btn-outline-primary py-0.5 px-2.5 rounded-pill font-sans shadow-2xs fw-semibold"
        style={{ fontSize: '0.75rem' }}
        title="Re-assign Production Stages"
      >
        <i className="ti ti-refresh me-1"></i>Re-assign
      </button>
    );
  };

  const paginatedUsers = users.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const renderStageCheckboxSelector = (selectedList, setSelectedList) => {
    const toggleStage = (stageVal) => {
      if (selectedList.includes(stageVal)) {
        setSelectedList(selectedList.filter(s => s !== stageVal));
      } else {
        setSelectedList([...selectedList, stageVal]);
      }
    };

    const handleSelectAll = () => {
      const allVals = activeStages.map(s => `${s.stage_number} stage - ${s.stage_name}`);
      setSelectedList(allVals);
    };

    const handleDeselectAll = () => {
      setSelectedList([]);
    };

    return (
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <label className="form-label fw-semibold text-dark small mb-0">
            Select Assigned Stages (Tick Box Selection)
            {selectedList.length > 0 && (
              <span className="badge bg-primary text-white ms-2 px-2 py-1">
                {selectedList.length} Selected
              </span>
            )}
          </label>
          <div className="btn-group btn-group-sm">
            <button
              type="button"
              className="btn btn-link p-0 text-decoration-none small text-primary me-2 ms-0"
              onClick={handleSelectAll}
              style={{ fontSize: '0.8rem' }}
            >
              Select All
            </button>
            <span className="text-muted small me-2">|</span>
            <button
              type="button"
              className="btn btn-link p-0 text-decoration-none small text-secondary"
              onClick={handleDeselectAll}
              style={{ fontSize: '0.8rem' }}
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="border rounded bg-light-subtle p-2" style={{ maxHeight: '190px', overflowY: 'auto' }}>
          {activeStages.length === 0 ? (
            <div className="text-muted small p-2 text-center">No active stages found in Stage Management</div>
          ) : (
            activeStages.map((s) => {
              const stageVal = `${s.stage_number} stage - ${s.stage_name}`;
              const isChecked = selectedList.some(item => {
                if (!item) return false;
                const normItem = String(item).toLowerCase().trim();
                const normStageVal = stageVal.toLowerCase().trim();
                const normName = String(s.stage_name).toLowerCase().trim();
                return (
                  normItem === normStageVal ||
                  normItem === normName ||
                  normItem.includes(normName) ||
                  normStageVal.includes(normItem)
                );
              });

              return (
                <div
                  key={s.id || s.stage_number}
                  className={`form-check p-2 rounded mb-1 transition-all d-flex align-items-center justify-content-between ${isChecked ? 'bg-white shadow-sm border border-primary-subtle' : 'hover-bg-light'
                    }`}
                  onClick={() => toggleStage(stageVal)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center">
                    <input
                      className="form-check-input ms-0 me-2"
                      type="checkbox"
                      id={`stage_chk_${s.id || s.stage_number}`}
                      checked={isChecked}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleStage(stageVal);
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <label className="form-check-label user-select-none small text-dark fw-medium mb-0" style={{ cursor: 'pointer' }}>
                      <span className="fw-bold me-1 text-primary">{s.stage_number} stage</span> - {s.stage_name}
                      {s.line_type && (
                        <span className="text-muted fw-normal ms-2" style={{ fontSize: '0.75rem' }}>
                          ({s.line_type})
                        </span>
                      )}
                    </label>
                  </div>
                  {isChecked && (
                    <span className="badge bg-success-subtle text-success border border-success ms-2 small" style={{ fontSize: '0.7rem' }}>
                      <i className="ti ti-check me-1"></i>Already Assigned
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="fs-3 mb-1 fw-bold text-dark">User Management</h1>
            <p className="text-secondary mb-0">System Accounts, Employee IDs, Roles & Active/Inactive Controls</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary btn-sm fw-semibold shadow-xs" onClick={() => navigate('/users/login-history?scope=all')}>
              <i className="ti ti-history me-1"></i> View Login History
            </button>
            <button className="btn btn-primary btn-sm fw-medium shadow-sm" onClick={() => setIsCreateOpen(true)}>
              <i className="ti ti-user-plus me-1"></i> Create New User
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={6} columns={8} />
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
                    placeholder="Search Employee ID, Name, Email, Phone..."
                    value={searchTerm}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchTerm(val);
                      setCurrentPage(1);
                      fetchUsers(val, roleFilter);
                    }}
                  />
                  {searchTerm && (
                    <button
                      className="btn btn-sm btn-outline-secondary border-start-0"
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setCurrentPage(1);
                        fetchUsers('', roleFilter);
                      }}
                    >
                      <i className="ti ti-x"></i>
                    </button>
                  )}
                </div>
              </div>
              <div className="col-md-4 col-lg-3">
                <select
                  className="form-select form-select-sm"
                  value={roleFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRoleFilter(val);
                    setCurrentPage(1);
                    fetchUsers(searchTerm, val, statusFilter);
                  }}
                >
                  <option value="">All Roles</option>
                  {activeRoles.map((r, idx) => {
                    const rName = r.role_name || r.name;
                    return (
                      <option key={r.id || rName || idx} value={rName}>{rName}</option>
                    );
                  })}
                </select>
              </div>
              <div className="col-md-3 col-lg-2">
                <select
                  className="form-select form-select-sm"
                  value={statusFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStatusFilter(val);
                    setCurrentPage(1);
                    fetchUsers(searchTerm, roleFilter, val);
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
                  <th style={{ width: '60px' }} className="text-center">S.No</th>
                  <th>Employee ID</th>
                  <th>Full Name</th>
                  <th style={{ width: '110px' }}>Gender</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Assigned Role</th>
                  <th>Assigned Stage</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-5 text-muted">
                      <i className="ti ti-users-minus fs-2 d-block mb-2 text-secondary opacity-50"></i>
                      <span className="fw-semibold">Data not found</span>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u, index) => (
                    <tr key={u.id}>
                      <td className="fw-semibold text-center text-secondary">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="fw-bold text-primary">{u.employee_id}</td>
                      <td className="fw-semibold text-dark">{u.name}</td>
                      <td>
                        <span className={`badge px-2 py-1 ${u.gender === 'Female' ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-primary-subtle text-primary border border-primary-subtle'}`}>
                          <i className={`ti ${u.gender === 'Female' ? 'ti-gender-female' : 'ti-gender-male'} me-1`}></i>
                          {u.gender || 'Male'}
                        </span>
                      </td>
                      <td className="text-muted">{u.email || '-'}</td>
                      <td className="text-muted small">{u.phone || '-'}</td>
                      <td>
                        <span className={`badge border px-2 py-1 ${getRoleBadgeClass(u.role)}`}>
                          {u.role === 'REPORT_VIEWER' ? 'Production Report User' : u.role}
                        </span>
                      </td>
                      <td>
                        {renderAssignedStageCell(u)}
                      </td>
                      <td>
                        <span className={`badge px-2 py-1 ${u.status === 'INACTIVE'
                          ? 'bg-secondary-subtle text-secondary border'
                          : 'bg-success-subtle text-success border border-success'
                          }`}>
                          <i className={`ti ${u.status === 'INACTIVE' ? 'ti-circle-x' : 'ti-circle-check'} me-1`}></i>
                          {u.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          <button
                            onClick={() => handleOpenView(u)}
                            className="btn btn-sm border-0 p-1.5 rounded transition-all btn-view-hover text-info"
                            title="View Full User Details"
                            style={{ cursor: 'pointer' }}
                          >
                            <i className="ti ti-eye fs-5"></i>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="btn btn-sm border-0 p-1.5 rounded transition-all btn-edit-hover text-warning-emphasis"
                            title="Edit User"
                            style={{ cursor: 'pointer' }}
                          >
                            <i className="ti ti-edit fs-5"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.employee_id)}
                            className="btn btn-sm border-0 p-1.5 rounded transition-all btn-delete-hover text-danger"
                            title="Delete User"
                            style={{ cursor: 'pointer' }}
                          >
                            <i className="ti ti-trash fs-5"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={users.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Create User Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create System User Account">
        <form onSubmit={handleCreateUser}>
          {error && <div className="alert alert-danger py-2 px-3 small mb-3">{error}</div>}

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small">Employee ID *</label>
            <input className="form-control" placeholder="e.g. EMP006" value={empId} onChange={(e) => setEmpId(e.target.value)} required />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small">Full Name *</label>
            <input className="form-control" placeholder="e.g. Alex Operator" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small">Gender *</label>
            <div className="d-flex align-items-center gap-4 pt-1">
              <div className="form-check me-2">
                <input
                  className="form-check-input"
                  type="radio"
                  name="createUserGender"
                  id="createGenderMale"
                  value="Male"
                  checked={gender === 'Male'}
                  onChange={(e) => setGender(e.target.value)}
                  style={{ cursor: 'pointer' }}
                />
                <label className="form-check-label small fw-medium text-dark ms-1" htmlFor="createGenderMale" style={{ cursor: 'pointer' }}>
                  <i className="ti ti-gender-male text-primary me-1"></i>Male
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="createUserGender"
                  id="createGenderFemale"
                  value="Female"
                  checked={gender === 'Female'}
                  onChange={(e) => setGender(e.target.value)}
                  style={{ cursor: 'pointer' }}
                />
                <label className="form-check-label small fw-medium text-dark ms-1" htmlFor="createGenderFemale" style={{ cursor: 'pointer' }}>
                  <i className="ti ti-gender-female text-danger me-1"></i>Female
                </label>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small">Password *</label>
            <div className="input-group">
              <input
                className="form-control border-end-0"
                type={showCreatePassword ? "text" : "password"}
                placeholder="••••••••"
                maxLength={12}
                value={password}
                onFocus={() => setCreatePasswordTouched(true)}
                onChange={(e) => {
                  setPassword(e.target.value.slice(0, 12));
                  setCreatePasswordTouched(true);
                }}
                required
              />
              <button
                type="button"
                className="input-group-text bg-light border-start-0 text-muted"
                onClick={() => setShowCreatePassword(!showCreatePassword)}
                title={showCreatePassword ? "Hide password" : "Show password"}
                style={{ cursor: 'pointer' }}
              >
                <i className={`ti ${showCreatePassword ? 'ti-eye-off' : 'ti-eye'}`}></i>
              </button>
            </div>
            <PasswordRequirements password={password} isTouched={createPasswordTouched || password.length > 0} />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small">Email Address (Optional)</label>
            <input className="form-control" type="email" placeholder="alex@zenmeter.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small">Phone Number (10 Digits)</label>
            <input
              className="form-control"
              type="text"
              placeholder="e.g. 9876543210"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small">Select Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-select"
              required
            >
              {activeRoles.length > 0 ? (
                activeRoles.map((r, idx) => {
                  const rName = r.role_name || r.name;
                  const rDesc = r.role_description || r.description;
                  return (
                    <option key={r.id || rName || idx} value={rName}>
                      {r.role_id ? `${r.role_id}. ` : `${idx + 1}. `}{rName}{rDesc ? ` - ${rDesc}` : ''}
                    </option>
                  );
                })
              ) : (
                <>
                  <option value="Admin">1. Admin - Full System Administrator</option>
                  <option value="Supervisor">2. Supervisor - Production Supervisor & Assignment Manager</option>
                  <option value="Operator">3. Operator - Stage Test Execution Operator</option>
                  <option value="QC Tester">4. QC Tester - Quality Control Inspector</option>
                  <option value="Report Viewer">5. Report Viewer - Read-only Analytics & Reports Viewer</option>
                </>
              )}
            </select>
          </div>

          {/* Multi-Select Assigned Stages Checkbox Selector (Only rendered for Operator/Supervisor roles) */}
          {!isFullStageAccessRole(role) && renderStageCheckboxSelector(assignedStages, setAssignedStages)}

          <div className="d-flex justify-content-end gap-2 pt-2">
            <button className="btn btn-light" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Creating User...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit User: ${editUser?.employee_id}`}>
        <form onSubmit={handleUpdateUser}>
          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small">Full Name *</label>
            <input className="form-control" value={editName} onChange={(e) => setEditName(e.target.value)} required />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small">Gender *</label>
            <div className="d-flex align-items-center gap-4 pt-1">
              <div className="form-check me-2">
                <input
                  className="form-check-input"
                  type="radio"
                  name="editUserGender"
                  id="editGenderMale"
                  value="Male"
                  checked={editGender === 'Male'}
                  onChange={(e) => setEditGender(e.target.value)}
                  style={{ cursor: 'pointer' }}
                />
                <label className="form-check-label small fw-medium text-dark ms-1" htmlFor="editGenderMale" style={{ cursor: 'pointer' }}>
                  <i className="ti ti-gender-male text-primary me-1"></i>Male
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="editUserGender"
                  id="editGenderFemale"
                  value="Female"
                  checked={editGender === 'Female'}
                  onChange={(e) => setEditGender(e.target.value)}
                  style={{ cursor: 'pointer' }}
                />
                <label className="form-check-label small fw-medium text-dark ms-1" htmlFor="editGenderFemale" style={{ cursor: 'pointer' }}>
                  <i className="ti ti-gender-female text-danger me-1"></i>Female
                </label>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small">Email Address</label>
            <input className="form-control" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small">Phone Number (10 Digits)</label>
            <input
              className="form-control"
              type="text"
              placeholder="e.g. 9876543210"
              maxLength={10}
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small">Role *</label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              className="form-select"
              required
            >
              {activeRoles.length > 0 ? (
                activeRoles.map((r, idx) => {
                  const rName = r.role_name || r.name;
                  const rDesc = r.role_description || r.description;
                  return (
                    <option key={r.id || rName || idx} value={rName}>
                      {r.role_id ? `${r.role_id}. ` : `${idx + 1}. `}{rName}{rDesc ? ` - ${rDesc}` : ''}
                    </option>
                  );
                })
              ) : (
                <>
                  <option value="Admin">1. Admin - Full System Administrator</option>
                  <option value="Supervisor">2. Supervisor - Production Supervisor & Assignment Manager</option>
                  <option value="Operator">3. Operator - Stage Test Execution Operator</option>
                  <option value="QC Tester">4. QC Tester - Quality Control Inspector</option>
                  <option value="Report Viewer">5. Report Viewer - Read-only Analytics & Reports Viewer</option>
                </>
              )}
            </select>
          </div>

          {/* Multi-Select Assigned Stages Checkbox Selector (Only rendered for Operator/Supervisor roles) */}
          {!isFullStageAccessRole(editRole) && renderStageCheckboxSelector(editAssignedStages, setEditAssignedStages)}

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small">Account Status</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="form-select"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold text-dark small">Reset Password (Leave blank to keep unchanged)</label>
            <div className="input-group">
              <input
                className="form-control border-end-0"
                type={showEditPassword ? "text" : "password"}
                placeholder="New password..."
                maxLength={12}
                value={editPassword}
                onFocus={() => setEditPasswordTouched(true)}
                onChange={(e) => {
                  setEditPassword(e.target.value.slice(0, 12));
                  setEditPasswordTouched(true);
                }}
              />
              <button
                type="button"
                className="input-group-text bg-light border-start-0 text-muted"
                onClick={() => setShowEditPassword(!showEditPassword)}
                title={showEditPassword ? "Hide password" : "Show password"}
                style={{ cursor: 'pointer' }}
              >
                <i className={`ti ${showEditPassword ? 'ti-eye-off' : 'ti-eye'}`}></i>
              </button>
            </div>
            {editUser && editPassword && editPassword === (editUser.raw_password || editUser.password) && (
              <div className="text-danger small mt-1.5 fw-semibold d-flex align-items-center">
                <i className="ti ti-alert-triangle me-1 fs-6"></i>
                New password cannot be the same as the old password.
              </div>
            )}
            <PasswordRequirements password={editPassword} isTouched={editPasswordTouched || editPassword.length > 0} />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-light" type="button" onClick={() => setIsEditOpen(false)}>Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={submitting || !isEditUserChanged}>
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Re-assign Stages Modal */}
      <Modal isOpen={isReassignOpen} onClose={() => setIsReassignOpen(false)} title={`Re-assign Stages: ${reassignUser?.name} (${reassignUser?.employee_id})`}>
        <form onSubmit={handleSaveReassign}>
          <div className="alert alert-info py-2 px-3 small mb-3 d-flex align-items-center">
            <i className="ti ti-info-circle fs-5 me-2"></i>
            <div>
              Re-assigning production stages for user <strong className="text-dark">{reassignUser?.name}</strong> ({reassignUser?.employee_id}). Tick or untick stages below.
            </div>
          </div>

          {renderStageCheckboxSelector(reassignStages, setReassignStages)}

          <div className="d-flex justify-content-end gap-2 pt-2 border-top mt-3">
            <button className="btn btn-light" type="button" onClick={() => setIsReassignOpen(false)}>Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={submitting || !isReassignChanged}>
              <i className="ti ti-check me-1"></i>{submitting ? 'Saving...' : 'Save Stage Re-assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View User Details Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title={`User Profile Details: ${viewUser?.employee_id}`}>
        {viewUser && (
          <div className="user-profile-view">
            {/* Header Card */}
            <div className="card border-0 bg-primary-subtle p-3 mb-3 rounded-3">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-circle bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-4 shadow-sm" style={{ width: '54px', height: '54px' }}>
                  {viewUser.name ? viewUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 className="mb-1 text-primary-emphasis fw-bold">{viewUser.name}</h4>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="badge bg-primary text-white font-mono">{viewUser.employee_id}</span>
                    <span className={`badge border px-2 py-1 ${getRoleBadgeClass(viewUser.role)}`}>
                      {viewUser.role === 'REPORT_VIEWER' ? 'Production Report User' : viewUser.role}
                    </span>
                    <span className={`badge px-2 py-1 ${viewUser.status === 'INACTIVE'
                      ? 'bg-secondary-subtle text-secondary border'
                      : 'bg-success-subtle text-success border border-success'
                      }`}>
                      <i className={`ti ${viewUser.status === 'INACTIVE' ? 'ti-circle-x' : 'ti-circle-check'} me-1`}></i>
                      {viewUser.status || 'ACTIVE'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1: User Details */}
            <div className="card border shadow-none mb-3">
              <div className="card-header bg-light py-2 d-flex align-items-center">
                <i className="ti ti-user fs-5 me-2 text-primary"></i>
                <h6 className="mb-0 fw-bold text-dark">User Account Details</h6>
              </div>
              <div className="card-body p-3">
                <div className="row g-3">
                  <div className="col-md-6">
                    <span className="text-muted small d-block">Employee ID</span>
                    <strong className="text-dark font-mono fs-6">{viewUser.employee_id}</strong>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted small d-block">Full Name</span>
                    <strong className="text-dark fs-6">{viewUser.name}</strong>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted small d-block">Gender</span>
                    <span className={`badge px-2 py-1 ${viewUser.gender === 'Female' ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-primary-subtle text-primary border border-primary-subtle'}`}>
                      <i className={`ti ${viewUser.gender === 'Female' ? 'ti-gender-female' : 'ti-gender-male'} me-1`}></i>
                      {viewUser.gender || 'Male'}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted small d-block">System Username</span>
                    <span className="text-dark font-mono">{viewUser.user_name || viewUser.employee_id}</span>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted small d-block">Account Status</span>
                    <span className="fw-semibold text-success">{viewUser.status || 'ACTIVE'}</span>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted small d-block">User Password</span>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <span className="text-dark font-mono fs-6 fw-semibold">
                        {showViewPassword
                          ? (
                              (viewUser.password && !viewUser.password.startsWith('$2a$') && !viewUser.password.startsWith('$2b$') ? viewUser.password : null) ||
                              (viewUser.raw_password && !viewUser.raw_password.startsWith('$2a$') && !viewUser.raw_password.startsWith('$2b$') ? viewUser.raw_password : null) ||
                              'Admin@2324'
                            )
                          : '••••••••'}
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-light border p-1 d-inline-flex align-items-center justify-content-center text-muted ms-1"
                        style={{ width: '26px', height: '26px', cursor: 'pointer' }}
                        onClick={() => setShowViewPassword(!showViewPassword)}
                        title={showViewPassword ? "Hide password" : "Show password"}
                      >
                        <i className={`ti ${showViewPassword ? 'ti-eye-off' : 'ti-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted small d-block">Email Address</span>
                    <span className="text-dark">{viewUser.email || 'Not Provided'}</span>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted small d-block">Phone Number</span>
                    <span className="text-dark">{viewUser.phone || 'Not Provided'}</span>
                  </div>
                  <div className="col-md-12">
                    <span className="text-muted small d-block">Created At</span>
                    <span className="text-secondary small">
                      {viewUser.created_at ? format12HourDateTime(viewUser.created_at) : 'System Default User'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Role Details */}
            <div className="card border shadow-none mb-3">
              <div className="card-header bg-light py-2 d-flex align-items-center">
                <i className="ti ti-shield-check fs-5 me-2 text-primary"></i>
                <h6 className="mb-0 fw-bold text-dark">Assigned Role Details</h6>
              </div>
              <div className="card-body p-3">
                <div className="row g-3 mb-2">
                  <div className="col-md-6">
                    <span className="text-muted small d-block">Role Name</span>
                    <span className={`badge border px-2 py-1 ${getRoleBadgeClass(viewUser.role)}`}>
                      {viewUser.role}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted small d-block">Role ID</span>
                    <strong className="text-dark font-mono">#{viewUser.roleDetails?.role_id || viewUser.role_id || 1}</strong>
                  </div>
                  <div className="col-md-12">
                    <span className="text-muted small d-block">Role Description</span>
                    <p className="text-dark small mb-0 fw-medium">
                      {viewUser.roleDetails?.role_description || `${viewUser.role} System User Account`}
                    </p>
                  </div>
                </div>

                <div className="border-top pt-2 mt-2">
                  <span className="text-muted small d-block mb-1">System Permissions Granted</span>
                  <div className="d-flex flex-wrap gap-1">
                    {viewUser.roleDetails?.permissions && viewUser.roleDetails.permissions.length > 0 ? (
                      viewUser.roleDetails.permissions.map((pCode, idx) => (
                        <span key={idx} className="badge bg-light text-dark border px-2 py-1 font-mono small">
                          <i className="ti ti-lock-access me-1 text-primary"></i>{pCode}
                        </span>
                      ))
                    ) : (
                      <span className="badge bg-light text-muted border">Standard User Permissions</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Stage Full Details */}
            <div className="card border shadow-none mb-3">
              <div className="card-header bg-light py-2 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <i className="ti ti-building-factory-2 fs-5 me-2 text-primary"></i>
                  <h6 className="mb-0 fw-bold text-dark">Assigned Production Stages</h6>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary py-0 px-2"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => {
                    setIsViewOpen(false);
                    handleOpenReassign(viewUser);
                  }}
                >
                  <i className="ti ti-refresh me-1"></i>Re-assign Stages
                </button>
              </div>
              <div className="card-body p-3">
                {(!viewUser.assigned_stage && (!viewUser.stageDetailsList || viewUser.stageDetailsList.length === 0)) ? (
                  <div className="text-center py-3 text-muted bg-light rounded border border-dashed">
                    <i className="ti ti-subtask fs-3 d-block mb-1 opacity-50"></i>
                    <span className="small fw-semibold">No production stages assigned to this user</span>
                  </div>
                ) : (
                  <div className="row g-2">
                    {viewUser.stageDetailsList && viewUser.stageDetailsList.length > 0 ? (
                      viewUser.stageDetailsList.map((stg) => (
                        <div key={stg.id || stg.stage_number} className="col-12">
                          <div className="border rounded p-2.5 bg-light-subtle">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span className="badge bg-primary text-white font-mono px-2">
                                {stg.stage_number} stage
                              </span>
                              <h6 className="mb-0 fw-bold text-dark">{stg.stage_name}</h6>
                              <span className="badge bg-success-subtle text-success border border-success ms-1">
                                ACTIVE
                              </span>
                            </div>
                            <p className="text-muted small mb-1">
                              {stg.description || 'Production stage hardware testing and quality check station.'}
                            </p>
                            <div className="row g-2 text-secondary small border-top pt-2 mt-1">
                              <div className="col-sm-6">
                                <i className="ti ti-layout-grid me-1 text-muted"></i>
                                Line: <strong>{stg.line_type || 'Main Meter Assembly Line'}</strong>
                              </div>
                              <div className="col-sm-6">
                                <i className="ti ti-device-desktop me-1 text-muted"></i>
                                Station ID: <strong>{stg.hardware_station || 'Station-01'}</strong>
                              </div>
                              <div className="col-sm-6 border-top pt-1.5 mt-1">
                                <i className="ti ti-user-check me-1 text-primary"></i>
                                Assigned By: <strong>{stg.assigned_by || viewUser.assigned_by || 'John Admin (EMP001)'}</strong>
                              </div>
                              <div className="col-sm-6 border-top pt-1.5 mt-1">
                                <i className="ti ti-calendar me-1 text-primary"></i>
                                Assigned At: <strong>{format12HourDateTime(stg.assigned_at || viewUser.assigned_at || viewUser.created_at)}</strong>
                              </div>
                              {(stg.reassigned_by || viewUser.reassigned_by) && (
                                <div className="col-sm-6 border-top pt-1.5 mt-1">
                                  <i className="ti ti-refresh me-1 text-warning-emphasis"></i>
                                  Re-assigned By: <strong>{stg.reassigned_by || viewUser.reassigned_by}</strong>
                                </div>
                              )}
                              {(stg.reassigned_at || viewUser.reassigned_at) && (
                                <div className="col-sm-6 border-top pt-1.5 mt-1">
                                  <i className="ti ti-clock me-1 text-warning-emphasis"></i>
                                  Re-assigned At: <strong>{format12HourDateTime(stg.reassigned_at || viewUser.reassigned_at)}</strong>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      viewUser.assigned_stage.split(',').map((stgStr, idx) => (
                        <div key={idx} className="col-12">
                          <div className="border rounded p-2.5 bg-light-subtle">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <span className="badge bg-primary text-white font-mono px-2 py-1 fs-6">
                                {idx + 1} stage
                              </span>
                              <h6 className="mb-0 fw-bold text-dark">{stgStr.trim()}</h6>
                              <span className="badge bg-success-subtle text-success border border-success ms-1">
                                ACTIVE
                              </span>
                            </div>
                            <div className="row g-2 text-secondary small border-top pt-2 mt-1">
                              <div className="col-sm-6">
                                <i className="ti ti-user-check me-1 text-primary"></i>
                                Assigned By: <strong>{viewUser.assigned_by || 'John Admin (EMP001)'}</strong>
                              </div>
                              <div className="col-sm-6">
                                <i className="ti ti-calendar me-1 text-primary"></i>
                                Assigned At: <strong>{format12HourDateTime(viewUser.assigned_at || viewUser.created_at)}</strong>
                              </div>
                              {viewUser.reassigned_by && (
                                <div className="col-sm-6 border-top pt-1.5 mt-1">
                                  <i className="ti ti-refresh me-1 text-warning-emphasis"></i>
                                  Re-assigned By: <strong>{viewUser.reassigned_by}</strong>
                                </div>
                              )}
                              {viewUser.reassigned_at && (
                                <div className="col-sm-6 border-top pt-1.5 mt-1">
                                  <i className="ti ti-clock me-1 text-warning-emphasis"></i>
                                  Re-assigned At: <strong>{format12HourDateTime(viewUser.reassigned_at)}</strong>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-end pt-2">
              <button className="btn btn-secondary px-4" type="button" onClick={() => setIsViewOpen(false)}>Close Profile</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}


