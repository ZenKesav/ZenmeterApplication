export const PRODUCTION_STAGES = [
  { id: 1, code: 'STAGE_01', name: 'PCB Code Loading Test', isManual: false, icon: 'Cpu' },
  { id: 2, code: 'STAGE_02', name: 'NIC Card PCB Test', isManual: false, icon: 'Wifi' },
  { id: 3, code: 'STAGE_03', name: 'NIC Card Box Assembly', isManual: true, icon: 'Box' },
  { id: 4, code: 'STAGE_04', name: 'NIC Card Inside Print', isManual: false, icon: 'Printer' },
  { id: 5, code: 'STAGE_05', name: 'Meter PCB Box Assembly', isManual: true, icon: 'Package' },
  { id: 6, code: 'STAGE_06', name: 'Calibration & Accuracy', isManual: false, icon: 'Zap' },
  { id: 7, code: 'STAGE_07', name: 'Meter Box Body Print', isManual: false, icon: 'QrCode' },
  { id: 8, code: 'STAGE_08', name: 'Final Functional Validation', isManual: false, icon: 'CheckCircle2' },
  { id: 9, code: 'STAGE_09', name: 'PVC Seal Verification', isManual: false, icon: 'ShieldCheck' },
  { id: 10, code: 'STAGE_10', name: 'Meter Cotton Box Print', isManual: false, icon: 'Printer' },
  { id: 11, code: 'STAGE_11', name: 'Master Box Cotton Print', isManual: false, icon: 'Layers' }
];

export const getStageById = (id) => PRODUCTION_STAGES.find(s => s.id === Number(id));
