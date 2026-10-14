import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';

const CustomerOverviewChart = () => {
  const [filter, setFilter] = useState('Last 6 Months');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const options = {
    chart: {
      height: 220,
      type: 'radialBar',
    },
    colors: ['#198754', '#ffc107'],
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            fontSize: '14px',
            color: '#637381',
          },
          value: {
            fontSize: '16px',
            fontWeight: 600,
            color: '#212b36',
          },
          total: {
            show: false,
          },
        },
        hollow: {
          margin: 3,
          size: '40%',
          background: 'transparent',
        },
        track: {
          show: true,
          background: '#f0f0f0',
          strokeWidth: '100%',
          opacity: 1,
          margin: 5,
        },
      },
    },
    stroke: {
      lineCap: 'round',
    },
    labels: ['First Time', 'Return'],
  };

  const series = [70, 45];

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center bg-transparent px-4 py-3">
        <h3 className="h5 mb-0 fw-bold">Overall Information</h3>
        <div>
          <select
            className="form-select form-select-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="Last 6 Months">Last 6 Months</option>
            <option value="This Month">This Month</option>
            <option value="This Week">This Week</option>
          </select>
        </div>
      </div>
      <div className="card-body p-4">
        <h3 className="h6 text-muted mb-3">Customers Overview</h3>
        <div className="row align-items-center">
          <div className="col-sm-6">
            {isMounted && <Chart options={options} series={series} type="radialBar" height={220} />}
          </div>
          <div className="col-sm-6">
            <div className="row">
              <div className="col-6 border-end">
                <div className="text-center">
                  <h2 className="mb-1 fw-bold fs-4">5.5K</h2>
                  <p className="text-success mb-2 small fw-medium">First Time</p>
                  <span className="badge bg-success">
                    <i className="ti ti-arrow-up-left me-1"></i>25%
                  </span>
                </div>
              </div>
              <div className="col-6">
                <div className="text-center">
                  <h2 className="mb-1 fw-bold fs-4">3.5K</h2>
                  <p className="text-warning mb-2 small fw-medium">Return</p>
                  <span className="badge bg-success badge-xs d-inline-flex align-items-center">
                    <i className="ti ti-arrow-up-left me-1"></i>21%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row text-center border-top mt-4 pt-4">
          <div className="col-4 border-end">
            <h3 className="fw-bold mb-1 fs-5">6,987</h3>
            <small className="text-secondary">Suppliers</small>
          </div>
          <div className="col-4 border-end">
            <h3 className="fw-bold mb-1 fs-5">4,896</h3>
            <small className="text-secondary">Customers</small>
          </div>
          <div className="col-4">
            <h3 className="fw-bold mb-1 fs-5">487</h3>
            <small className="text-secondary">Orders</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOverviewChart;
