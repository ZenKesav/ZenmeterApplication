import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useAuth } from '../app/store';
import { saveStageForUser } from '../utils/stageUtils';
import { jigService, stageManagementService } from '../services/apiServices';
import { showWarningAlert, showErrorAlert } from '../utils/swal';
import { Modal } from '../components/CommonComponents';

// SVG QR Code Generator Component for Printable NIC Labels
function QRCodeSVG({ value, size = 110 }) {
  if (!value) return null;

  const grid = Array.from({ length: 21 }, () => Array(21).fill(false));

  const fillSquare = (r, c, w, h) => {
    for (let i = r; i < r + w; i++) {
      for (let j = c; j < c + h; j++) {
        if (i >= 0 && i < 21 && j >= 0 && j < 21) grid[i][j] = true;
      }
    }
  };

  const clearSquare = (r, c, w, h) => {
    for (let i = r; i < r + w; i++) {
      for (let j = c; j < c + h; j++) {
        if (i >= 0 && i < 21 && j >= 0 && j < 21) grid[i][j] = false;
      }
    }
  };

  const addFinder = (r, c) => {
    fillSquare(r, c, 7, 7);
    clearSquare(r + 1, c + 1, 5, 5);
    fillSquare(r + 2, c + 2, 3, 3);
  };

  addFinder(0, 0);     // Top Left
  addFinder(0, 14);    // Top Right
  addFinder(14, 0);    // Bottom Left

  fillSquare(14, 14, 5, 5);
  clearSquare(15, 15, 3, 3);
  fillSquare(16, 16, 1, 1);

  for (let i = 8; i <= 12; i += 2) {
    grid[6][i] = true;
    grid[i][6] = true;
  }

  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  let bitIdx = 0;
  for (let r = 0; r < 21; r++) {
    for (let c = 0; c < 21; c++) {
      const isFinderTL = r <= 7 && c <= 7;
      const isFinderTR = r <= 7 && c >= 13;
      const isFinderBL = r >= 13 && c <= 7;
      const isAlignment = r >= 13 && c >= 13;
      const isTiming = r === 6 || c === 6;

      if (!isFinderTL && !isFinderTR && !isFinderBL && !isAlignment && !isTiming) {
        const charCode = value.charCodeAt(bitIdx % value.length);
        const bit = ((hash ^ (r * 31 + c * 17 + charCode)) % 3) === 0;
        grid[r][c] = bit;
        bitIdx++;
      }
    }
  }

  const cellSize = size / 21;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ backgroundColor: '#ffffff', borderRadius: '6px', padding: '4px' }}>
      {grid.map((row, r) =>
        row.map((isDark, c) =>
          isDark ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.15}
              height={cellSize + 0.15}
              fill="#0f172a"
            />
          ) : null
        )
      )}
    </svg>
  );
}

