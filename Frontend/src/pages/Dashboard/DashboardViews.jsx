import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productionService, assignmentService, qcService, reportService, operatorService } from '../../services/apiServices';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { LoadingSpinner } from '../../components/CommonComponents';
import StatCard from '../../components/Cards/StatCard';
import LowStockCard from '../../components/Cards/LowStockCard';
import TopProductsCard from '../../components/Cards/TopProductsCard';
import RecentSalesCard from '../../components/Cards/RecentSalesCard';
import SalesPurchaseChart from '../../components/Charts/SalesPurchaseChart';
import CustomerOverviewChart from '../../components/Charts/CustomerOverviewChart';
import { OperatorTrendChart, OperatorStageDistributionChart } from '../../components/Charts/OperatorAnalyticsChart';
import { useAuth } from '../../app/store';

export function AdminDashboardView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { products } = useAuth();

  useEffect(() => {
    productionService.getOverview().then(res => {
      setData(res);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner text="Fetching production line metrics..." />;

  const stats = data?.stats || {};

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="fs-3 mb-0 fw-bold">Dashboard</h1>
            </div>
            <Link to="/settings" className="btn btn-outline-primary btn-sm">
              <i className="ti ti-settings me-1"></i> System Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Row 1: KPI Stat Cards */}
      <div className="row g-3 mb-3">
        <div className="col-lg-3 col-sm-6 col-12">
          <StatCard
            title="Total Meters"
            value={stats.totalMeters || 0}
            changeText={`${stats.inProduction || 0} currently in production`}
            variant="primary"
            icon="ti ti-cpu"
          />
        </div>
        <div className="col-lg-3 col-sm-6 col-12">
          <StatCard
            title="First Pass Yield"
            value={`${stats.yieldPercentage || 100}%`}
            changeText="Target limit ≥ 98.5%"
            variant="success"
            icon="ti ti-chart-line"
          />
        </div>
        <div className="col-lg-3 col-sm-6 col-12">
          <StatCard
            title="Passed / Completed"
            value={stats.passed || 0}
            changeText="Ready for packaging / dispatch"
            variant="info"
            icon="ti ti-check"
          />
        </div>
        <div className="col-lg-3 col-sm-6 col-12">
          <StatCard
            title="Rejected / Hold"
            value={(stats.failed || 0) + (stats.hold || 0) + (stats.rejected || 0)}
            changeText={`${stats.rejected || 0} rejected • ${stats.hold || 0} on hold`}
            variant="warning"
            icon="ti ti-alert-triangle"
          />
        </div>
      </div>

      {/* Row 2: Secondary Stat Cards */}
      <div className="row g-3 mb-3">
        <div className="col-lg-4 col-12">
          <div className="card h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between border-bottom pb-4 mb-3">
                <div>
                  <h3 className="fw-bold h4 mb-0">$25,458</h3>
                  <span className="text-secondary small">Total Profit</span>
                </div>
                <div>
                  <i className="ti ti-layers-subtract fs-1 text-primary"></i>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center small">
                <div className="text-muted">
                  <span className="text-success fw-bold me-1">+35%</span> vs Last Month
                </div>
                <div>
                  <Link to="/reports" className="link-primary text-decoration-underline fw-medium">View</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-12">
          <div className="card h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between border-bottom pb-4 mb-3">
                <div>
                  <h3 className="fw-bold h4 mb-0">$45,458</h3>
                  <span className="text-secondary small">Total Payment Returns</span>
                </div>
                <div>
                  <i className="ti ti-credit-card fs-1 text-danger"></i>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center small">
                <div className="text-muted">
                  <span className="text-danger fw-bold me-1">-20%</span> vs Last Month
                </div>
                <div>
                  <Link to="/reports" className="link-primary text-decoration-underline fw-medium">View</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-12">
          <div className="card h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between border-bottom pb-4 mb-3">
                <div>
                  <h3 className="fw-bold h4 mb-0">$34,458</h3>
                  <span className="text-secondary small">Total Expenses</span>
                </div>
                <div>
                  <i className="ti ti-cash-banknote fs-1 text-warning"></i>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center small">
                <div className="text-muted">
                  <span className="text-warning fw-bold me-1">-20%</span> vs Last Month
                </div>
                <div>
                  <Link to="/reports" className="link-primary text-decoration-underline fw-medium">View</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Main Charts */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-6">
          <SalesPurchaseChart />
        </div>
        <div className="col-12 col-lg-6">
          <CustomerOverviewChart />
        </div>
      </div>

      {/* Row 4: Recent Execution Stream */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="card shadow-sm border">
            <div className="card-header bg-white d-flex justify-content-between align-items-center px-4 py-3">
              <h4 className="mb-0 h5 fw-bold">Live Production Stage Execution Stream</h4>
              <Link to="/production" className="small text-primary text-decoration-underline fw-medium">View All Meters</Link>
            </div>
            <div className="table-responsive">
              <table className="table mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Meter No</th>
                    <th>Stage Name</th>
                    <th>Result Status</th>
                    <th>Operator ID</th>
                    <th>Execution Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentExecutions?.map((e) => (
                    <tr key={e.id}>
                      <td className="fw-bold text-primary">{e.meter_no}</td>
                      <td>{e.stage_name}</td>
                      <td><StatusBadge status={e.status} /></td>
                      <td className="text-muted">{e.operator_id}</td>
                      <td className="text-secondary small">{new Date(e.created_at).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                  {(!data?.recentExecutions || data.recentExecutions.length === 0) && (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        <i className="ti ti-folder-off fs-4 d-block mb-1 text-secondary opacity-50"></i>
                        <span className="fw-semibold">Data not found</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Row 5: Product Widgets */}
      <div className="row g-3">
        <div className="col-lg-4">
          <TopProductsCard products={products} />
        </div>
        <div className="col-lg-4">
          <LowStockCard products={products} />
        </div>
        <div className="col-lg-4">
          <RecentSalesCard />
        </div>
      </div>
    </>
  );
}

export function SupervisorDashboardView() {
  const [data, setData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productionService.getOverview(),
      assignmentService.getAssignments()
    ]).then(([prod, assign]) => {
      setData(prod);
      setAssignments(assign.assignments || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner text="Loading Supervisor Controls..." />;

  return (
    <>
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="fs-3 mb-0 fw-bold">Supervisor Dashboard</h1>
          </div>
          <Link to="/assignments" className="btn btn-primary btn-sm">
            <i className="ti ti-sliders me-1"></i> Assign Stage to Operator
          </Link>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-8 col-12">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white px-4 py-3">
              <h4 className="mb-0 h5 fw-bold">Active Operator Assignments</h4>
            </div>
            <div className="table-responsive">
              <table className="table mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Operator</th>
                    <th>Stage</th>
                    <th>Station ID</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map(a => (
                    <tr key={a.id}>
                      <td className="fw-bold">{a.operator_name || a.employee_id}</td>
                      <td className="text-primary">{a.stage_name}</td>
                      <td>{a.station_id}</td>
                      <td><StatusBadge status={a.status} /></td>
                    </tr>
                  ))}
                  {assignments.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        <i className="ti ti-folder-off fs-4 d-block mb-1 text-secondary opacity-50"></i>
                        <span className="fw-semibold">Data not found</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-12">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white px-4 py-3">
              <h4 className="mb-0 h5 fw-bold">Line Action Alerts</h4>
            </div>
            <div className="card-body p-3">
              <div className="alert alert-warning mb-3">
                <strong className="d-block mb-1">Stage 6 Bottleneck Alert</strong>
                <small>2 meters pending calibration hardware jig clearance</small>
              </div>
              <div className="alert alert-info mb-0">
                <strong className="d-block mb-1">Yield Status OK</strong>
                <small>Line yield currently operating at {data?.stats?.yieldPercentage || 100}%</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function OperatorDashboardView() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [timeframe, setTimeframe] = useState('day'); // 'shift', 'day', 'week', 'month', 'year'
  const [selectedShift, setSelectedShift] = useState('ALL');
  const [selectedOperator, setSelectedOperator] = useState(user?.employee_id || 'ALL');
  const [selectedStage, setSelectedStage] = useState(user?.stage_id ? String(user.stage_id) : 'ALL');

  // Load Assignments & Auto-Select Assigned Stage
  useEffect(() => {
    assignmentService.getAssignments()
      .then(res => {
        const list = res.assignments || res.data || [];
        setAssignments(list);
        if (list.length > 0 && list[0].stage_id) {
          setSelectedStage(String(list[0].stage_id));
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Fetch Operator Analytics when filters change
  useEffect(() => {
    operatorService.getAnalytics({
      employee_id: selectedOperator,
      timeframe,
      shift_name: selectedShift,
      stage_id: selectedStage
    })
      .then(res => {
        const payload = res?.data || res;
        setAnalytics(payload);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch operator analytics:', err);
        setLoading(false);
      });
  }, [timeframe, selectedShift, selectedOperator, selectedStage]);

  if (loading) return <LoadingSpinner text="Loading Operator Workstation & Analytics..." />;

  const summary = analytics?.summary || {};
  const opInfo = analytics?.operator || {};
  const currentShift = opInfo?.currentShift || {};

  return (
    <>
      {/* 1. Header & Controls */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 bg-white p-4 rounded-3 shadow-sm border">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h1 className="fs-3 mb-0 fw-bold">Operator Workstation & Analytics</h1>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 font-mono text-xs">
                  {user?.employee_id || opInfo.employee_id || 'OPERATOR'}
                </span>
              </div>
              <p className="text-secondary mb-0 small">
                Operator: <strong className="text-dark me-2">{user?.name || opInfo.name || 'Operator'}</strong> &bull;
                Active Shift: <span className="badge bg-light text-primary border ms-1">{currentShift.shift_name || 'General Shift'} ({currentShift.shift_time || '09:00 AM - 06:00 PM'})</span>
              </p>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2">
              <Link to="/stages/execute" className="btn btn-primary btn-sm">
                <i className="ti ti-tools me-1"></i> Launch Test Execution
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Timeframe & Filter Toolbar for Data Analysts */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 bg-light rounded-3">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <i className="ti ti-filter text-primary fs-5"></i>
            <span className="fw-bold text-dark small me-2">Analytics Filters:</span>

            {/* Timeframe Selector Buttons */}
            <div className="btn-group btn-group-sm" role="group">
              {[
                { key: 'shift', label: 'Shift-wise' },
                { key: 'day', label: 'Day' },
                { key: 'week', label: 'Week' },
                { key: 'month', label: 'Month' },
                { key: 'year', label: 'Year' }
              ].map(t => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTimeframe(t.key)}
                  className={`btn ${timeframe === t.key ? 'btn-primary fw-bold' : 'btn-outline-secondary bg-white'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            {/* Assigned Stage Display (Read-Only) */}
            <div className="d-flex align-items-center gap-1">
              <span className="small text-secondary fw-medium">Stage:</span>
              <span className="badge bg-primary text-white border border-primary px-2.5 py-1.5 fw-bold text-xs d-flex align-items-center gap-1 shadow-sm">
                <i className="ti ti-cpu text-white fs-6"></i>
                {user?.assigned_stage || (user?.stage_id ? `Stage ${user.stage_id}` : (selectedStage !== 'ALL' ? `Stage ${selectedStage}` : 'All Stages'))}
              </span>
            </div>

            {/* Shift Filter Dropdown */}
            <div className="d-flex align-items-center gap-1">
              <span className="small text-secondary fw-medium">Shift:</span>
              <select
                className="form-select form-select-sm bg-white"
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                style={{ minWidth: '140px' }}
              >
                <option value="ALL">All Shifts</option>
                {analytics?.availableShifts?.map(s => (
                  <option key={s.id} value={s.shift_name}>{s.shift_name}</option>
                ))}
              </select>
            </div>

            {/* Logged-In Operator Display (Read-Only) */}
            <div className="d-flex align-items-center gap-1">
              <span className="small text-secondary fw-medium">Operator:</span>
              <span className="badge bg-white text-dark border px-2 py-1.5 fw-bold font-mono text-xs d-flex align-items-center gap-1 shadow-sm">
                <i className="ti ti-user-check text-primary fs-6"></i>
                {user?.employee_id || opInfo.employee_id || 'OPERATOR'} ({user?.name || opInfo.name || 'Operator'})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. KPI Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-sm-6 col-12">
          <StatCard
            title="Total Work Done"
            value={summary.totalExecutions || 0}
            changeText={`Recorded across ${timeframe.toUpperCase()}`}
            variant="primary"
            icon="ti ti-assembly"
          />
        </div>
        <div className="col-lg-3 col-sm-6 col-12">
          <StatCard
            title="First Pass Yield (FPY)"
            value={`${summary.yieldPercentage || 100}%`}
            changeText="Target limit ≥ 98.5%"
            variant="success"
            icon="ti ti-chart-dots"
          />
        </div>
        <div className="col-lg-3 col-sm-6 col-12">
          <StatCard
            title="Passed vs Rejections"
            value={`${summary.passedCount || 0} Pass`}
            changeText={`${summary.failedCount || 0} Failed • ${summary.holdCount || 0} Hold`}
            variant="info"
            icon="ti ti-circle-check"
          />
        </div>
        <div className="col-lg-3 col-sm-6 col-12">
          <StatCard
            title="Avg Testing Cycle Time"
            value={`${summary.avgCycleTimeSec || 42} sec`}
            changeText={`${summary.distinctMeters || 0} distinct meters handled`}
            variant="warning"
            icon="ti ti-clock-check"
          />
        </div>
      </div>

      {/* 4. Analytics Charts Section */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-8">
          <OperatorTrendChart trendData={analytics?.trendData || []} timeframe={timeframe} />
        </div>
        <div className="col-12 col-lg-4">
          <OperatorStageDistributionChart stageBreakdown={analytics?.stageBreakdown || []} />
        </div>
      </div>

      {/* 5. Production Stage Work & Quality Performance Breakdown Table */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border">
            <div className="card-header bg-white px-4 py-3 d-flex justify-content-between align-items-center border-bottom">
              <div>
                <h4 className="mb-0 h5 fw-bold text-dark">Production Stage Work & Quality Analysis</h4>
                <small className="text-secondary">Stage-by-stage testing workload, pass/fail yields, and cycle times for selected timeframe</small>
              </div>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 font-mono">
                {timeframe.toUpperCase()} ANALYTICS
              </span>
            </div>
            <div className="table-responsive">
              <table className="table mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Stage</th>
                    <th>Stage Name</th>
                    <th>Line / Station</th>
                    <th>Work Completed</th>
                    <th>Passed Tests</th>
                    <th>Failed / Re-tests</th>
                    <th>Yield Rate (%)</th>
                    <th>Avg Cycle Time</th>
                    <th>Quality Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.stageBreakdown?.map(stg => (
                    <tr key={stg.stage_id}>
                      <td>
                        <span className="badge bg-primary text-white fw-bold px-2 py-1">
                          Stage {stg.stage_id}
                        </span>
                      </td>
                      <td className="fw-bold text-dark">{stg.stage_name}</td>
                      <td className="text-muted small">{stg.line_type || 'Main Assembly Line'}</td>
                      <td className="fw-bold text-primary">{stg.total} tests</td>
                      <td className="text-success fw-bold">{stg.passed}</td>
                      <td className="text-danger">{stg.failed}</td>
                      <td>
                        <span className={`badge ${stg.yieldPct >= 98 ? 'bg-success' : stg.yieldPct >= 95 ? 'bg-warning text-dark' : 'bg-danger'}`}>
                          {stg.yieldPct}%
                        </span>
                      </td>
                      <td className="font-mono text-muted small">{stg.avgCycleTimeSec}s</td>
                      <td>
                        <span className={`badge ${stg.status === 'EXCELLENT' ? 'bg-success-subtle text-success border border-success-subtle' : stg.status === 'GOOD' ? 'bg-info-subtle text-info border border-info-subtle' : 'bg-warning-subtle text-warning border border-warning-subtle'}`}>
                          {stg.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/stages/execute?stage=${stg.stage_id}`} className="btn btn-sm btn-outline-primary">
                          <i className="ti ti-playstation me-1"></i> Test
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {(!analytics?.stageBreakdown || analytics.stageBreakdown.length === 0) && (
                    <tr>
                      <td colSpan="10" className="text-center py-4 text-muted">No stage analysis records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Shift-Wise Operator Performance Analysis Table */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border">
            <div className="card-header bg-white px-4 py-3 d-flex justify-content-between align-items-center border-bottom">
              <div>
                <h4 className="mb-0 h5 fw-bold text-dark">Shift-Wise Operator Work Performance Analysis</h4>
                <small className="text-secondary">Comparing total tests, pass rate, and rejections across shift schedules</small>
              </div>
              <span className="badge bg-light text-dark border">
                <i className="ti ti-clock me-1 text-primary"></i>Active Shift: {currentShift.shift_name || 'General Shift'}
              </span>
            </div>
            <div className="table-responsive">
              <table className="table mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Shift Name</th>
                    <th>Schedule Time</th>
                    <th>Duration</th>
                    <th>Work Completed</th>
                    <th>Passed Tests</th>
                    <th>Failed / Re-tested</th>
                    <th>Yield Rate (%)</th>
                    <th>Shift Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.shiftBreakdown?.map(s => {
                    const isActive = s.shift_name === currentShift.shift_name;
                    return (
                      <tr key={s.shift_id} className={isActive ? 'table-primary-subtle fw-semibold' : ''}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <i className="ti ti-clock-play text-primary"></i>
                            <span className="fw-bold">{s.shift_name}</span>
                          </div>
                        </td>
                        <td className="font-mono text-muted small">{s.shift_time}</td>
                        <td>{s.duration_hours} hrs</td>
                        <td className="fw-bold text-primary">{s.total} tests</td>
                        <td className="text-success fw-bold">{s.passed}</td>
                        <td className="text-danger">{s.failed}</td>
                        <td>
                          <span className={`badge ${s.yieldPct >= 98 ? 'bg-success' : s.yieldPct >= 95 ? 'bg-warning text-dark' : 'bg-danger'}`}>
                            {s.yieldPct}%
                          </span>
                        </td>
                        <td>
                          {isActive ? (
                            <span className="badge bg-success-subtle text-success border border-success-subtle">
                              <i className="ti ti-circle-filled fs-6 me-1"></i> ACTIVE SHIFT
                            </span>
                          ) : (
                            <span className="badge bg-light text-secondary border">SCHEDULED</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {(!analytics?.shiftBreakdown || analytics.shiftBreakdown.length === 0) && (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted">No shift data found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Assigned Testing Stages */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="h5 fw-bold mb-0 text-dark">My Assigned Production Testing Stages</h4>
            <span className="badge bg-light text-secondary border">{assignments.length} Stages Assigned</span>
          </div>
          <div className="row g-3">
            {assignments.map(a => (
              <div key={a.id} className="col-lg-4 col-md-6 col-12">
                <div className="card shadow-sm border-start border-4 border-primary h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-light text-dark border">{a.station_id}</span>
                      <StatusBadge status={a.status} />
                    </div>
                    <h5 className="fw-bold mb-1">{a.stage_name}</h5>
                    <p className="text-muted small mb-3">Supervisor: {a.assigned_by}</p>
                    <Link to={`/stages/execute?stage=${a.stage_id}`} className="btn btn-primary btn-sm w-100">
                      <i className="ti ti-playstation me-1"></i> Start Testing Stage {a.stage_id}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {assignments.length === 0 && (
              <div className="col-12 text-center py-4 text-muted card shadow-sm">
                <i className="ti ti-info-circle fs-2 d-block mb-2 text-primary"></i>
                No testing stages currently assigned to your Employee ID. Contact your line supervisor.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 8. Live Test Execution History Log Stream */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border">
            <div className="card-header bg-white px-4 py-3 d-flex justify-content-between align-items-center border-bottom">
              <h4 className="mb-0 h5 fw-bold text-dark">Recent Stage Test Execution History Log</h4>
              <Link to="/production" className="small text-primary text-decoration-underline fw-medium">View All Production Logs</Link>
            </div>
            <div className="table-responsive">
              <table className="table mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Meter No</th>
                    <th>Stage Name</th>
                    <th>Result Status</th>
                    <th>Operator ID</th>
                    <th>Execution Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.recentExecutions?.map((e, idx) => (
                    <tr key={e.id || idx}>
                      <td className="fw-bold text-primary">{e.meter_no}</td>
                      <td>{e.stage_name}</td>
                      <td><StatusBadge status={e.status} /></td>
                      <td className="text-muted font-mono small">{e.operator_id}</td>
                      <td className="text-secondary small">
                        {e.created_at ? new Date(e.created_at).toLocaleString() : 'Just now'}
                      </td>
                    </tr>
                  ))}
                  {(!analytics?.recentExecutions || analytics.recentExecutions.length === 0) && (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        No execution records logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function QCDashboardView() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    qcService.getQCQueue().then(res => {
      setQueue(res.queue || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner text="Fetching Quality Control Queue..." />;

  return (
    <>
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="fs-3 mb-0 fw-bold">Quality Control Portal</h1>
          </div>
          <Link to="/qc" className="btn btn-success btn-sm">
            <i className="ti ti-shield-check me-1"></i> Inspect Pending Queue ({queue.length})
          </Link>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white px-4 py-3">
          <h4 className="mb-0 h5 fw-bold">Meters Pending Final QC Inspection</h4>
        </div>
        <div className="table-responsive">
          <table className="table mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Meter No</th>
                <th>Serial No</th>
                <th>Batch</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {queue.map(m => (
                <tr key={m.id}>
                  <td className="fw-bold text-primary">{m.meter_no}</td>
                  <td>{m.serial_no}</td>
                  <td>{m.batch_no}</td>
                  <td><StatusBadge status={m.status} /></td>
                  <td>
                    <Link to={`/qc?meter=${m.meter_no}`} className="btn btn-sm btn-outline-primary">
                      Inspect Traceability
                    </Link>
                  </td>
                </tr>
              ))}
              {queue.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    <i className="ti ti-folder-off fs-4 d-block mb-1 text-secondary opacity-50"></i>
                    <span className="fw-semibold">Data not found</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function ReportDashboardView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getReports({ type: 'daily' }).then(res => {
      setData(res.report);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner text="Generating Analytics Reports..." />;

  const summary = data?.summary || {};

  return (
    <>
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="fs-3 mb-0 fw-bold">Analytics & Yield Reports</h1>
          </div>
          <Link to="/reports" className="btn btn-outline-secondary btn-sm">
            View Full Reports
          </Link>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4 col-12">
          <StatCard
            title="Total Tested Stages"
            value={summary.totalTested || 0}
            changeText="Recorded across all lines"
            variant="primary"
            icon="ti ti-chart-bar"
          />
        </div>
        <div className="col-md-4 col-12">
          <StatCard
            title="First Pass Yield (FPY)"
            value={`${summary.firstPassYieldPct || 100}%`}
            changeText="Target Limit ≥ 98%"
            variant="success"
            icon="ti ti-check"
          />
        </div>
        <div className="col-md-4 col-12">
          <StatCard
            title="QC Rejection Count"
            value={summary.qcRejected || 0}
            changeText="Total flagged issues"
            variant="danger"
            icon="ti ti-alert-circle"
          />
        </div>
      </div>
    </>
  );
}
