import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../app/store';
import { shiftService } from '../../services/apiServices';
import { authService } from '../../services/authService';
import { Modal, SkeletonTable, Pagination } from '../../components/CommonComponents';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '../../utils/swal';

export default function ShiftManagement() {
  const { user } = useAuth();
  const currentUserEmail = user?.email || user?.employee_id || 'admin@zenmeter.com';

  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const [selectedDate, setSelectedDate] = useState('');

  // Current year & 15 upcoming years options (2026 to 2041)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 16 }, (_, i) => String(currentYear + i));

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeekList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Helper to dynamically calculate calendar weeks for any given Year and Month
  const getDynamicWeekScheduleOptions = (yearStr, monthName) => {
    const baseOptions = ['ALL (Every Week)'];

    if (!yearStr || !monthName || monthName === 'ALL') {
      return [
        ...baseOptions,
        'Week 1 (1st - 7th)',
        'Week 2 (8th - 14th)',
        'Week 3 (15th - 21st)',
        'Week 4 (22nd - 28th)',
        'Week 5 (29th - End)'
      ];
    }

    const year = parseInt(yearStr, 10);
    const monthIdx = monthsList.indexOf(monthName);
    if (isNaN(year) || monthIdx === -1) {
      return [
        ...baseOptions,
        'Week 1 (1st - 7th)',
        'Week 2 (8th - 14th)',
        'Week 3 (15th - 21st)',
        'Week 4 (22nd - 28th)',
        'Week 5 (29th - End)'
      ];
    }

    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    const monthShort = monthName.slice(0, 3);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const dynamicWeeks = [];
    let weekNumber = 1;
    let startDay = 1;

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, monthIdx, day);
      const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat

      if (dayOfWeek === 6 || day === daysInMonth) {
        const startDate = new Date(year, monthIdx, startDay);
        const endDate = d;

        const sDayStr = String(startDay).padStart(2, '0');
        const eDayStr = String(day).padStart(2, '0');
        const sDayName = dayNames[startDate.getDay()];
        const eDayName = dayNames[endDate.getDay()];

        dynamicWeeks.push(`Week ${weekNumber} (${monthShort} ${sDayStr} ${sDayName} - ${monthShort} ${eDayStr} ${eDayName})`);

        weekNumber++;
        startDay = day + 1;
      }
    }

    return [...baseOptions, ...dynamicWeeks];
  };

  // Helper to compute ISO date string (YYYY-MM-DD) from year, month, and week/day selection
  const computeShiftDate = (yr, mth, wk) => {
    const year = parseInt(yr, 10) || new Date().getFullYear();
    const monthIdx = monthsList.indexOf(mth);
    const m = monthIdx >= 0 ? monthIdx : new Date().getMonth();
    const monthStr = String(m + 1).padStart(2, '0');

    // If wk is a specific day of week like Wednesday
    const targetDayIdx = daysOfWeekList.indexOf(wk);
    if (targetDayIdx !== -1) {
      for (let d = 1; d <= 31; d++) {
        const dt = new Date(year, m, d);
        if (dt.getMonth() === m && dt.getDay() === targetDayIdx) {
          return `${year}-${monthStr}-${String(d).padStart(2, '0')}`;
        }
      }
    }

    // Extract start day number from dynamic week string like "Week 1 (Sep 01 Tue - Sep 05 Sat)"
    const dayMatch = wk && wk.match(/\b\d{2}\b|\b\d{1}\b/);
    if (dayMatch) {
      const dayNum = parseInt(dayMatch[0], 10);
      if (dayNum >= 1 && dayNum <= 31) {
        return `${year}-${monthStr}-${String(dayNum).padStart(2, '0')}`;
      }
    }

    return `${year}-${monthStr}-01`;
  };

  // Create Shift Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [shiftName, setShiftName] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [duration, setDuration] = useState(9);
  const [shiftType, setShiftType] = useState('Morning Shift');
  const [shiftYear, setShiftYear] = useState(String(currentYear));
  const [shiftMonth, setShiftMonth] = useState('September');
  const [shiftWeek, setShiftWeek] = useState('Wednesday');
  const [shiftDate, setShiftDate] = useState(computeShiftDate(String(currentYear), 'September', 'Wednesday'));
  const [isManualYear, setIsManualYear] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Edit Shift Modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [editShiftName, setEditShiftName] = useState('');
  const [editStartTime, setEditStartTime] = useState('08:00');
  const [editEndTime, setEditEndTime] = useState('17:00');
  const [editDuration, setEditDuration] = useState(9);
  const [editShiftType, setEditShiftType] = useState('Morning Shift');
  const [editShiftYear, setEditShiftYear] = useState(String(currentYear));
  const [editShiftMonth, setEditShiftMonth] = useState('September');
  const [editShiftWeek, setEditShiftWeek] = useState('Wednesday');
  const [editShiftDate, setEditShiftDate] = useState('');
  const [isEditManualYear, setIsEditManualYear] = useState(false);
  const [editShiftStatus, setEditShiftStatus] = useState(true);

  // View Shift Modal state
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingShift, setViewingShift] = useState(null);

  // Change Detection Ref
  const initialShiftRef = useRef(null);

  const isShiftChanged = Boolean(
    initialShiftRef.current && (
      editShiftName.trim() !== initialShiftRef.current.name ||
      editStartTime !== initialShiftRef.current.startTime ||
      editEndTime !== initialShiftRef.current.endTime ||
      editShiftType !== initialShiftRef.current.shiftType ||
      editShiftYear !== initialShiftRef.current.year ||
      editShiftMonth !== initialShiftRef.current.month ||
      editShiftWeek !== initialShiftRef.current.week ||
      editShiftStatus !== initialShiftRef.current.status
    )
  );

  // Format 24h HH:mm into 12-hour AM/PM string
  const formatTime12h = (timeStr) => {
    if (!timeStr) return '-';
    const str = String(timeStr).trim();
    if (str.includes('AM') || str.includes('PM')) return str;
    const parts = str.split(':');
    if (parts.length < 2) return str;
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
  };

  // Format 12h AM/PM or string time to 24h HH:mm for HTML <input type="time">
  const format12hTo24h = (timeStr) => {
    if (!timeStr) return '08:00';
    const str = String(timeStr).trim();
    if (/^\d{1,2}:\d{2}$/.test(str)) {
      const [h, m] = str.split(':');
      return `${String(h).padStart(2, '0')}:${m}`;
    }
    const match = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return '08:00';
    let h = parseInt(match[1], 10);
    const m = match[2];
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}`;
  };

  // Calculate Duration in hours from start and end time (supports 24h or 12h)
  const calculateDuration = (start, end) => {
    try {
      if (!start || !end) return 8;

      let sH, sM, eH, eM;

      if (String(start).includes('AM') || String(start).includes('PM')) {
        const sMatch = String(start).match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (sMatch) {
          sH = parseInt(sMatch[1], 10);
          sM = parseInt(sMatch[2], 10);
          if (sMatch[3].toUpperCase() === 'PM' && sH < 12) sH += 12;
          if (sMatch[3].toUpperCase() === 'AM' && sH === 12) sH = 0;
        }
      } else {
        const parts = String(start).split(':');
        sH = parseInt(parts[0], 10);
        sM = parseInt(parts[1], 10);
      }

      if (String(end).includes('AM') || String(end).includes('PM')) {
        const eMatch = String(end).match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (eMatch) {
          eH = parseInt(eMatch[1], 10);
          eM = parseInt(eMatch[2], 10);
          if (eMatch[3].toUpperCase() === 'PM' && eH < 12) eH += 12;
          if (eMatch[3].toUpperCase() === 'AM' && eH === 12) eH = 0;
        }
      } else {
        const parts = String(end).split(':');
        eH = parseInt(parts[0], 10);
        eM = parseInt(parts[1], 10);
      }

      if (isNaN(sH) || isNaN(sM) || isNaN(eH) || isNaN(eM)) return 8;

      let diffMins = (eH * 60 + eM) - (sH * 60 + sM);
      if (diffMins < 0) diffMins += 24 * 60; // Overnight shift
      if (diffMins === 0) diffMins = 24 * 60;

      const hrs = Math.round((diffMins / 60) * 10) / 10;
      return hrs > 0 ? hrs : 8;
    } catch (e) {
      return 8;
    }
  };

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

  const loadShifts = (sDate = selectedDate) => {
    setLoading(true);
    shiftService.getShifts().then(res => {
      let data = Array.isArray(res) ? res : (res?.data || res?.shifts || []);
      if (sDate && sDate.trim()) {
        data = data.filter(s => {
          if (!s.shift_date) return false;
          return s.shift_date === sDate || s.shift_date.startsWith(sDate);
        });
      }
      setShifts(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const handleCreateShift = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formattedStart = formatTime12h(startTime);
      const formattedEnd = formatTime12h(endTime);
      const computedDur = calculateDuration(startTime, endTime);
      const computedDate = computeShiftDate(shiftYear, shiftMonth, shiftWeek);

      const res = await shiftService.createShift({
        shift_name: shiftName,
        start_time: formattedStart,
        end_time: formattedEnd,
        duration_hours: Number(duration || computedDur),
        shift_type: shiftType,
        shift_date: computedDate,
        year: shiftYear,
        month: shiftMonth,
        week: shiftWeek,
        status: true, // Automatically set to true on DB side
        created_by: currentUserEmail
      });

      showSuccessAlert('Shift Created', res.message || `Work Shift '${shiftName}' created successfully!`);
      setIsCreateOpen(false);
      setShiftName('');
      setStartTime('08:00');
      setEndTime('17:00');
      setDuration(9);
      loadShifts();
    } catch (err) {
      showErrorAlert('Create Shift Failed', err.message || 'Failed to create shift.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenView = (sObj) => {
    setViewingShift(sObj);
    setIsViewOpen(true);
  };

  const handleOpenEdit = (sObj) => {
    setEditingShift(sObj);
    setEditShiftName(sObj.shift_name || '');

    const startTime24 = format12hTo24h(sObj.start_time);
    const endTime24 = format12hTo24h(sObj.end_time);

    setEditStartTime(startTime24);
    setEditEndTime(endTime24);

    const computedDur = calculateDuration(startTime24, endTime24);
    setEditDuration(sObj.duration_hours || computedDur || 8);
    setEditShiftType(sObj.shift_type || 'Morning Shift');
    setEditShiftDate(sObj.shift_date || new Date().toISOString().split('T')[0]);
    setEditShiftYear(sObj.year || String(currentYear));
    setEditShiftMonth(sObj.month || 'September');
    setEditShiftWeek(sObj.week || 'Wednesday');

    const isActive = sObj.status === true || sObj.status === 'true' || sObj.status === 'ACTIVE' || sObj.status === 1 || sObj.status === '1';
    setEditShiftStatus(isActive);

    initialShiftRef.current = {
      name: (sObj.shift_name || '').trim(),
      startTime: startTime24,
      endTime: endTime24,
      shiftType: sObj.shift_type || 'Morning Shift',
      year: sObj.year || String(currentYear),
      month: sObj.month || 'September',
      week: sObj.week || 'Wednesday',
      status: isActive
    };

    setIsEditOpen(true);
  };

  const handleUpdateShift = async (e) => {
    e.preventDefault();
    if (!editingShift) return;
    setSubmitting(true);
    try {
      const formattedStart = formatTime12h(editStartTime);
      const formattedEnd = formatTime12h(editEndTime);
      const computedDur = calculateDuration(editStartTime, editEndTime);
      const computedDate = computeShiftDate(editShiftYear, editShiftMonth, editShiftWeek);

      const res = await shiftService.updateShift(editingShift.id, {
        shift_name: editShiftName,
        start_time: formattedStart,
        end_time: formattedEnd,
        duration_hours: Number(editDuration || computedDur),
        shift_type: editShiftType,
        shift_date: computedDate || editShiftDate,
        year: editShiftYear,
        month: editShiftMonth,
        week: editShiftWeek,
        status: editShiftStatus,
        updated_by: currentUserEmail
      });

      showSuccessAlert('Shift Updated', res.message || `Shift '${editShiftName}' updated successfully!`);
      setIsEditOpen(false);
      loadShifts();
    } catch (err) {
      showErrorAlert('Update Shift Failed', err.message || 'Failed to update shift.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShift = async (sObj) => {
    const confirmed = await showConfirmAlert({
      title: 'Delete Work Shift?',
      text: `Are you sure you want to delete shift '${sObj.shift_name}'?`,
      icon: 'warning',
      confirmButtonText: 'Yes, Delete Shift',
      cancelButtonText: 'Cancel'
    });
    if (!confirmed) return;

    try {
      const res = await shiftService.deleteShift(sObj.id);
      showSuccessAlert('Shift Deleted', res.message || `Shift '${sObj.shift_name}' deleted successfully!`);
      loadShifts();
    } catch (err) {
      showErrorAlert('Delete Failed', err.message || 'Failed to delete shift.');
    }
  };

  const paginatedShifts = shifts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      {/* Header & Title */}
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="fs-3 mb-1 fw-bold text-dark d-flex align-items-center gap-2">
              <i className="ti ti-clock-play text-primary"></i>
              <span>Shift Management</span>
            </h1>
            {/* <p className="text-secondary mb-0">Configure Factory Work Shifts (6hr / 8hr / 9hr / 12hr), Day & Night Schedules & Audit Logs</p> */}
          </div>
          <button className="btn btn-primary btn-sm fw-semibold shadow-sm" onClick={() => setIsCreateOpen(true)}>
            <i className="ti ti-plus me-1"></i> Create New Shift
          </button>
        </div>
      </div>

      {/* Quick Shift Summary Cards (Dynamically generated from Active Shifts in DB) */}
      {(() => {
        const activeShifts = shifts.filter(s => s.status === true || s.status === 'true' || s.status === 'ACTIVE' || s.status === 1 || s.status === '1');

        if (activeShifts.length === 0) {
          return null;
        }

        const themeColors = [
          { border: 'border-primary', text: 'text-primary', bg: 'bg-primary-subtle', icon: 'ti-sun' },
          { border: 'border-warning', text: 'text-warning-emphasis', bg: 'bg-warning-subtle', icon: 'ti-sunset' },
          { border: 'border-info', text: 'text-info-emphasis', bg: 'bg-info-subtle', icon: 'ti-moon' },
          { border: 'border-success', text: 'text-success', bg: 'bg-success-subtle', icon: 'ti-clock-play' }
        ];

        return (
          <div className="row g-3 mb-4">
            {activeShifts.map((s, idx) => {
              const nameLower = (s.shift_name || '').toLowerCase();
              let theme = themeColors[idx % themeColors.length];

              if (nameLower.includes('morning') || nameLower.includes('day')) {
                theme = { border: 'border-primary', text: 'text-primary', bg: 'bg-primary-subtle', icon: 'ti-sun' };
              } else if (nameLower.includes('afternoon')) {
                theme = { border: 'border-warning', text: 'text-warning-emphasis', bg: 'bg-warning-subtle', icon: 'ti-sun-high' };
              } else if (nameLower.includes('evening')) {
                theme = { border: 'border-danger', text: 'text-danger', bg: 'bg-danger-subtle', icon: 'ti-sunset' };
              } else if (nameLower.includes('night')) {
                theme = { border: 'border-info', text: 'text-info-emphasis', bg: 'bg-info-subtle', icon: 'ti-moon' };
              }

              const isOvernight = nameLower.includes('night') || (s.start_time && s.end_time && s.start_time.includes('PM') && s.end_time.includes('AM'));
              const colWidth = activeShifts.length === 1 ? 'col-md-6' : activeShifts.length === 2 ? 'col-md-6' : 'col-md-4';

              return (
                <div key={s.id || idx} className={colWidth}>
                  <div className={`card shadow-sm border-0 border-start ${theme.border} border-4 p-3 bg-white h-100`}>
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <small className="text-muted fw-semibold text-uppercase d-block mb-1">{s.shift_name}</small>
                        <h4 className="fw-bold mb-0 text-dark font-mono">{s.start_time} - {s.end_time}</h4>
                        <small className={`${theme.text} fw-medium font-mono`}>
                          {s.duration_hours || 8} Hours {isOvernight ? 'Overnight Window' : 'Working Window'}
                        </small>
                      </div>
                      <div className={`p-3 ${theme.bg} ${theme.text} rounded-3 fs-3`}>
                        <i className={`ti ${theme.icon}`}></i>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Shifts Data Table */}
      {loading ? (
        <SkeletonTable rows={5} columns={8} />
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table mb-0 align-middle table-hover">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '60px' }} className="text-center">S.No</th>
                  <th>Shift Name</th>
                  <th>Timings (Start - End)</th>
                  <th>Duration</th>
                  <th>Created At / By</th>
                  <th>Updated At / By</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shifts.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <i className="ti ti-clock-off fs-2 d-block mb-2 text-secondary opacity-50"></i>
                      <span className="fw-semibold">No work shifts found</span>
                    </td>
                  </tr>
                ) : (
                  paginatedShifts.map((s, index) => {
                    const active = s.status === true || s.status === 'true' || s.status === 'ACTIVE' || s.status === 1 || s.status === '1';
                    const createdBy = s.created_by || 'admin@zenmeter.com';
                    const updatedBy = s.updated_by || '-';

                    return (
                      <tr key={s.id}>
                        <td className="fw-semibold text-center text-secondary">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{s.shift_name}</div>
                          <small className="text-muted text-xs">{s.shift_type || 'Morning Shift'}</small>
                        </td>
                        <td className="fw-medium font-mono text-primary">
                          <i className="ti ti-clock me-1 text-secondary"></i>
                          {s.start_time} - {s.end_time}
                        </td>
                        <td>
                          <span className="badge bg-primary-subtle text-primary border border-primary px-2 py-1 font-mono">
                            {s.duration_hours || 8} Hours Shift
                          </span>
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
                              onClick={() => handleOpenView(s)}
                              className="btn btn-sm btn-action-view border-0"
                              title="View Full Shift Details"
                            >
                              <i className="ti ti-eye fs-5"></i>
                            </button>
                            <button
                              onClick={() => handleOpenEdit(s)}
                              className="btn btn-sm btn-action-edit border-0"
                              title="Edit Shift"
                            >
                              <i className="ti ti-edit fs-5"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteShift(s)}
                              className="btn btn-sm btn-action-delete border-0"
                              title="Delete Shift"
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
            totalItems={shifts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Create Shift Modal */}
      {/* Create Shift Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Work Shift Schedule" size="lg">
        <form onSubmit={handleCreateShift}>
          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small mb-1">Shift Name *</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="ti ti-clock-edit"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="e.g. Morning Shift (8 to 5)"
                value={shiftName}
                onChange={(e) => setShiftName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">Start Time *</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="ti ti-clock-play text-primary"></i>
                </span>
                <input
                  type="time"
                  className="form-control border-start-0 font-mono"
                  value={startTime}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStartTime(val);
                    setDuration(calculateDuration(val, endTime));
                  }}
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">End Time *</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="ti ti-clock-stop text-danger"></i>
                </span>
                <input
                  type="time"
                  className="form-control border-start-0 font-mono"
                  value={endTime}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEndTime(val);
                    setDuration(calculateDuration(startTime, val));
                  }}
                  required
                />
              </div>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">Shift Duration (Hours) *</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-primary">
                  <i className="ti ti-calculator"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light fw-bold font-mono text-primary border-start-0 border-end-0"
                  value={`${duration} Hours`}
                  readOnly
                />
                <span className="input-group-text bg-primary-subtle text-primary border-start-0 text-xs fw-semibold">
                  Auto-Calculated
                </span>
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">Shift Type *</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="ti ti-briefcase"></i>
                </span>
                <select
                  className="form-select border-start-0"
                  value={shiftType}
                  onChange={(e) => setShiftType(e.target.value)}
                >
                  <option value="General Shift">General Shift</option>
                  <option value="Morning Shift">Morning Shift</option>
                  <option value="Afternoon Shift">Afternoon Shift</option>
                  <option value="Evening Shift">Evening Shift</option>
                  <option value="Night Shift">Night Shift</option>
                </select>
              </div>
            </div>
          </div>



          {/* Shift Schedule Section */}
          <div className="border rounded-3 p-3 bg-light-subtle mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2 pb-1 border-bottom">
              <label className="form-label fw-bold text-dark small mb-0 d-flex align-items-center gap-1.5">
                <i className="ti ti-calendar-event text-primary fs-5"></i> Shift Schedule Configuration *
              </label>
              <span className="badge bg-white text-secondary border text-xs">Calendar Mapping</span>
            </div>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold text-dark text-xs mb-1 d-flex align-items-center gap-1">
                  <i className="ti ti-calendar text-primary"></i> Year Schedule
                </label>
                {isManualYear ? (
                  <div className="input-group input-group-sm">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 2045"
                      value={shiftYear}
                      onChange={(e) => {
                        const val = e.target.value;
                        setShiftYear(val);
                        setShiftDate(computeShiftDate(val, shiftMonth, shiftWeek));
                      }}
                      required
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setIsManualYear(false)}
                      title="Select from List"
                    >
                      <i className="ti ti-list"></i>
                    </button>
                  </div>
                ) : (
                  <select
                    className="form-select form-select-sm"
                    value={shiftYear}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'MANUAL') {
                        setIsManualYear(true);
                      } else {
                        setShiftYear(val);
                        setShiftDate(computeShiftDate(val, shiftMonth, shiftWeek));
                      }
                    }}
                  >
                    {yearOptions.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                    <option value="MANUAL">✏️ Manual Input...</option>
                  </select>
                )}
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold text-dark text-xs mb-1 d-flex align-items-center gap-1">
                  <i className="ti ti-calendar-month text-primary"></i> Month Schedule
                </label>
                <select
                  className="form-select form-select-sm"
                  value={shiftMonth}
                  onChange={(e) => {
                    const val = e.target.value;
                    setShiftMonth(val);
                    setShiftDate(computeShiftDate(shiftYear, val, shiftWeek));
                  }}
                >
                  <option value="ALL">ALL (Every Month)</option>
                  {monthsList.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold text-dark text-xs mb-1 d-flex align-items-center gap-1">
                  <i className="ti ti-calendar-week text-primary"></i> Week Schedule
                </label>
                <select
                  className="form-select form-select-sm text-truncate"
                  value={shiftWeek}
                  onChange={(e) => {
                    const val = e.target.value;
                    setShiftWeek(val);
                    setShiftDate(computeShiftDate(shiftYear, shiftMonth, val));
                  }}
                >
                  {getDynamicWeekScheduleOptions(shiftYear, shiftMonth).map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-4">
            <button className="btn btn-light px-4 fw-semibold" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</button>
            <button className="btn btn-primary px-4 fw-semibold shadow-sm" type="submit" disabled={submitting}>
              <i className="ti ti-plus me-1"></i> {submitting ? 'Creating Shift...' : 'Create Shift'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Shift Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Work Shift: ${editingShift?.shift_name || ''}`} size="lg">
        <form onSubmit={handleUpdateShift}>
          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small mb-1">Shift Name *</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="ti ti-clock-edit"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                value={editShiftName}
                onChange={(e) => setEditShiftName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">Start Time *</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="ti ti-clock-play text-primary"></i>
                </span>
                <input
                  type="time"
                  className="form-control border-start-0 font-mono"
                  value={editStartTime}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditStartTime(val);
                    setEditDuration(calculateDuration(val, editEndTime));
                  }}
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">End Time *</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="ti ti-clock-stop text-danger"></i>
                </span>
                <input
                  type="time"
                  className="form-control border-start-0 font-mono"
                  value={editEndTime}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditEndTime(val);
                    setEditDuration(calculateDuration(editStartTime, val));
                  }}
                  required
                />
              </div>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">Shift Duration (Hours) *</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-primary">
                  <i className="ti ti-calculator"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light fw-bold font-mono text-primary border-start-0 border-end-0"
                  value={`${editDuration} Hours`}
                  readOnly
                />
                <span className="input-group-text bg-primary-subtle text-primary border-start-0 text-xs fw-semibold">
                  Auto-Calculated
                </span>
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">Shift Type *</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="ti ti-briefcase"></i>
                </span>
                <select
                  className="form-select border-start-0"
                  value={editShiftType}
                  onChange={(e) => setEditShiftType(e.target.value)}
                >
                  <option value="Morning Shift">Morning Shift</option>
                  <option value="Afternoon Shift">Afternoon Shift</option>
                  <option value="Evening Shift">Evening Shift</option>
                  <option value="Night Shift">Night Shift</option>
                  <option value="General Shift">General Shift</option>
                </select>
              </div>
            </div>
          </div>



          {/* Edit Shift Schedule Section */}
          <div className="border rounded-3 p-3 bg-light-subtle mb-3">
            <div className="d-flex align-items-center justify-content-between mb-2 pb-1 border-bottom">
              <label className="form-label fw-bold text-dark small mb-0 d-flex align-items-center gap-1.5">
                <i className="ti ti-calendar-event text-primary fs-5"></i> Shift Schedule Configuration *
              </label>
              <span className="badge bg-white text-secondary border text-xs">Calendar Mapping</span>
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold text-dark text-xs mb-1 d-flex align-items-center gap-1">
                  <i className="ti ti-calendar text-primary"></i> Year Schedule
                </label>
                {isEditManualYear ? (
                  <div className="input-group input-group-sm">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 2045"
                      value={editShiftYear}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditShiftYear(val);
                        setEditShiftDate(computeShiftDate(val, editShiftMonth, editShiftWeek));
                      }}
                      required
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setIsEditManualYear(false)}
                      title="Select from List"
                    >
                      <i className="ti ti-list"></i>
                    </button>
                  </div>
                ) : (
                  <select
                    className="form-select form-select-sm"
                    value={editShiftYear}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'MANUAL') {
                        setIsEditManualYear(true);
                      } else {
                        setEditShiftYear(val);
                        setEditShiftDate(computeShiftDate(val, editShiftMonth, editShiftWeek));
                      }
                    }}
                  >
                    {yearOptions.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                    <option value="MANUAL">✏️ Manual Input...</option>
                  </select>
                )}
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold text-dark text-xs mb-1 d-flex align-items-center gap-1">
                  <i className="ti ti-calendar-month text-primary"></i> Month Schedule
                </label>
                <select
                  className="form-select form-select-sm"
                  value={editShiftMonth}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditShiftMonth(val);
                    setEditShiftDate(computeShiftDate(editShiftYear, val, editShiftWeek));
                  }}
                >
                  <option value="ALL">ALL (Every Month)</option>
                  {monthsList.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold text-dark text-xs mb-1 d-flex align-items-center gap-1">
                  <i className="ti ti-calendar-week text-primary"></i> Week Schedule
                </label>
                <select
                  className="form-select form-select-sm text-truncate"
                  value={editShiftWeek}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditShiftWeek(val);
                    setEditShiftDate(computeShiftDate(editShiftYear, editShiftMonth, val));
                  }}
                >
                  {getDynamicWeekScheduleOptions(editShiftYear, editShiftMonth).map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold text-dark small mb-1">Status *</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="ti ti-toggle-right"></i>
              </span>
              <select
                className="form-select border-start-0 fw-semibold"
                value={editShiftStatus ? 'true' : 'false'}
                onChange={(e) => setEditShiftStatus(e.target.value === 'true')}
              >
                <option value="true">ACTIVE (Operational)</option>
                <option value="false">INACTIVE (Disabled)</option>
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-4">
            <button className="btn btn-light px-4 fw-semibold" type="button" onClick={() => setIsEditOpen(false)}>Cancel</button>
            <button className="btn btn-primary px-4 fw-semibold shadow-sm" type="submit" disabled={submitting || !isShiftChanged}>
              <i className="ti ti-check me-1"></i> {submitting ? 'Saving Changes...' : 'Save Shift'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Shift Details Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Full Work Shift Details" size="lg">
        {viewingShift && (
          <div>
            {/* Header Info Banner */}
            <div className="card bg-primary-subtle border-0 mb-3 p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="badge bg-primary text-white mb-1">{viewingShift.shift_type || 'Morning Shift'}</span>
                  <h4 className="fw-bold text-dark mb-0">{viewingShift.shift_name}</h4>
                </div>
                <div>
                  {(() => {
                    const active = viewingShift.status === true || viewingShift.status === 'true' || viewingShift.status === 'ACTIVE' || viewingShift.status === 1 || viewingShift.status === '1';
                    return (
                      <span className={`badge px-3 py-2 fs-6 ${active ? 'bg-success text-white' : 'bg-secondary text-white'}`}>
                        <i className={`ti ${active ? 'ti-circle-check' : 'ti-circle-x'} me-1`}></i>
                        {active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Shift Window Timings & Duration */}
            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <div className="border rounded p-2 text-center bg-white">
                  <small className="text-muted d-block text-uppercase fw-semibold text-xs">Shift Timings (Start - End)</small>
                  <span className="fw-bold font-mono fs-5 text-primary">
                    <i className="ti ti-clock me-1"></i>
                    {viewingShift.start_time} - {viewingShift.end_time}
                  </span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="border rounded p-2 text-center bg-white">
                  <small className="text-muted d-block text-uppercase fw-semibold text-xs">Total Duration</small>
                  <span className="fw-bold font-mono fs-5 text-dark">
                    <i className="ti ti-hourglass me-1 text-warning"></i>
                    {viewingShift.duration_hours || 8} Hours Window
                  </span>
                </div>
              </div>
            </div>



            {/* Applicable Schedule */}
            <div className="border rounded-3 p-3 bg-white mb-3 shadow-2xs">
              <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-1.5">
                <i className="ti ti-calendar-event text-primary fs-5"></i> Schedule Configuration
              </h6>
              <div className="row g-2 text-sm font-mono">
                <div className="col-md-4">
                  <small className="text-muted d-block">Year Schedule</small>
                  <span className="fw-semibold text-dark fs-6">{viewingShift.year || '-'}</span>
                </div>
                <div className="col-md-4">
                  <small className="text-muted d-block">Month Schedule</small>
                  <span className="fw-semibold text-dark fs-6">{viewingShift.month || '-'}</span>
                </div>
                <div className="col-md-4">
                  <small className="text-muted d-block">Week Schedule</small>
                  <span className="fw-semibold text-dark fs-6">{viewingShift.week || '-'}</span>
                </div>
              </div>
            </div>

            {/* Audit Log Information */}
            <div className="border rounded-3 p-3 bg-light text-xs font-mono">
              <div className="row g-2">
                <div className="col-md-6">
                  <span className="text-muted">Created At / By: </span>
                  <span className="fw-semibold text-dark">{formatDateTimeDDMMYYYY(viewingShift.created_at)}</span>
                  <div className="text-muted">{viewingShift.created_by || 'admin@zenmeter.com'}</div>
                </div>
                <div className="col-md-6">
                  <span className="text-muted">Updated At / By: </span>
                  <span className="fw-semibold text-dark">{formatDateTimeDDMMYYYY(viewingShift.updated_at)}</span>
                  <div className="text-muted">{viewingShift.updated_by || '-'}</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="d-flex justify-content-end gap-2 pt-3 mt-2 border-top">
              <button
                className="btn btn-outline-primary btn-sm fw-semibold"
                onClick={() => {
                  setIsViewOpen(false);
                  handleOpenEdit(viewingShift);
                }}
              >
                <i className="ti ti-edit me-1"></i> Edit Shift
              </button>
              <button className="btn btn-secondary btn-sm fw-semibold" onClick={() => setIsViewOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
