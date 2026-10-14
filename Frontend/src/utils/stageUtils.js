export const ALL_STAGE_MODULES = [
  {
    id: 1,
    stage_number: 1,
    name: 'PCB Code Loading Test',
    shortName: 'Code Loading Console',
    icon: 'ti-code',
    badge: '1-Stage',
    description: 'Power & boot test, Code loading, serial no., UID, firmware update',
    lineType: 'Main Meter Assembly Line',
    hardwareStation: 'Station-01'
  },
  {
    id: 2,
    stage_number: 2,
    name: 'NIC Card PCB Test',
    shortName: 'NIC Card PCB Test',
    icon: 'ti-cpu',
    badge: '2-Stage',
    description: 'Power-on & signal test, Modem function, IMEI, Store to DB',
    lineType: 'NIC Card Preparation Line',
    hardwareStation: 'Station-02'
  },
  {
    id: 3,
    stage_number: 3,
    name: 'NIC Card Box Assembly',
    shortName: 'NIC Box Assembly',
    icon: 'ti-box',
    badge: '3-Stage',
    description: 'NIC Module mounting & casing assembly check',
    lineType: 'NIC Card Preparation Line',
    hardwareStation: 'Station-03'
  },
  {
    id: 4,
    stage_number: 4,
    name: 'NIC Card Inside Print',
    shortName: 'Jig Test Console',
    icon: 'ti-tools',
    badge: '4-Stage',
    description: 'Modem function, IMEI, Store to DB, Laser print',
    lineType: 'NIC Card Preparation Line',
    hardwareStation: 'Station-04'
  },
  {
    id: 5,
    stage_number: 5,
    name: 'Meter PCB Box Assembly',
    shortName: 'Meter PCB Assembly',
    icon: 'ti-package',
    badge: '5-Stage',
    description: 'Base plate & PCB mounting into meter enclosure',
    lineType: 'Main Meter Assembly Line',
    hardwareStation: 'Station-05'
  },
  {
    id: 6,
    stage_number: 6,
    name: 'Calibration & Accuracy',
    shortName: 'Calibration Console',
    icon: 'ti-bolt',
    badge: '6-Stage',
    description: 'Voltage / modem data, Error lock check, active power calibration',
    lineType: 'Main Meter Assembly Line',
    hardwareStation: 'Station-06'
  },
  {
    id: 7,
    stage_number: 7,
    name: 'Meter Box Body Print',
    shortName: 'Meter Body Print',
    icon: 'ti-barcode',
    badge: '7-Stage',
    description: 'Front full print, laser marking, barcode generation',
    lineType: 'Main Meter Assembly Line',
    hardwareStation: 'Station-07'
  },
  {
    id: 8,
    stage_number: 8,
    name: 'Final Functional Validation',
    shortName: 'Final Validation',
    icon: 'ti-shield-check',
    badge: '8-Stage',
    description: 'Firmware update, IP address check, complete QA validation',
    lineType: 'Main Meter Assembly Line',
    hardwareStation: 'Station-08'
  },
  {
    id: 9,
    stage_number: 9,
    name: 'PVC Seal (Tag)',
    shortName: 'PVC Tagging Console',
    icon: 'ti-tag',
    badge: '9-Stage',
    description: 'Tamper-proof seal, security wire tagging & registration',
    lineType: 'Main Meter Assembly Line',
    hardwareStation: 'Station-09'
  },
  {
    id: 10,
    stage_number: 10,
    name: 'Meter Cotton Box Print',
    shortName: 'Single Box Print',
    icon: 'ti-printer',
    badge: '10-Stage',
    description: 'Single unit box barcode printing & packaging',
    lineType: 'Packaging Line',
    hardwareStation: 'Station-10'
  },
  {
    id: 11,
    stage_number: 11,
    name: 'Master Box Cotton Print',
    shortName: 'Master Box Print',
    icon: 'ti-box-seam',
    badge: '11-Stage',
    description: 'Bulk master carton aggregation & dispatch label print',
    lineType: 'Packaging Line',
    hardwareStation: 'Station-11'
  }
];

export function isSupervisorUser(user) {
  if (!user) return false;
  const normRole = (user.role || '').toUpperCase().replace(/\s+/g, '_');
  return normRole === 'SUPERVISOR' || normRole.includes('SUPERVISOR');
}

export function isFullAccessUser(user) {
  if (!user) return true;
  const normRole = (user.role || '').toUpperCase().replace(/\s+/g, '_');
  return (
    normRole.includes('ADMIN') ||
    normRole.includes('QC') ||
    normRole.includes('REPORT') ||
    normRole.includes('VIEWER') ||
    normRole.includes('IT')
  );
}

