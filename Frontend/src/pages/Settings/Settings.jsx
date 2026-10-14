import React, { useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../app/store';
import { Input } from '../../components/CommonComponents';
import { showSuccessAlert } from '../../utils/swal';

export default function Settings() {
  const { user } = useAuth();
  const rawRole = (user?.role || '').toUpperCase();
  const isAdmin = rawRole.includes('ADMIN');

  const initialConfig = {
    comPort: '/dev/ttyUSB0',
    modbusBaud: '9600 8N1',
    opticalBaud: '9600 DLMS/COSEM',
    refVoltage: '230.00',
    currentInjection: '5.00',
    accuracyLimit: '≤ 0.20%',
    apiEndpoint: `http://${window.location.hostname}:5003/api/v1`,
    wsEndpoint: `ws://${window.location.hostname}:5003/ws`
  };

  const [config, setConfig] = useState(initialConfig);
  const initialRef = useRef(initialConfig);

  if (!isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const hasConfigChanged =
    config.comPort !== initialRef.current.comPort ||
    config.modbusBaud !== initialRef.current.modbusBaud ||
    config.opticalBaud !== initialRef.current.opticalBaud ||
    config.refVoltage !== initialRef.current.refVoltage ||
    config.currentInjection !== initialRef.current.currentInjection ||
    config.accuracyLimit !== initialRef.current.accuracyLimit ||
    config.apiEndpoint !== initialRef.current.apiEndpoint ||
    config.wsEndpoint !== initialRef.current.wsEndpoint;

  const handleSaveHardwareConfig = () => {
    initialRef.current = { ...config };
    showSuccessAlert('Settings Saved', 'System hardware parameters and database gateway endpoints updated successfully.');
  };

  return (
    <>
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fs-3 mb-1 fw-bold text-dark d-flex align-items-center gap-2">
            <i className="ti ti-settings text-primary"></i>
            System Settings & Configuration
          </h1>
          <p className="text-secondary mb-0">
            Stage Specifications, Hardware Baud Rates & System Gateway Controls
          </p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Hardware & Calibration Jig Settings */}
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white px-4 py-3">
              <h3 className="h6 fw-bold text-primary mb-0 d-flex align-items-center gap-2">
                <i className="ti ti-cpu fs-5"></i>
                <span>Hardware Test Jig Serial Communication Parameters</span>
              </h3>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-6 col-12">
                  <Input
                    label="Primary Serial COM Port"
                    name="comPort"
                    value={config.comPort}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 col-12">
                  <Input
                    label="MODBUS Baud Rate"
                    name="modbusBaud"
                    value={config.modbusBaud}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 col-12">
                  <Input
                    label="Optical Port Baud Rate"
                    name="opticalBaud"
                    value={config.opticalBaud}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 col-12">
                  <Input
                    label="Calibration Reference Voltage (V)"
                    name="refVoltage"
                    value={config.refVoltage}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 col-12">
                  <Input
                    label="Calibration Current Injection (A)"
                    name="currentInjection"
                    value={config.currentInjection}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 col-12">
                  <Input
                    label="Class Accuracy Limit (%)"
                    name="accuracyLimit"
                    value={config.accuracyLimit}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Database & Gateway Settings */}
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white px-4 py-3">
              <h3 className="h6 fw-bold text-success mb-0 d-flex align-items-center gap-2">
                <i className="ti ti-database fs-5"></i>
                <span>Database & WebSocket Realtime Gateway</span>
              </h3>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-6 col-12">
                  <Input
                    label="REST API Base Endpoint"
                    name="apiEndpoint"
                    value={config.apiEndpoint}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 col-12">
                  <Input
                    label="WebSocket Event Gateway"
                    name="wsEndpoint"
                    value={config.wsEndpoint}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 d-flex justify-content-end">
          <button
            className="btn btn-primary px-4 py-2 fw-semibold shadow-sm"
            onClick={handleSaveHardwareConfig}
            disabled={!hasConfigChanged}
          >
            <i className="ti ti-device-floppy me-1"></i> Save System Configuration
          </button>
        </div>
      </div>
    </>
  );
}