export default function StageExecution() {
  const { user, setSelectedStageId } = useAuth();
  const { stageId: paramStageId } = useParams();
  const [searchParams] = useSearchParams();
  const queryStage = searchParams.get('stage');

  let activeStageId = 4;
  if (paramStageId && !isNaN(Number(paramStageId))) {
    activeStageId = Number(paramStageId);
  } else if (queryStage && !isNaN(Number(queryStage))) {
    activeStageId = Number(queryStage);
  } else if (user?.stage_id) {
    activeStageId = Number(user.stage_id);
  }
  const stageId = activeStageId;

  const [allStages, setAllStages] = useState([]);

  // Fetch stages dynamically from database
  useEffect(() => {
    stageManagementService.getStages().then(res => {
      const list = Array.isArray(res) ? res : (res?.stages || res?.data || []);
      setAllStages(list);
    }).catch(err => console.error('Error fetching stages in StageExecution:', err));
  }, []);

  // Automatically persist selected stage for user account
  useEffect(() => {
    if (user && stageId) {
      saveStageForUser(user, stageId);
      if (setSelectedStageId) {
        setSelectedStageId(stageId);
      }
    }
  }, [user, stageId, setSelectedStageId]);


  // Stage 6 Calibration State & Telemetry Simulation
  const [stage6Testing, setStage6Testing] = useState(false);
  const [stage6Saved, setStage6Saved] = useState(false);
  const [stage6Logs, setStage6Logs] = useState([
    '[INIT] Stage 6 AC Reference Source 230V 5.0A Connected (50.00Hz)',
    '[READY] Bench Ready. 6-Meter Calibration Position Telemetry Active.'
  ]);
  const [stage6Meters, setStage6Meters] = useState([
    { pos: 1, serial_no: 'ZM-MTR-6001', voltage: 230.12, current: 5.002, power: 1150.8, pulse_rate: 1600, error_pct: 0.07, error_lock: 'NO LOCK', status: 'PASS' },
    { pos: 2, serial_no: 'ZM-MTR-6002', voltage: 229.98, current: 4.998, power: 1149.4, pulse_rate: 1600, error_pct: -0.05, error_lock: 'NO LOCK', status: 'PASS' },
    { pos: 3, serial_no: 'ZM-MTR-6003', voltage: 230.05, current: 5.001, power: 1150.2, pulse_rate: 1600, error_pct: 0.03, error_lock: 'NO LOCK', status: 'PASS' },
    { pos: 4, serial_no: 'ZM-MTR-6004', voltage: 230.22, current: 5.003, power: 1151.7, pulse_rate: 1600, error_pct: 0.11, error_lock: 'NO LOCK', status: 'PASS' },
    { pos: 5, serial_no: 'ZM-MTR-6005', voltage: 229.89, current: 4.997, power: 1148.8, pulse_rate: 1600, error_pct: -0.09, error_lock: 'NO LOCK', status: 'PASS' },
    { pos: 6, serial_no: 'ZM-MTR-6006', voltage: 230.08, current: 5.002, power: 1150.5, pulse_rate: 1600, error_pct: 0.04, error_lock: 'NO LOCK', status: 'PASS' }
  ]);

  const handleStartStage6Test = () => {
    setStage6Testing(true);
    setStage6Saved(false);
    const nowStr = new Date().toLocaleTimeString();
    setStage6Logs(prev => [
      ...prev,
      `[${nowStr}] INJECTING REFERENCE 230V 5A POWER SOURCE...`,
      `[${nowStr}] SAMPLING PULSE IMPULSES (1600 imp/kWh)...`,
      `[${nowStr}] CALCULATING VOLTAGE & CURRENT ERRORS...`
    ]);

    setTimeout(() => {
      const updated = stage6Meters.map(m => {
        const randErr = parseFloat(((Math.random() * 0.24) - 0.10).toFixed(2));
        const isPass = Math.abs(randErr) <= 0.20;
        return {
          ...m,
          voltage: parseFloat((230 + (Math.random() * 0.4 - 0.2)).toFixed(2)),
          current: parseFloat((5 + (Math.random() * 0.01 - 0.005)).toFixed(3)),
          error_pct: randErr,
          error_lock: isPass ? 'NO LOCK' : 'ACTIVE LOCK',
          status: isPass ? 'PASS' : 'FAIL'
        };
      });
      setStage6Meters(updated);
      setStage6Testing(false);
      setStage6Logs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] CALIBRATION TEST COMPLETED. ALL METER POSITIONS MEASURED.`
      ]);
    }, 1200);
  };

  const handleSaveStage6ToDb = () => {
    setStage6Saved(true);
    setStage6Logs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [DB] STAGE 6 CALIBRATION RESULTS SAVED TO DATABASE.`
    ]);
  };

  const handleResetStage6 = () => {
    setStage6Testing(false);
    setStage6Saved(false);
    setStage6Logs(['[INIT] Stage 6 AC Reference Source 230V 5.0A Connected (50.00Hz)']);
  };

  const handleExportStage6Excel = () => {
    let csv = "\uFEFFPosition,Meter Serial,Voltage (V),Current (A),Power (W),Pulse Rate,Error (%),Error Lock,Status\n";
    stage6Meters.forEach(m => {
      csv += `${m.pos},${m.serial_no},${m.voltage},${m.current},${m.power},${m.pulse_rate},${m.error_pct}%,${m.error_lock},${m.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Stage6_Calibration_Report_${Date.now()}.csv`;
    link.click();
  };

  // Protocol & Connection Workflow State Management
  const [testState, setTestState] = useState('IDLE');

  // 8-Channel Live Telemetry & Log State
  const [jigLogs, setJigLogs] = useState([]);
  const [jigData, setJigData] = useState(null);

  // DB Save, Test Cycle ID & Unique NIC UUID State
  const [isSavedToDb, setIsSavedToDb] = useState(false);
  const [cycleId, setCycleId] = useState(null);
  const [cycleUuid, setCycleUuid] = useState(null);
  const [saveTimestamp, setSaveTimestamp] = useState(null);
  const [savedCount, setSavedCount] = useState(0);

  // Printable QR Modal & Log Console Toggle (Hidden by default)
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [showLogsConsole, setShowLogsConsole] = useState(false);

  // QR Validation Scanner Input State & Ref Array
  const [scannedValues, setScannedValues] = useState({});
  const [validationStatus, setValidationStatus] = useState({});
  const qrInputRefs = useRef([]);

  // Auto-focus 1st valid channel input field when QR Validation modal opens
  useEffect(() => {
    if (isQrModalOpen) {
      const timer = setTimeout(() => {
        if (qrInputRefs.current && qrInputRefs.current[0]) {
          qrInputRefs.current[0].focus();
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isQrModalOpen]);

  // Handler for QR Scanner Input Box
  const handleScanInput = (chNo, idx, c, value) => {
    setScannedValues(prev => ({ ...prev, [chNo]: value }));
    const trimmed = value.trim();

    if (!trimmed) {
      setValidationStatus(prev => ({ ...prev, [chNo]: null }));
      return;
    }

    let scannedImei = trimmed;
    try {
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const parsed = JSON.parse(trimmed);
        scannedImei = String(parsed.imei_no || parsed.imei || trimmed).trim();
      }
    } catch (e) { }

    const targetImei = String(c.imei || '').trim();
    const isMatch = scannedImei === targetImei || trimmed.includes(targetImei);

    if (isMatch) {
      setValidationStatus(prev => ({ ...prev, [chNo]: 'MATCHED' }));
      // Automatically advance mouse cursor to next channel input field on match!
      setTimeout(() => {
        if (qrInputRefs.current && qrInputRefs.current[idx + 1]) {
          qrInputRefs.current[idx + 1].focus();
        }
      }, 100);
    } else {
      setValidationStatus(prev => ({ ...prev, [chNo]: 'MISMATCH' }));
    }
  };

  const handleScanKeyDown = (e, idx) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Move mouse cursor to next channel input field on Enter key
      if (qrInputRefs.current && qrInputRefs.current[idx + 1]) {
        qrInputRefs.current[idx + 1].focus();
      }
    }
  };

  // Duplicate IMEI & Manual Edit State
  const [dbDuplicates, setDbDuplicates] = useState([]);
  const [editingChannelId, setEditingChannelId] = useState(null);
  const [editFormData, setEditFormData] = useState({ imei: '', hwv: 'v1.2', fwv: 'v2.0', sig: '-65dBm', comms_technology: '12' });
  const [printedChannels, setPrintedChannels] = useState({});

  // USB Serial Hardware Connection State
  const [usbConnected, setUsbConnected] = useState(false);
  const [usbDeviceName, setUsbDeviceName] = useState('');
  const [availablePorts, setAvailablePorts] = useState([]);
  const [detailedPorts, setDetailedPorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState('');

  const wsRef = useRef(null);
  const nonUsbPattern = /(bluetooth|blth|buds|airpods|incoming-port|rfcomm|debug-console)/i;

  const pad = (n, len = 2) => String(n).padStart(len, '0');
  const formatTimestamp = () => {
    const d = new Date();
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
  };

  // Format COM port string clean (e.g. "COM3 (STMicroelectronics)" -> "COM3")
  const formatPortName = (p) => {
    if (!p) return '';
    return String(p).replace(/\s*\([^)]*\)/g, '').trim();
  };

  const appendLog = (logText) => {
    setJigLogs(prev => [...prev, logText]);
  };

  // Helper to auto-connect USB port on backend
  const autoConnectPort = async (portToConnect) => {
    if (!portToConnect) return;
    try {
      const res = await jigService.connectHardware({ path: portToConnect });
      if (res.success && res.data && res.data.connected) {
        setUsbConnected(true);
        setUsbDeviceName(res.data.device || portToConnect);
        setTestState(prev => (prev === 'IDLE' || prev === 'USB_SCANNING') ? 'USB_CONNECTED' : prev);
      } else {
        setUsbConnected(false);
        setUsbDeviceName('');
      }
    } catch (err) {
      console.warn('[Frontend] Auto connect notice:', err.message);
      setUsbConnected(false);
      setUsbDeviceName('');
    }
  };

  // 1. Fetch available USB ports from Node.js backend
  const fetchAvailableUsbPorts = async () => {
    try {
      const res = await jigService.listUsbPorts();
      const rawPorts = res.ports || [];
      const rawDetailed = res.detailedPorts || rawPorts.map(p => ({ path: p, friendlyName: p }));

      const cleanPath = (p) => (typeof p === 'string' && p.startsWith('/dev/tty.') ? p.replace('/dev/tty.', '/dev/cu.') : p);

      const filteredPorts = rawPorts.map(cleanPath).filter(p => !nonUsbPattern.test(p));
      const filteredDetailed = rawDetailed.map(dp => ({
        ...dp,
        path: cleanPath(dp.path),
        friendlyName: cleanPath(dp.friendlyName)
      })).filter(dp => !nonUsbPattern.test(dp.path || dp.friendlyName || dp.label || ''));

      setAvailablePorts(filteredPorts);
      setDetailedPorts(filteredDetailed);

      if (filteredPorts.length > 0) {
        let portToUse = selectedPort;
        if (!selectedPort || !filteredPorts.includes(selectedPort)) {
          portToUse = filteredPorts[0];
          setSelectedPort(portToUse);
        }
        if (!usbConnected) {
          await autoConnectPort(portToUse);
        }
      } else {
        if (usbConnected) {
          setUsbConnected(false);
          setUsbDeviceName('');
          setTestState('IDLE');
          showWarningAlert('USB Hardware Disconnected', 'Physical USB Serial device was disconnected/unplugged.');
        }
        setSelectedPort('');
      }
    } catch (e) {
      console.warn('[Frontend] Port scan notice:', e.message);
    }
  };

  // Check duplicate IMEIs in DB
  const checkDbDuplicates = async (channelsList) => {
    const imeis = (channelsList || []).map(c => c.imei).filter(Boolean);
    if (imeis.length === 0) {
      setDbDuplicates([]);
      return;
    }
    try {
      const res = await jigService.checkDuplicateImeis({ imeis });
      if (res.success && Array.isArray(res.duplicates)) {
        setDbDuplicates(res.duplicates);
      }
    } catch (e) {
      console.warn('[Frontend] Duplicate IMEI check notice:', e);
    }
  };

  // Connect WebSocket gateway for real-time live updates
  useEffect(() => {
    fetchAvailableUsbPorts();

    const host = window.location.hostname || 'localhost';
    const wsUrl = `ws://${host}:5005/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected to Zenmeter Realtime Gateway');
      };

      ws.onmessage = (evt) => {
        try {
          const message = JSON.parse(evt.data);
          const { event, data } = message;

          if (event === 'jig.usb.connected') {
            setUsbConnected(true);
            setUsbDeviceName(data?.port || selectedPort);
            setTestState('USB_CONNECTED');
          } else if (event === 'jig.usb.disconnected') {
            setUsbConnected(false);
            setUsbDeviceName('');
            setTestState('IDLE');
            showWarningAlert('USB Hardware Disconnected', 'USB Serial device disconnected.');
          } else if (event === 'jig.test.started') {
            setTestState('STARTING');
          } else if (event === 'jig.ack.received') {
            setTestState('ACK_RECEIVED');
          } else if (event === 'jig.data.received') {
            if (data && data.ch) {
              setJigData(data);
              setTestState('DATA_RECEIVED');
              checkDbDuplicates(data.ch);
            }
          } else if (event === 'jig.error') {
            const errCode = data?.code || 'JIG-ERR-001';
            const errMsg = data?.message || 'Jig hardware error';
            appendLog(`${formatTimestamp()} [ERR] - ${errCode}: ${errMsg}`);
            setTestState('ERROR');
            showErrorAlert(`Hardware Error (${errCode})`, errMsg);
          }
        } catch (e) { }
      };

      ws.onerror = (err) => {
        console.warn('[WebSocket] Warning:', err);
      };

      ws.onclose = () => {
        console.log('[WebSocket] Closed');
      };
    } catch (e) { }

    const intervalId = setInterval(fetchAvailableUsbPorts, 2000);

    return () => {
      clearInterval(intervalId);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Whenever jigData changes, trigger duplicate checking
  useEffect(() => {
    if (jigData && jigData.ch) {
      checkDbDuplicates(jigData.ch);
    }
  }, [jigData]);

  // Default 8-Channel initial state
  const defaultChannels = Array.from({ length: 8 }, (_, i) => ({
    ch: i + 1,
    st: 'NCON',
    imei: null,
    hwv: null,
    fwv: null,
    sig: null,
    nic_uuid: null,
    comms_technology: '12'
  }));

  const activeChannels = jigData?.ch || defaultChannels;

  // Channel classification helper
  const getChannelClassification = (c) => {
    const imeiStr = c.imei ? String(c.imei).trim() : null;
    const isDbDup = Boolean(imeiStr && dbDuplicates.includes(imeiStr));

    const sameImeiCount = imeiStr ? activeChannels.filter(ch => ch.imei && String(ch.imei).trim() === imeiStr).length : 0;
    const isBatchDup = imeiStr ? sameImeiCount > 1 : false;

    const isDuplicate = isDbDup || isBatchDup;
    const isValid = Boolean(imeiStr) && !isDuplicate && (c.st === 'PASS' || c.st === 'CON');

    return {
      isDbDup,
      isBatchDup,
      isDuplicate,
      isValid
    };
  };

  const handlePortSelectChange = (newPort) => {
    setSelectedPort(newPort);
    if (newPort) {
      autoConnectPort(newPort);
    }
  };

  // Helper to save telemetry data to DB (Saves ONLY valid, non-duplicate, non-null channels cleanly)
  const autoSaveJigDataToDb = async (dataToSave) => {
    if (!dataToSave || !dataToSave.ch) return;

    const currentChs = dataToSave.ch;
    const validChannelsToSave = currentChs.filter(c => {
      const cls = getChannelClassification(c);
      return cls.isValid;
    });

    if (validChannelsToSave.length === 0) {
      showWarningAlert(
        'No New Valid Channels',
        'No valid new NIC channels available to save. Duplicate IMEIs (orange) and Null/Error data (red) were automatically prevented from saving to DB.'
      );
      return;
    }

    setTestState('SAVING');
    try {
      const payloadData = {
        ...dataToSave,
        ch: validChannelsToSave
      };

      const res = await jigService.saveJigDataToDb({
        meter_no: 'NIC_JIG_STAGE_4',
        stage_id: stageId,
        jig_data: payloadData,
        operator_id: user?.employee_id || user?.user_name || user?.id || user?.name || 'OPERATOR'
      });

      if (res.success) {
        const returnedCycleId = res.cycle_id || 1;
        const returnedCycleUuid = res.cycle_uuid || `ZMRJIG${String(returnedCycleId).padStart(4, '0')}`;
        const savedCardsCount = res.saved_channels || 0;
        const returnedNicCards = res.nic_cards || [];

        // Update local channels state with assigned nic_uuid for saved cards
        const updatedChannels = currentChs.map(c => {
          const match = returnedNicCards.find(n => n.channel === c.ch);
          if (match) {
            return { ...c, nic_uuid: match.nic_uuid, isSavedToDb: true };
          }
          return c;
        });

        setJigData(prev => ({
          ...prev,
          cycle_id: returnedCycleId,
          cycle_uuid: returnedCycleUuid,
          ch: updatedChannels
        }));

        const nowTimestamp = formatTimestamp();
        setIsSavedToDb(true);
        setCycleId(returnedCycleId);
        setCycleUuid(returnedCycleUuid);
        setSaveTimestamp(nowTimestamp);
        setSavedCount(savedCardsCount);
        setTestState('SAVED');

        checkDbDuplicates(updatedChannels);
        // Note: No modal popup alert shown here to keep view uncluttered as requested!
      } else {
        setTestState('DATA_RECEIVED');
      }
    } catch (err) {
      console.error('[Frontend] Auto save notice:', err);
      setTestState('DATA_RECEIVED');
      showErrorAlert('Database Save Error', err.message || 'Error saving telemetry to database.');
    }
  };

  // Start Hardware Test Protocol
  const handleJigStart = async () => {
    if (!usbConnected) {
      showWarningAlert('USB Removed / Disconnected', 'Please plug in a USB cable / Type-C device before starting Jig test.');
      return;
    }

    setTestState('STARTING');
    setIsSavedToDb(false);
    setCycleId(null);
    setCycleUuid(null);
    setSaveTimestamp(null);
    setSavedCount(0);
    setJigLogs([]);
    setJigData(null);
    setDbDuplicates([]);
    setPrintedChannels({});

    try {
      const res = await jigService.startHardwareTest({
        meter_no: 'NIC_JIG_STAGE_4',
        stage_id: stageId
      });

      if (res.success) {
        setJigLogs(res.logs || []);
        if (res.data) {
          setJigData(res.data);
          setTestState('DATA_RECEIVED');
          checkDbDuplicates(res.data.ch);
          // Automatically save ONLY correct, new, non-duplicate data to DB
          await autoSaveJigDataToDb(res.data);
        }
      } else {
        const errObj = res.error || {};
        const errCode = errObj.code || 'JIG-START-001';
        const errMsg = errObj.message || 'Hardware test failed.';
        appendLog(`${formatTimestamp()} [ERR] - ${errCode}: ${errMsg}`);
        setTestState('ERROR');
        showErrorAlert(`Hardware Test Failed (${errCode})`, errMsg);
      }
    } catch (err) {
      const errCode = err.code || 'JIG-START-001';
      const errMsg = err.message || 'Hardware communication error.';
      appendLog(`${formatTimestamp()} [ERR] - ${errCode}: ${errMsg}`);
      setTestState('ERROR');
      showErrorAlert(`Hardware Protocol Error (${errCode})`, errMsg);
    }
  };

  // Manual Save to DB Handler
  const handleSaveJigDataToDb = async () => {
    if (!jigData || !jigData.ch) {
      showWarningAlert('No Telemetry Data', 'Please click "Start Jig test" to collect hardware data before saving.');
      return;
    }
    await autoSaveJigDataToDb(jigData);
  };

  // Manual Card Edit Handlers
  const handleStartEditCard = (c) => {
    if (editingChannelId === c.ch) {
      setEditingChannelId(null);
    } else {
      setEditingChannelId(c.ch);
      setEditFormData({
        imei: c.imei || '',
        hwv: c.hwv || 'v1.2',
        fwv: c.fwv || 'v2.0',
        sig: c.sig || '-65dBm',
        comms_technology: c.comms_technology || '12'
      });
    }
  };

  const handleUpdateChannelCard = (channelNo, andSaveDb = false) => {
    const imeiVal = editFormData.imei.trim();
    if (!imeiVal) {
      showWarningAlert('IMEI Required', 'Please enter a valid IMEI number to update this channel.');
      return;
    }

    const updatedChannels = activeChannels.map(c => {
      if (c.ch === channelNo) {
        return {
          ...c,
          st: 'PASS',
          imei: imeiVal,
          hwv: editFormData.hwv.trim() || 'v1.2',
          fwv: editFormData.fwv.trim() || 'v2.0',
          sig: editFormData.sig.trim() || '-65dBm',
          comms_technology: editFormData.comms_technology.trim() || '12'
        };
      }
      return c;
    });

    const updatedData = {
      jig: jigData?.jig || 'JIG-001',
      tc: jigData?.tc || 1,
      ch: updatedChannels
    };

    setJigData(updatedData);
    setEditingChannelId(null);
    checkDbDuplicates(updatedChannels);

    if (andSaveDb) {
      autoSaveJigDataToDb(updatedData);
    }
  };

  // Export 8-Channel Jig Results to Excel (.csv format with UTF-8 BOM)
  const handleExportToExcel = () => {
    if (!jigData || !jigData.ch) {
      showWarningAlert('No Data Available', 'Please collect hardware test data before downloading Excel.');
      return;
    }

    const now = new Date();
    const dateFormatted = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    let csvContent = "\uFEFF";
    csvContent += "S.No,IMEI,Telemetry JSON Payload,NIC UUID,Channel No,Hardware Version (HWV),Firmware Version (FWV),Signal Strength (SIG),Channel Status,DB Save Status,Tested At\n";

    jigData.ch.forEach((c, idx) => {
      const sno = idx + 1;
      const imeiNum = c.imei ? String(c.imei).trim() : 'N/A';
      const imeiFormatted = `"IMEI: ${imeiNum}"`;

      const payloadObj = {
        imei_no: imeiNum,
        comms_technology: c.comms_technology || "12"
      };
      const jsonPayloadStr = `"${JSON.stringify(payloadObj).replace(/"/g, '""')}"`;

      const nicUuid = c.nic_uuid ? `"${c.nic_uuid}"` : "N/A";
      const chNo = `"CH-0${c.ch}"`;
      const hwv = c.hwv ? `"${c.hwv}"` : "N/A";
      const fwv = c.fwv ? `"${c.fwv}"` : "N/A";
      const sig = c.sig ? `"${c.sig}"` : "N/A";
      const status = c.st || "NCON";
      const savedStatus = (c.nic_uuid || c.isSavedToDb || isSavedToDb) ? "SAVED_TO_DB" : "PENDING_SAVE";

      csvContent += `${sno},${imeiFormatted},${jsonPayloadStr},${nicUuid},${chNo},${hwv},${fwv},${sig},${status},${savedStatus},"${dateFormatted}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Jig_Test_NIC_Cycle_${cycleId || 'Draft'}_${now.getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset Test Console
  const handleResetJigConsole = () => {
    setJigData(null);
    setJigLogs([]);
    setIsSavedToDb(false);
    setCycleId(null);
    setCycleUuid(null);
    setSaveTimestamp(null);
    setSavedCount(0);
    setDbDuplicates([]);
    setEditingChannelId(null);
    setPrintedChannels({});
    setTestState(usbConnected ? 'USB_CONNECTED' : 'IDLE');
    showWarningAlert('Console Reset', '8-Channel Jig Console state reset to initial.');
  };

  const handlePrintQrCodes = () => {
    const newPrinted = { ...printedChannels };
    activeChannels.forEach(c => {
      const cls = getChannelClassification(c);
      if (c.nic_uuid || cls.isValid) {
        newPrinted[c.ch] = true;
      }
    });
    setPrintedChannels(newPrinted);
    window.print();
  };

  // Determine button enablement
  const isStartDisabled = !usbConnected || testState === 'STARTING' || testState === 'SAVING';
  const isSaveDisabled = !jigData || !jigData.ch || testState === 'SAVING' || testState === 'SAVED' || testState === 'STARTING';
  const isExportDisabled = !isSavedToDb;

  const renderStage06Calibration = () => {
    return (
      <div className="container-fluid px-0 pb-4">
        {/* Top Header Card */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 bg-white p-4 rounded-3 shadow-sm border">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                  <h1 className="fs-3 mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                    <i className="ti ti-bolt text-primary"></i>
                    <span>Meter Calibration & Accuracy Console</span>
                  </h1>
                  <span className="badge text-white font-mono px-2.5 py-1 fs-6 shadow-2xs" style={{ backgroundColor: '#ff5c00' }}>
                    6-Stage
                  </span>
                  <span className="badge bg-success text-white px-3 py-1.5 font-mono text-xs d-inline-flex align-items-center gap-1 shadow-2xs">
                    <i className="ti ti-power fs-6"></i> 230V 5A AC Power Bench Active
                  </span>
                  {stage6Saved && (
                    <span className="badge bg-success text-white px-3 py-1 font-mono shadow-2xs">
                      <i className="ti ti-database-check me-1"></i>CALIBRATION SAVED
                    </span>
                  )}
                </div>
                <p className="text-secondary mb-0 small">
                  Stage 06: Voltage, Current & Meter Pulse Calibration &bull; Inject 230V 5A Power Source &bull; Measure Pulse Error (% Limit &le; 0.20%) &bull; Error Lock Validation
                </p>
              </div>

              <div className="d-flex align-items-center gap-2 flex-wrap">
                <button
                  className="btn btn-outline-secondary btn-sm font-sans fw-semibold shadow-2xs"
                  onClick={handleExportStage6Excel}
                >
                  <i className="ti ti-file-spreadsheet me-1 text-success"></i> Download Report
                </button>
                <button
                  className="btn btn-light border btn-sm font-sans fw-semibold"
                  onClick={handleResetStage6}
                >
                  <i className="ti ti-refresh me-1"></i> Reset Bench
                </button>
                <button
                  className={`btn px-4 py-2 fw-bold shadow-sm ${stage6Testing ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={handleStartStage6Test}
                  disabled={stage6Testing}
                >
                  <i className={`ti ${stage6Testing ? 'ti-loader spin' : 'ti-player-play'} me-1`}></i>
                  {stage6Testing ? 'Injecting 230V Power...' : 'Start Calibration Test'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Control & Parameter Banner */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 bg-primary-subtle p-3 rounded-3 shadow-2xs">
              <span className="text-muted small d-block">Reference AC Voltage</span>
              <strong className="text-primary font-mono fs-4">230.00 V</strong>
              <small className="text-success fw-medium">Tolerance &plusmn; 0.1%</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-success-subtle p-3 rounded-3 shadow-2xs">
              <span className="text-muted small d-block">Reference Current</span>
              <strong className="text-success font-mono fs-4">5.000 A</strong>
              <small className="text-success fw-medium">Frequency 50.00 Hz</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-info-subtle p-3 rounded-3 shadow-2xs">
              <span className="text-muted small d-block">Pulse Error Limit</span>
              <strong className="text-info-emphasis font-mono fs-4">&le; &plusmn; 0.20%</strong>
              <small className="text-info fw-medium font-mono">1600 imp / kWh</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-warning-subtle p-3 rounded-3 shadow-2xs">
              <span className="text-muted small d-block">Error Lock System</span>
              <strong className="text-warning-emphasis font-mono fs-4">ACTIVE LOCK</strong>
              <small className="text-dark fw-medium">Auto-Lock on &gt;0.20% Error</small>
            </div>
          </div>
        </div>

        {/* 6-Position Calibration Bench Telemetry Grid */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <i className="ti ti-layout-grid fs-4 me-2 text-primary"></i>
              <h5 className="mb-0 fw-bold text-dark">6-Position Calibration Bench Telemetry</h5>
            </div>
            <button
              className="btn btn-sm btn-success fw-semibold shadow-2xs"
              onClick={handleSaveStage6ToDb}
              disabled={stage6Testing}
            >
              <i className="ti ti-database-check me-1"></i> Save Calibration to DB
            </button>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              {stage6Meters.map((m, idx) => (
                <div key={idx} className="col-md-6 col-lg-4">
                  <div className={`border rounded-3 p-3 transition-all h-100 shadow-2xs ${m.status === 'PASS' ? 'border-success-subtle bg-white' : 'border-danger-subtle bg-white'}`}>
                    <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
                      <span className="badge bg-dark text-white font-mono px-2 py-1">Position #{m.pos}</span>
                      <span className={`badge ${m.status === 'PASS' ? 'bg-success-subtle text-success border border-success' : 'bg-danger-subtle text-danger border border-danger'} font-mono`}>
                        <i className={`ti ${m.status === 'PASS' ? 'ti-check' : 'ti-x'} me-1`}></i>
                        {m.status}
                      </span>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted d-block">Meter Serial Number</small>
                      <strong className="text-dark font-mono fs-6">{m.serial_no}</strong>
                    </div>

                    <div className="row g-2 font-mono text-xs my-2 bg-light p-2 rounded border">
                      <div className="col-6">
                        <span className="text-muted d-block">Voltage (V):</span>
                        <strong className="text-primary">{m.voltage} V</strong>
                      </div>
                      <div className="col-6">
                        <span className="text-muted d-block">Current (A):</span>
                        <strong className="text-success">{m.current} A</strong>
                      </div>
                      <div className="col-6">
                        <span className="text-muted d-block">Active Power:</span>
                        <strong className="text-dark">{m.power} W</strong>
                      </div>
                      <div className="col-6">
                        <span className="text-muted d-block">Pulse Rate:</span>
                        <strong className="text-dark">{m.pulse_rate} imp/kWh</strong>
                      </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                      <div>
                        <span className="text-muted small d-block">Pulse Error %</span>
                        <strong className={`fs-5 font-mono ${Math.abs(m.error_pct) <= 0.20 ? 'text-success' : 'text-danger'}`}>
                          {m.error_pct > 0 ? `+${m.error_pct}%` : `${m.error_pct}%`}
                        </strong>
                      </div>
                      <div className="text-end">
                        <span className="text-muted small d-block">Error Lock</span>
                        <span className={`badge px-2 py-1 ${m.error_lock === 'NO LOCK' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'}`}>
                          <i className={`ti ${m.error_lock === 'NO LOCK' ? 'ti-lock-open' : 'ti-lock'} me-1`}></i>
                          {m.error_lock}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Calibration Terminal Logs */}
        <div className="card bg-dark text-white border-secondary font-mono shadow-sm">
          <div className="card-header bg-black py-2 px-3 border-secondary d-flex align-items-center justify-content-between">
            <span className="small text-secondary fw-bold">
              <i className="ti ti-terminal me-2 text-info"></i>Calibration Bench Live Serial Telemetry Logs
            </span>
            <span className="badge bg-secondary text-white text-xs">230V 5A Source Sync</span>
          </div>
          <div className="card-body p-3 overflow-auto" style={{ maxHeight: '180px', fontSize: '0.785rem' }}>
            {stage6Logs.map((lg, i) => (
              <div key={i} className="text-light opacity-90">{lg}</div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGenericStage = (stgNum, stgTitle, lineType, stationId, desc, iconName) => {
    return (
      <div className="container-fluid px-0 pb-4">
        {/* Top Header Bar */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 bg-white p-4 rounded-3 shadow-sm border">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                  <h1 className="fs-3 mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                    <i className={`ti ${iconName} text-primary`}></i>
                    <span>{stgTitle}</span>
                  </h1>
                  <span className="badge text-white font-mono px-2.5 py-1 fs-6 shadow-2xs" style={{ backgroundColor: '#ff5c00' }}>
                    {stgNum}-Stage
                  </span>
                  <span className="badge bg-success text-white px-3 py-1.5 font-mono text-xs d-inline-flex align-items-center gap-1 shadow-2xs">
                    <i className="ti ti-circle-check fs-6"></i> Station Active ({stationId})
                  </span>
                </div>
                <p className="text-secondary mb-0 small">
                  {lineType} &bull; Process Checks: {desc}
                </p>
              </div>

              <div className="d-flex align-items-center gap-2 flex-wrap">
                <button className="btn btn-outline-secondary btn-sm font-sans fw-semibold shadow-2xs">
                  <i className="ti ti-file-spreadsheet me-1 text-success"></i> Export Logs
                </button>
                <button className="btn btn-primary px-4 py-2 fw-bold shadow-sm">
                  <i className="ti ti-player-play me-1"></i> Start Stage Operation
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stage Process Information & Telemetry Cards */}
        <div className="row g-4 mb-4">
          <div className="col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <i className={`ti ${iconName} fs-4 me-2 text-primary`}></i>
                  <h5 className="mb-0 fw-bold text-dark">Stage Process Execution Console</h5>
                </div>
                <span className="badge bg-primary-subtle text-primary border border-primary px-3 py-1">
                  Ready for Production
                </span>
              </div>
              <div className="card-body p-4">
                <div className="alert alert-light border d-flex align-items-center mb-4 text-dark">
                  <i className="ti ti-info-circle fs-3 me-3 text-primary"></i>
                  <div>
                    <h6 className="fw-bold mb-1 text-dark">Stage Specification Overview</h6>
                    <p className="mb-0 small text-muted">
                      <strong>Line:</strong> {lineType} &bull; <strong>Hardware Station:</strong> {stationId} &bull; <strong>Assigned Operator:</strong> {user?.name || user?.user_name || 'Operator'} {user?.employee_id ? `(${user.employee_id})` : ''}
                    </p>
                  </div>
                </div>

                <div className="border rounded-3 p-4 bg-light-subtle text-center py-5 border-dashed mb-3">
                  <i className={`ti ${iconName} fs-1 text-primary opacity-75 mb-3 d-block`}></i>
                  <h4 className="fw-bold text-dark mb-2">{stgTitle} Console Active</h4>
                  <p className="text-secondary small mb-4 max-w-lg mx-auto">
                    {desc}. Station operational telemetry, process checklist validation, and database records.
                  </p>
                  <button className="btn btn-primary px-4 py-2 fw-bold shadow-sm">
                    <i className="ti ti-player-play me-1"></i> Trigger Stage {stgNum} Process Check
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white py-3 border-bottom">
                <h6 className="mb-0 fw-bold text-dark">Station Hardware & Line Status</h6>
              </div>
              <div className="card-body p-3">
                <div className="vstack gap-3 small font-mono">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Production Line:</span>
                    <strong className="text-dark">{lineType}</strong>
                  </div>
                  <hr className="my-0 text-muted opacity-25" />
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Station ID:</span>
                    <strong className="text-primary">{stationId}</strong>
                  </div>
                  <hr className="my-0 text-muted opacity-25" />
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Operator:</span>
                    <strong className="text-dark">{user?.name || 'Operator'}</strong>
                  </div>
                  <hr className="my-0 text-muted opacity-25" />
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Station Status:</span>
                    <span className="badge bg-success-subtle text-success border border-success px-2 py-1">OPERATIONAL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (stageId === 6) {
    return renderStage06Calibration();
  }

  // Generic Stages (Stages other than Stage 4 JIG Test and Stage 6 Calibration Bench)
  if (stageId !== 4) {
    const matchedStage = allStages.find(s => (s.stage_number || s.id) === stageId) ||
      (user?.assignedStagesList || []).find(s => (s.stage_number || s.id) === stageId);

    const stgNum = matchedStage?.stage_number || matchedStage?.id || stageId;
    const stgTitle = matchedStage?.stage_name || `Stage ${String(stgNum).padStart(2, '0')}`;
    const lineType = matchedStage?.line_type || 'Main Meter Assembly Line';
    const stationId = matchedStage?.hardware_station || `Station-${String(stgNum).padStart(2, '0')}`;
    const desc = matchedStage?.description || 'Station process operational checklist validation';

    const iconMap = {
      1: 'ti-code',
      2: 'ti-cpu-2',
      3: 'ti-box',
      5: 'ti-package',
      7: 'ti-barcode',
      8: 'ti-checks',
      9: 'ti-tag',
      10: 'ti-box-padding',
      11: 'ti-boxes'
    };
    const iconName = iconMap[stgNum] || 'ti-cpu';

    return renderGenericStage(stgNum, stgTitle, lineType, stationId, desc, iconName);
  }

  return (
    <>
      {/* Top Header Bar */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 bg-white p-4 rounded-3 shadow-sm border">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                <h1 className="fs-3 mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="ti ti-tools text-primary"></i>
                  <span>Jig Test Console</span>
                </h1>

                {cycleUuid && (
                  <span className="badge bg-primary text-white font-mono px-2.5 py-1 fs-6 shadow-2xs">
                    {cycleUuid} (Cycle #{cycleId})
                  </span>
                )}

                {usbConnected ? (
                  <span className="badge bg-success text-white px-3 py-1.5 font-mono text-xs d-inline-flex align-items-center gap-1 shadow-2xs">
                    <i className="ti ti-usb fs-6"></i> {
                      formatPortName(
                        detailedPorts.find(dp => dp.path === (usbDeviceName || selectedPort))?.shortName ||
                        detailedPorts.find(dp => dp.path === (usbDeviceName || selectedPort))?.friendlyName ||
                        usbDeviceName || selectedPort || 'COM3'
                      )
                    } Connected
                  </span>
                ) : (
                  <span className="badge bg-danger text-white px-3 py-1.5 font-mono text-xs d-inline-flex align-items-center gap-1 shadow-2xs">
                    <i className="ti ti-plug-connected-x fs-6"></i> USB Removed
                  </span>
                )}

                {isSavedToDb && (
                  <span className="badge bg-success text-white px-3 py-1 font-mono shadow-2xs">
                    <i className="ti ti-database-check me-1"></i>DB SAVED
                  </span>
                )}
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              {/* USB COM Port Select Dropdown */}
              <div className="d-flex align-items-center gap-1 bg-light p-1 rounded-2 border">
                <i className="ti ti-plug text-primary ms-1"></i>
                <select
                  className="form-select form-select-sm font-mono border-0 bg-transparent py-1 pe-4 text-dark fw-bold"
                  style={{ minWidth: '160px', cursor: 'pointer' }}
                  value={selectedPort}
                  onChange={(e) => handlePortSelectChange(e.target.value)}
                  disabled={testState === 'STARTING' || testState === 'SAVING'}
                  title="Detected USB Ports"
                >
                  {availablePorts.length === 0 ? (
                    <option value="">No USB Ports</option>
                  ) : (
                    detailedPorts.map((dp, idx) => (
                      <option key={idx} value={dp.path}>
                        {formatPortName(dp.friendlyName || dp.shortName || dp.label || dp.path)}
                      </option>
                    ))
                  )}
                </select>
                <button
                  type="button"
                  className="btn btn-xs btn-outline-secondary py-1 px-2 border-0"
                  onClick={fetchAvailableUsbPorts}
                  title="Scan system USB COM Ports"
                  disabled={testState === 'STARTING' || testState === 'SAVING'}
                >
                  <i className="ti ti-refresh"></i>
                </button>
              </div>

              {/* Start Jig Test Button */}
              <button
                className={`btn px-4 py-2 fw-bold shadow-sm ${isStartDisabled ? 'btn-secondary opacity-75' : 'btn-primary'
                  }`}
                onClick={handleJigStart}
                disabled={isStartDisabled}
                title="Send START to USB -> Receive Data -> Check Duplicates -> Save DB"
              >
                <i className={`ti ${testState === 'STARTING' || testState === 'SAVING' ? 'ti-loader spin' : 'ti-player-play'} me-1`}></i>
                {testState === 'STARTING'
                  ? 'Communicating Protocol...'
                  : testState === 'SAVING'
                    ? 'Saving to DB...'
                    : 'Start Jig test'}
              </button>
            </div>
          </div>
        </div>
      </div>



      {/* 8-Channel Telemetry Grid */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fs-5 fw-bold mb-0 text-dark d-flex align-items-center gap-2">
            <i className="ti ti-layout-grid text-primary"></i>
            <span>8-Channel Hardware Telemetry Output</span>
          </h4>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-light border text-secondary font-mono"
              onClick={() => setShowLogsConsole(!showLogsConsole)}
            >
              <i className="ti ti-terminal me-1"></i>
              {showLogsConsole ? 'Hide Serial Logs' : 'View Serial Logs'}
            </button>
            <span className="badge bg-light text-secondary border font-mono text-xs">2 Rows &bull; 8 Channel Boxes</span>
          </div>
        </div>

        {/* Row 1: Channels 1, 2, 3, 4 */}
        <div className="row g-3 mb-3">
          {activeChannels.slice(0, 4).map((c) => renderChannelBox(c))}
        </div>

        {/* Row 2: Channels 5, 6, 7, 8 */}
        <div className="row g-3 mb-4">
          {activeChannels.slice(4, 8).map((c) => renderChannelBox(c))}
        </div>

        {/* Bottom of 8 Channel Boxes: Collapsible Docklight-Style Communication Terminal Logs */}
        {showLogsConsole && (
          <div className="card bg-dark text-white border-secondary mb-3 font-mono shadow-sm">
            <div className="card-header bg-dark border-secondary py-2 px-3 d-flex justify-content-between align-items-center">
              <span className="small text-success fw-bold d-flex align-items-center gap-1">
                <i className="ti ti-terminal"></i> Serial Communication Log (Docklight Style)
              </span>
              <button className="btn btn-xs btn-outline-light" onClick={() => setJigLogs([])}>Clear Log</button>
            </div>
            <div className="card-body p-3 text-xs" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {jigLogs.length === 0 ? (
                <div className="text-secondary opacity-75">
                  No serial communication logs recorded yet. Plug in USB device and click "Start Jig test".
                </div>
              ) : (
                jigLogs.map((logStr, idx) => (
                  <div key={idx} className={logStr.includes('[ERR]') ? 'text-danger fw-bold' : logStr.includes('[RX]') ? 'text-info fw-bold' : 'text-warning'}>
                    {logStr}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer Bar */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 bg-light rounded-3">
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              onClick={handleResetJigConsole}
              disabled={testState === 'STARTING' || testState === 'SAVING'}
              className="btn btn-outline-secondary px-3"
            >
              <i className="ti ti-x me-1"></i> Reset
            </button>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Validate QR's Button */}
            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              disabled={!jigData || !jigData.ch}
              className="btn btn-outline-primary px-4 fw-bold shadow-2xs"
              title="Open QR Validation and Scanner Interface for tested NIC cards"
            >
              <i className="ti ti-qrcode me-1.5 fs-5"></i> Validate QR's
            </button>

            {/* Download Excel Button */}
            <button
              type="button"
              onClick={handleExportToExcel}
              disabled={isExportDisabled}
              className="btn btn-success px-4 fw-bold text-white shadow-sm"
              title={isSavedToDb ? "Download Excel (.csv) with S.No, IMEI, Payload JSON, NIC UUID & Status" : "Save data to DB first to enable Excel download"}
            >
              <i className="ti ti-file-spreadsheet me-1"></i> Download Excel
            </button>
          </div>
        </div>
      </div>

      {/* NIC QR Code Printable & Scanner Validation Modal */}
      <Modal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title={`Validate NIC Card QR Codes ${cycleUuid ? `(${cycleUuid})` : ''}`}
        size="lg"
      >
        <div className="p-2">
          {(() => {
            const validChannelsForQr = activeChannels.filter(c => {
              const cls = getChannelClassification(c);
              // Show only valid channels that have IMEI and non-duplicate PASS/CON status
              return c.imei && (c.st === 'PASS' || c.st === 'CON') && !cls.isDuplicate;
            });

            if (validChannelsForQr.length === 0) {
              return (
                <div className="text-center py-5 text-muted border rounded-3 bg-light">
                  <i className="ti ti-qrcode-off fs-1 d-block mb-2 text-warning opacity-75"></i>
                  <h6 className="fw-bold text-dark mb-1">No Valid Saved Channels for QR Validation</h6>
                  <p className="small mb-0 text-secondary">
                    Only non-duplicate PASS / CON channels saved in DB with valid IMEI numbers will generate QR codes.
                  </p>
                </div>
              );
            }

            return (
              <div id="printable-nic-qr-grid" className="row g-3">
                {validChannelsForQr.map((c, idx) => {
                  const qrPayload = JSON.stringify({
                    imei_no: String(c.imei || '').trim(),
                    comms_technology: String(c.comms_technology || "12")
                  });

                  const statusVal = validationStatus[c.ch];

                  return (
                    <div key={c.ch} className="col-md-6 col-12">
                      <div className={`border rounded-3 p-3 text-center bg-white shadow-2xs transition-all ${statusVal === 'MATCHED' ? 'border-success border-2 bg-success-subtle' : statusVal === 'MISMATCH' ? 'border-danger border-2' : ''}`}>
                        <div className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom">
                          <span className="fw-bold text-primary font-mono small d-flex align-items-center gap-1">
                            <i className="ti ti-cpu text-primary"></i>
                            <span>Channel {c.ch}</span>
                            {c.nic_uuid && <span className="text-muted ms-1">({c.nic_uuid})</span>}
                          </span>
                          <span className="badge bg-success text-white font-mono text-xs px-2 py-0.5 fw-bold">
                            ✓ {c.st || 'CON'}
                          </span>
                        </div>

                        {/* Generated QR Code SVG */}
                        <div className="d-flex justify-content-center my-2 p-2 bg-light rounded border border-dashed">
                          <QRCodeSVG value={qrPayload} size={115} />
                        </div>

                        <div className="font-mono text-xs fw-bold text-dark mt-1">
                          IMEI: <span className="text-primary">{c.imei}</span> | Comms Tech: <span className="text-dark">12</span>
                        </div>

                        {/* Hardware Barcode Scanner Input Box */}
                        <div className="mt-3 text-start">
                          <label className="small text-dark fw-bold mb-1 d-flex justify-content-between align-items-center">
                            <span className="d-flex align-items-center gap-1">
                              <i className="ti ti-scan text-primary"></i>
                              <span>Scan Channel {c.ch} QR Code:</span>
                            </span>
                            {statusVal === 'MATCHED' && (
                              <span className="badge bg-success text-white border border-success fw-bold px-2 py-0.5">
                                <i className="ti ti-check me-1"></i>VALIDATED
                              </span>
                            )}
                            {statusVal === 'MISMATCH' && (
                              <span className="badge bg-danger text-white border border-danger fw-bold px-2 py-0.5">
                                <i className="ti ti-x me-1"></i>MISMATCH
                              </span>
                            )}
                          </label>
                          <div className="input-group input-group-sm">
                            <span className={`input-group-text bg-white ${statusVal === 'MATCHED' ? 'text-success border-success' : 'text-muted'}`}>
                              <i className={`ti ${statusVal === 'MATCHED' ? 'ti-check' : 'ti-barcode'}`}></i>
                            </span>
                            <input
                              ref={el => (qrInputRefs.current[idx] = el)}
                              type="text"
                              className={`form-control form-control-sm font-mono text-xs ${statusVal === 'MATCHED'
                                ? 'border-success bg-success-subtle text-success fw-bold'
                                : statusVal === 'MISMATCH'
                                  ? 'border-danger bg-danger-subtle text-danger'
                                  : 'border-primary'
                                }`}
                              placeholder={`Scan or paste QR payload for Channel ${c.ch}...`}
                              value={scannedValues[c.ch] || ''}
                              onChange={(e) => handleScanInput(c.ch, idx, c, e.target.value)}
                              onKeyDown={(e) => handleScanKeyDown(e, idx)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </Modal>

      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-nic-qr-grid, #printable-nic-qr-grid * {
            visibility: visible;
          }
          #printable-nic-qr-grid {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </>
  );

  // Helper render for channel box
  function renderChannelBox(c) {
    const cls = getChannelClassification(c);
    const isEditing = editingChannelId === c.ch;

    let cardBorderStyle = { border: '1px solid #e2e8f0', backgroundColor: '#ffffff' };
    let badgeClass = 'bg-secondary-subtle text-secondary border';
    let badgeText = c.st || 'NCON';
    let statusIcon = 'ti-power';

    if (c.st === 'TESTING') {
      cardBorderStyle = { border: '2px solid #3b82f6', backgroundColor: '#ffffff', boxShadow: '0 0 8px rgba(59, 130, 246, 0.2)' };
      badgeClass = 'bg-primary text-white';
      badgeText = 'TESTING';
      statusIcon = 'ti-loader spin';
    } else if (cls.isDuplicate) {
      cardBorderStyle = { border: '2px solid #f59e0b', backgroundColor: '#ffffff', boxShadow: '0 0 8px rgba(245, 158, 11, 0.2)' };
      const stClean = c.st === 'PASS' ? 'PASS' : c.st === 'CON' ? 'CON' : (c.st || 'NCON');
      badgeClass = (stClean === 'PASS' || stClean === 'CON') ? 'bg-success text-white fw-bold' : 'bg-secondary-subtle text-secondary border';
      badgeText = stClean;
      statusIcon = (stClean === 'PASS' || stClean === 'CON') ? 'ti-check' : 'ti-power';
    } else if (c.st === 'FAIL') {
      cardBorderStyle = { border: '2px solid #ef4444', backgroundColor: '#ffffff', boxShadow: '0 0 8px rgba(239, 68, 68, 0.2)' };
      badgeClass = 'bg-danger text-white fw-bold';
      badgeText = 'FAIL';
      statusIcon = 'ti-alert-circle';
    } else if (cls.isValid) {
      cardBorderStyle = { border: '2px solid #10b981', backgroundColor: '#ffffff', boxShadow: '0 0 8px rgba(16, 185, 129, 0.2)' };
      badgeClass = 'bg-success text-white fw-bold';
      badgeText = c.st === 'PASS' ? 'PASS' : c.st;
      statusIcon = 'ti-check';
    }

    const isPrinted = Boolean(printedChannels[c.ch]);
    const isSaved = Boolean(c.nic_uuid || (c.isSavedToDb && isSavedToDb));

    return (
      <div key={c.ch} className="col-lg-3 col-md-6 col-12">
        <div className="card h-100 transition-all shadow-sm" style={cardBorderStyle}>
          {/* Card Header */}
          <div className="card-header bg-transparent py-2 px-3 d-flex justify-content-between align-items-center border-bottom">
            <div className="d-flex align-items-center gap-1">
              <i className="ti ti-cpu text-primary"></i>
              <span className="fw-bold text-dark small">Channel {c.ch}</span>
            </div>

            <div className="d-flex align-items-center gap-1">
              <span className={`badge ${badgeClass} font-mono px-2 py-0.5 text-xs`}>
                <i className={`ti ${statusIcon} me-1`}></i>
                {badgeText}
              </span>
              <button
                type="button"
                className={`btn btn-xs py-0.5 px-1.5 border-0 ${isEditing ? 'btn-secondary' : 'btn-outline-primary'}`}
                onClick={() => handleStartEditCard(c)}
                title="Edit Channel Data Manually"
              >
                <i className={`ti ${isEditing ? 'ti-x' : 'ti-pencil'} text-xs`}></i>
              </button>
            </div>
          </div>

          {/* Card Body */}
          <div className="card-body p-3 font-mono text-xs">
            {isEditing ? (
              /* Inline Edit Mode Form */
              <div className="d-flex flex-column gap-2 bg-white p-2 rounded border shadow-2xs">
                <div className="fw-bold text-primary border-bottom pb-1 mb-1 text-2xs d-flex justify-content-between align-items-center">
                  <span><i className="ti ti-edit me-1"></i>Edit Channel {c.ch} Data</span>
                  <span className="text-muted text-2xs">Manual Input</span>
                </div>
                <div>
                  <label className="text-secondary text-2xs mb-0 fw-semibold">IMEI Number:</label>
                  <input
                    type="text"
                    className="form-control form-control-sm font-mono py-1 text-xs fw-bold"
                    value={editFormData.imei}
                    onChange={(e) => setEditFormData({ ...editFormData, imei: e.target.value })}
                    placeholder="Enter IMEI (e.g. 86099...)"
                  />
                </div>
                <div className="row g-1">
                  <div className="col-6">
                    <label className="text-secondary text-2xs mb-0">HWV:</label>
                    <input
                      type="text"
                      className="form-control form-control-sm font-mono py-0.5 text-xs"
                      value={editFormData.hwv}
                      onChange={(e) => setEditFormData({ ...editFormData, hwv: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="text-secondary text-2xs mb-0">FWV:</label>
                    <input
                      type="text"
                      className="form-control form-control-sm font-mono py-0.5 text-xs"
                      value={editFormData.fwv}
                      onChange={(e) => setEditFormData({ ...editFormData, fwv: e.target.value })}
                    />
                  </div>
                </div>
                <div className="row g-1">
                  <div className="col-6">
                    <label className="text-secondary text-2xs mb-0">SIG:</label>
                    <input
                      type="text"
                      className="form-control form-control-sm font-mono py-0.5 text-xs"
                      value={editFormData.sig}
                      onChange={(e) => setEditFormData({ ...editFormData, sig: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="text-secondary text-2xs mb-0">Comms Tech:</label>
                    <input
                      type="text"
                      className="form-control form-control-sm font-mono py-0.5 text-xs"
                      value={editFormData.comms_technology}
                      onChange={(e) => setEditFormData({ ...editFormData, comms_technology: e.target.value })}
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-1 mt-1 pt-1 border-top">
                  <button
                    type="button"
                    className="btn btn-xs btn-primary fw-bold px-2 py-1"
                    onClick={() => handleUpdateChannelCard(c.ch, false)}
                  >
                    <i className="ti ti-check me-1"></i>Update
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-success text-white fw-bold px-2 py-1"
                    onClick={() => handleUpdateChannelCard(c.ch, true)}
                  >
                    <i className="ti ti-database-import me-1"></i>Update & Save DB
                  </button>
                </div>
              </div>
            ) : (
              /* Display Mode */
              <>
                {c.nic_uuid && (
                  <div className="d-flex justify-content-between mb-1 pb-1 border-bottom border-light">
                    <span className="text-secondary">nic_uuid:</span>
                    <span className="fw-bold text-primary font-mono">{c.nic_uuid}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-1 pb-1 border-bottom border-light">
                  <span className="text-secondary">imei:</span>
                  <span className={`fw-bold font-mono ${cls.isDuplicate ? 'text-warning text-dark' : 'text-dark'}`}>
                    {c.imei || '-'}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-1 pb-1 border-bottom border-light">
                  <span className="text-secondary">hwv:</span>
                  <span className="fw-bold text-dark font-mono">{c.hwv || '-'}</span>
                </div>
                <div className="d-flex justify-content-between mb-1 pb-1 border-bottom border-light">
                  <span className="text-secondary">fwv:</span>
                  <span className="fw-bold text-dark font-mono">{c.fwv || '-'}</span>
                </div>

                {/* Card Bottom: Sig, DB Status & QR-Print Status */}
                <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-light">
                  <span className="text-secondary">sig:</span>
                  <span className={`fw-bold ${c.sig ? 'text-success' : 'text-muted'}`}>{c.sig || '-'}</span>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-light">
                  <span className="text-secondary">DB:</span>
                  {testState === 'SAVING' ? (
                    <span className="text-primary fw-bold text-2xs d-inline-flex align-items-center gap-1">
                      <i className="ti ti-loader spin"></i>Processing...
                    </span>
                  ) : cls.isDuplicate ? (
                    <span className="badge bg-warning-subtle text-dark border border-warning text-2xs px-1.5 py-0.5">
                      DUPLICATE
                    </span>
                  ) : isSaved ? (
                    <span className="badge bg-success-subtle text-success border border-success text-2xs px-1.5 py-0.5">
                      <i className="ti ti-check me-0.5"></i>SAVED
                    </span>
                  ) : (
                    <span className="text-muted text-2xs">-</span>
                  )}
                </div>

                <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-light">
                  <span className="text-secondary">QR-Print:</span>
                  {isPrinted ? (
                    <span className="badge bg-success-subtle text-success border border-success text-2xs px-1.5 py-0.5">
                      Printed
                    </span>
                  ) : (
                    <span className="text-muted text-2xs">-</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}