export function formatStageFromDb(stg) {
  if (!stg) return null;
  const sNum = Number(stg.stage_number || stg.id || 1);
  const matched = ALL_STAGE_MODULES.find(m => m.id === sNum);
  return {
    id: sNum,
    stage_number: sNum,
    name: stg.stage_name || stg.name || (matched?.name) || `Stage ${sNum}`,
    shortName: stg.stage_name || stg.name || (matched?.shortName) || `Stage ${sNum}`,
    icon: matched?.icon || 'ti-cpu',
    badge: `${sNum}-Stage`,
    description: stg.description || matched?.description || '',
    lineType: stg.line_type || stg.lineType || matched?.lineType || 'Main Meter Assembly Line',
    hardwareStation: stg.hardware_station || stg.hardwareStation || matched?.hardwareStation || `Station-${String(sNum).padStart(2, '0')}`,
    ...stg
  };
}

export function getUserAssignedStages(user) {
  if (!user) return [];

  // If user object has DB-loaded full assignedStagesList for full access users, use them
  if (isFullAccessUser(user) && Array.isArray(user.assignedStagesList) && user.assignedStagesList.length > 0) {
    return user.assignedStagesList.map(formatStageFromDb).sort((a, b) => a.id - b.id);
  }

  if (isFullAccessUser(user)) {
    return ALL_STAGE_MODULES;
  }

  const stageMap = new Map();

  if (Array.isArray(user.assignedStagesList) && user.assignedStagesList.length > 0) {
    user.assignedStagesList.forEach(stg => {
      const formatted = formatStageFromDb(stg);
      if (formatted) stageMap.set(formatted.id, formatted);
    });
  }

  if (Array.isArray(user.stageDetailsList) && user.stageDetailsList.length > 0) {
    user.stageDetailsList.forEach(stg => {
      const formatted = formatStageFromDb(stg);
      if (formatted) stageMap.set(formatted.id, formatted);
    });
  }

  if (user.assigned_stage && typeof user.assigned_stage === 'string') {
    const parts = user.assigned_stage.split(',');
    parts.forEach(part => {
      const raw = part.trim();
      if (!raw) return;

      const numMatch = raw.match(/^(\d+)/);
      if (numMatch) {
        const sNum = Number(numMatch[1]);
        const matched = ALL_STAGE_MODULES.find(m => m.id === sNum);
        if (matched && !stageMap.has(matched.id)) {
          stageMap.set(matched.id, matched);
        }
      }

      ALL_STAGE_MODULES.forEach(m => {
        if (!stageMap.has(m.id)) {
          const rawLower = raw.toLowerCase();
          const nameLower = m.name.toLowerCase();
          const shortLower = m.shortName.toLowerCase();
          if (rawLower.includes(nameLower) || nameLower.includes(rawLower) || rawLower.includes(shortLower)) {
            stageMap.set(m.id, m);
          }
        }
      });
    });
  }

  if (user.stage_id) {
    const sNum = Number(user.stage_id);
    const matched = ALL_STAGE_MODULES.find(m => m.id === sNum);
    if (matched && !stageMap.has(matched.id)) {
      stageMap.set(matched.id, matched);
    }
  }

  return Array.from(stageMap.values()).sort((a, b) => a.id - b.id);
}

export function getSavedStageForUser(user) {
  if (!user || isSupervisorUser(user)) return null;
  const userKey = user.id || user.employee_id || user.email || 'user';
  return localStorage.getItem(`zenmeter_saved_stage_${userKey}`);
}

export function saveStageForUser(user, stageId) {
  if (!user || isSupervisorUser(user)) return;
  const userKey = user.id || user.employee_id || user.email || 'user';
  localStorage.setItem(`zenmeter_saved_stage_${userKey}`, String(stageId));
  sessionStorage.setItem('zenmeter_selected_stage_id', String(stageId));
}

export function clearSavedStageForUser(user) {
  if (!user) return;
  const userKey = user.id || user.employee_id || user.email || 'user';
  localStorage.removeItem(`zenmeter_saved_stage_${userKey}`);
}

export function getPostLoginRedirectPath(user) {
  if (!user) return '/login';

  // Supervisors and Full Access Users always go directly to Dashboard
  if (isFullAccessUser(user) || isSupervisorUser(user)) {
    return '/dashboard';
  }

  const assigned = getUserAssignedStages(user);

  if (assigned.length === 0) {
    return '/dashboard';
  }

  if (assigned.length === 1) {
    return `/stages/${assigned[0].id}`;
  }

  // Operators with multiple assigned stages:
  const savedStage = getSavedStageForUser(user);

  if (savedStage && savedStage !== 'null' && savedStage !== 'undefined') {
    if (savedStage === 'all') {
      return '/dashboard';
    }
    const stageNum = Number(savedStage);
    const isValidStage = assigned.some(s => s.id === stageNum || s.stage_number === stageNum);
    if (isValidStage) {
      return `/stages/${savedStage}`;
    }
  }

  return '/select-stage';
}
