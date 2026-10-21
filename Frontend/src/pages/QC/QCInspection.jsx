import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { qcService, meterService } from '../../services/apiServices';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { LoadingSpinner } from '../../components/CommonComponents';
import { showSuccessAlert, showWarningAlert, showErrorAlert } from '../../utils/swal';

export default function QCInspection() {
  const [searchParams] = useSearchParams();
  const queryMeter = searchParams.get('meter') || '';

  const [queue, setQueue] = useState([]);
  const [selectedMeter, setSelectedMeter] = useState(queryMeter);
  const [traceabilityData, setTraceabilityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadQueue = () => {
    setLoading(true);
    qcService.getQCQueue().then(res => {
      const qList = Array.isArray(res) ? res : (res?.data || res?.queue || []);
      setQueue(qList);
      setLoading(false);
      if (!selectedMeter && qList.length > 0) {
        setSelectedMeter(qList[0].meter_no);
      }
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadQueue();
  }, []);

  useEffect(() => {
    if (selectedMeter) {
      meterService.getMeterByNo(selectedMeter)
        .then(res => setTraceabilityData(res))
        .catch(err => setTraceabilityData(null));
    }
  }, [selectedMeter]);

  const handleInspect = async (status) => {
    if (!selectedMeter) return;
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await qcService.inspectMeter({
        meter_no: selectedMeter,
        status,
        remarks,
        checklist: {
          physical_inspection: 'OK',
          laser_marking_verified: true,
          seal_intact: true,
          calibration_certificate_generated: true
        }
      });
      const alertMsg = res.message || `Meter '${selectedMeter}' QC status set to ${status}.`;
      setMessage(alertMsg);

      if (status === 'PASS') {
        showSuccessAlert('QC Inspection Approved', alertMsg);
      } else if (status === 'HOLD') {
        showWarningAlert('QC Inspection Placed on Hold', alertMsg);
      } else {
        showErrorAlert('QC Inspection Rejected', alertMsg);
      }

      setRemarks('');
      loadQueue();
    } catch (err) {
      const errMsg = err.message || 'QC inspection failed.';
      setError(errMsg);
      showErrorAlert('QC Action Failed', errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fs-3 mb-0 fw-bold text-dark">Quality Control Inspection Console</h1>
        </div>
      </div>

      {message && (
        <div className="alert alert-success py-3 px-4 mb-4">
          <i className="ti ti-check me-2"></i>
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger py-3 px-4 mb-4">
          <i className="ti ti-alert-circle me-2"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="row g-4">
        {/* Left Side: Pending Queue */}
        <div className="col-lg-4 col-12">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white px-4 py-3">
              <h4 className="mb-0 h5 fw-bold text-dark">Pending QC Queue ({queue.length})</h4>
            </div>
            <div className="card-body p-3">
              <div className="list-group list-group-flush max-vh-50 overflow-y-auto">
                {queue.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMeter(m.meter_no)}
                    className={`list-group-item list-group-item-action p-3 rounded-3 mb-2 border text-start ${
                      selectedMeter === m.meter_no ? 'border-primary bg-primary-subtle' : ''
                    }`}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong className="text-primary fs-6">{m.meter_no}</strong>
                      <StatusBadge status={m.status} />
                    </div>
                    <small className="text-muted d-block">SN: {m.serial_no}</small>
                  </button>
                ))}
                {queue.length === 0 && (
                  <div className="text-center py-5 text-muted">
                    <i className="ti ti-folder-off fs-2 d-block mb-2 text-secondary opacity-50"></i>
                    <span className="fw-semibold">Data not found</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Traceability Inspection & Decision Panel */}
        <div className="col-lg-8 col-12">
          <div className="card shadow-sm h-100">
            {traceabilityData?.meter ? (
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center pb-3 border-bottom mb-4">
                  <div>
                    <small className="text-primary fw-bold text-uppercase d-block">INSPECTING METER</small>
                    <h2 className="h4 fw-bold text-dark mb-0">{traceabilityData.meter.meter_no}</h2>
                    <small className="text-muted">Serial: {traceabilityData.meter.serial_no}</small>
                  </div>
                  <StatusBadge status={traceabilityData.meter.status} />
                </div>

                {/* QC Verification Checklist */}
                <div className="p-3 bg-light rounded-3 border mb-4">
                  <h6 className="fw-bold text-dark mb-2 text-uppercase small">QC Verification Checklist</h6>
                  <div className="row g-2 small text-secondary">
                    <div className="col-6 d-flex align-items-center gap-2">
                      <span className="badge bg-success rounded-circle p-1"> </span>
                      <span>11 Production Stages Completed</span>
                    </div>
                    <div className="col-6 d-flex align-items-center gap-2">
                      <span className="badge bg-success rounded-circle p-1"> </span>
                      <span>Physical PVC Seal Intact</span>
                    </div>
                    <div className="col-6 d-flex align-items-center gap-2">
                      <span className="badge bg-success rounded-circle p-1"> </span>
                      <span>Laser Engraving Verifiable</span>
                    </div>
                    <div className="col-6 d-flex align-items-center gap-2">
                      <span className="badge bg-success rounded-circle p-1"> </span>
                      <span>Master Box Weight Spec ±2g</span>
                    </div>
                  </div>
                </div>

                {/* Remarks Input */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark small">QC Inspector Remarks</label>
                  <textarea
                    rows="3"
                    placeholder="Add inspection notes or defect details..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="form-control"
                  />
                </div>

                {/* Action Buttons: PASS / REJECT / HOLD */}
                <div className="row g-2">
                  <div className="col-4">
                    <button
                      className="btn btn-success w-100 py-2.5 fw-bold"
                      onClick={() => handleInspect('PASS')}
                      disabled={submitting}
                    >
                      <i className="ti ti-check me-1"></i> PASS
                    </button>
                  </div>

                  <div className="col-4">
                    <button
                      className="btn btn-warning w-100 py-2.5 fw-bold"
                      onClick={() => handleInspect('HOLD')}
                      disabled={submitting}
                    >
                      <i className="ti ti-alert-triangle me-1"></i> HOLD
                    </button>
                  </div>

                  <div className="col-4">
                    <button
                      className="btn btn-danger w-100 py-2.5 fw-bold"
                      onClick={() => handleInspect('REJECT')}
                      disabled={submitting}
                    >
                      <i className="ti ti-x me-1"></i> REJECT
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-body p-5 text-center text-muted">
                Select a meter from the queue to start Quality Inspection.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
