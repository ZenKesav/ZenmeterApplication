import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { meterService } from '../../services/apiServices';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { LoadingSpinner } from '../../components/CommonComponents';

export default function MeterTraceability() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMeter = searchParams.get('meter') || 'MTR000001';

  const [query, setQuery] = useState(initialMeter);
  const [traceData, setTraceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTraceability = (meterNo) => {
    if (!meterNo) return;
    setLoading(true);
    setError('');
    meterService.getMeterByNo(meterNo)
      .then(res => {
        setTraceData(res);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Meter not found.');
        setTraceData(null);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTraceability(initialMeter);
  }, [initialMeter]);

  useEffect(() => {
    if (!query || !query.trim()) return;
    const timer = setTimeout(() => {
      fetchTraceability(query.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ meter: query });
    fetchTraceability(query);
  };

  return (
    <>
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fs-3 mb-0 fw-bold text-dark">Meter Traceability Audit</h1>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-3">
          <form onSubmit={handleSearch} className="d-flex gap-2">
            <div className="input-group flex-grow-1">
              <span className="input-group-text bg-white border-end-0">
                <i className="ti ti-search text-muted"></i>
              </span>
              <input
                type="text"
                placeholder="Scan QR or Enter Meter No / Serial No..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="form-control border-start-0"
              />
            </div>
            <button type="submit" className="btn btn-primary px-4 fw-medium">
              Audit Meter
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-3 px-4 text-center rounded-3 mb-4">
          {error}
        </div>
      )}

      {loading && <LoadingSpinner text="Querying Hardware Traceability Logs..." />}

      {traceData?.meter && (
        <div className="space-y-4">
          {/* Meter Summary Header Card */}
          <div className="card shadow-sm border-start border-4 border-primary mb-4">
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-sm-3 col-6">
                  <small className="text-muted text-uppercase fw-semibold d-block">Meter Number</small>
                  <strong className="fs-5 text-primary">{traceData.meter.meter_no}</strong>
                </div>
                <div className="col-sm-3 col-6">
                  <small className="text-muted text-uppercase fw-semibold d-block">Serial Number</small>
                  <span className="badge bg-light text-dark border fs-6 mt-1">{traceData.meter.serial_no}</span>
                </div>
                <div className="col-sm-3 col-6">
                  <small className="text-muted text-uppercase fw-semibold d-block">Batch Number</small>
                  <span className="fw-medium text-dark">{traceData.meter.batch_no}</span>
                </div>
                <div className="col-sm-3 col-6">
                  <small className="text-muted text-uppercase fw-semibold d-block">Status</small>
                  <div className="mt-1"><StatusBadge status={traceData.meter.status} /></div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline of Stages */}
          <div className="card shadow-sm">
            <div className="card-header bg-white px-4 py-3">
              <h4 className="mb-0 h5 fw-bold text-dark">
                <i className="ti ti-clock me-2 text-primary"></i>
                Production Stage Hardware Executions ({traceData.traceability?.stageResults?.length || 0})
              </h4>
            </div>
            <div className="card-body p-4">
              <div className="timeline">
                {traceData.traceability?.stageResults?.map((r) => (
                  <div key={r.id} className="card shadow-sm mb-3 border-light">
                    <div className="card-body p-3">
                      <div className="d-flex flex-wrap justify-content-between align-items-center mb-2 gap-2">
                        <h6 className="fw-bold mb-0 text-primary">{r.stage_name}</h6>
                        <div className="d-flex align-items-center gap-3">
                          <small className="text-muted">Operator: {r.operator_id}</small>
                          <StatusBadge status={r.status} />
                        </div>
                      </div>

                      {r.measurements && (
                        <div className="bg-light p-3 rounded-3 border font-mono small mt-2">
                          <div className="fw-bold text-dark mb-1">
                            <i className="ti ti-terminal me-1 text-primary"></i> Hardware Telemetry Output
                          </div>
                          <p className="mb-2 text-secondary">{r.hardware_logs}</p>
                          <pre className="mb-0 bg-white p-2 rounded border text-muted small">
                            {JSON.stringify(r.measurements, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {(!traceData.traceability?.stageResults || traceData.traceability.stageResults.length === 0) && (
                  <div className="text-center py-4 text-muted">
                    No stage hardware test results recorded for this meter yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
