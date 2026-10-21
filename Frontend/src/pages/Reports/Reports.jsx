import React, { useState, useEffect } from 'react';
import SalesOverviewChart from '../../components/Charts/SalesOverviewChart';
import StatCard from '../../components/Cards/StatCard';
import { reportService } from '../../services/apiServices';
import { LoadingSpinner } from '../../components/CommonComponents';
import p1 from '../../assets/images/product-1.png';
import p2 from '../../assets/images/product-2.png';
import p3 from '../../assets/images/product-3.png';

const Reports = () => {
  const [period, setPeriod] = useState('daily');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    reportService.getReports({ type: period })
      .then(res => {
        setReport(res.report);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [period]);

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
            <div>
              <h1 className="fs-3 mb-0 fw-bold">Reports</h1>
            </div>
            <div className="btn-group" role="group">
              {['daily', 'weekly', 'monthly', 'yearly'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPeriod(tab)}
                  className={`btn btn-sm ${period === tab ? 'btn-primary' : 'btn-outline-secondary'}`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Generating Analytics Reports..." />
      ) : (
        <>
          {/* Row 1: KPI Summary Stat Cards */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-md-3">
              <StatCard
                title="Total Revenue"
                value="$45,231"
                changeText="12% from last month"
                variant="primary"
                icon="ti ti-currency-dollar"
              />
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <StatCard
                title="Tested Units"
                value={report?.summary?.totalTested || 1234}
                changeText="8% from last month"
                variant="success"
                icon="ti ti-check"
              />
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <StatCard
                title="First Pass Yield"
                value={`${report?.summary?.firstPassYieldPct || 100}%`}
                changeText="Optimal target met"
                variant="info"
                icon="ti ti-chart-line"
              />
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <StatCard
                title="QC Rejected"
                value={report?.summary?.qcRejected || 5}
                changeText="Flagged for retest"
                variant="danger"
                icon="ti ti-alert-circle"
              />
            </div>
          </div>

          {/* Row 2: Sales Overview Interactive Chart */}
          <div className="row mb-4">
            <div className="col-12">
              <SalesOverviewChart />
            </div>
          </div>

          {/* Row 3: Top Products List */}
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="mb-0 fs-5 fw-bold">Top Metering Products</h2>
                  </div>

                  <div className="list-group list-group-flush">
                    <div className="list-group-item p-3 d-flex align-items-center">
                      <div className="me-3">
                        <img
                          src={p1}
                          alt="Gaming Joy Stick"
                          className="rounded"
                          style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-0 fw-bold">Gaming Joy Stick / Meter Controller</h6>
                            <small className="text-secondary">156 units tested</small>
                          </div>
                          <div className="text-end">
                            <strong className="fs-6">$3,120</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="list-group-item p-3 d-flex align-items-center">
                      <div className="me-3">
                        <img
                          src={p2}
                          alt="Wireless Headphones"
                          className="rounded"
                          style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-0 fw-bold">Wireless Sensors</h6>
                            <small className="text-secondary">134 units tested</small>
                          </div>
                          <div className="text-end">
                            <strong className="fs-6">$2,680</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="list-group-item p-3 d-flex align-items-center">
                      <div className="me-3">
                        <img
                          src={p3}
                          alt="Smartwatch"
                          className="rounded"
                          style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-0 fw-bold">Smart Meter Board Pro</h6>
                            <small className="text-secondary">98 units tested</small>
                          </div>
                          <div className="text-end">
                            <strong className="fs-6">$1,960</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Reports;
