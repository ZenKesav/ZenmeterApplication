import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';

export const OperatorTrendChart = ({ trendData = [], timeframe = 'day' }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const categories = trendData.map(t => t.label || t.time || '');
  const passedSeries = trendData.map(t => t.passed || 0);
  const failedSeries = trendData.map(t => t.failed || 0);
  const yieldSeries = trendData.map(t => t.yieldPct || 100);

  const getTimeframeTitle = () => {
    switch (timeframe) {
      case 'shift': return 'Hourly Test Execution Output (Active Shift)';
      case 'day': return 'Daily Hourly Test Execution Stream';
      case 'week': return 'Weekly Production Output Trend';
      case 'month': return 'Monthly Production Breakdown by Week';
      case 'year': return 'Yearly Historical Work Performance';
      default: return 'Production Output Trend';
    }
  };

  const options = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: ['#0d6efd', '#dc3545', '#198754'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
        borderRadius: 4,
        borderRadiusApplication: 'end'
      }
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { fontSize: '11px', fontFamily: 'Inter, sans-serif' }
      }
    },
    yaxis: [
      {
        title: { text: 'Test Executions (Units)', style: { color: '#495057', fontSize: '12px' } },
        labels: { formatter: (val) => Math.round(val) }
      }
    ],
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px'
    },
    grid: { borderColor: '#f1f1f1' },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val, { seriesIndex }) => {
          if (seriesIndex === 0) return `${val} passed tests`;
          if (seriesIndex === 1) return `${val} failed/rejected tests`;
          return `${val}% yield`;
        }
      }
    }
  };

  const series = [
    { name: 'Passed Stage Tests', data: passedSeries },
    { name: 'Failed / Hold Tests', data: failedSeries }
  ];

  return (
    <div className="card shadow-sm h-100 border-0">
      <div className="card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center border-bottom">
        <div>
          <h5 className="mb-0 fw-bold text-dark">{getTimeframeTitle()}</h5>
          <small className="text-secondary">Operator stage executions and quality yield rate</small>
        </div>
        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 uppercase font-mono text-xs">
          <i className="ti ti-chart-bar me-1"></i>{timeframe.toUpperCase()} ANALYTICS
        </span>
      </div>
      <div className="card-body p-4">
        {isMounted ? (
          <Chart options={options} series={series} type="bar" height={320} />
        ) : (
          <div className="text-center py-5 text-muted">Loading chart engine...</div>
        )}
      </div>
    </div>
  );
};

export const OperatorStageDistributionChart = ({ stageBreakdown = [] }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const isSingleStage = stageBreakdown.length === 1;
  const singleStage = isSingleStage ? stageBreakdown[0] : null;

  const labels = isSingleStage
    ? ['Passed Stage Tests', 'Failed / Re-tests', 'Hold / Pending Tests']
    : stageBreakdown.map(s => `Stage ${s.stage_id}`);

  const series = isSingleStage
    ? [singleStage?.passed || 0, singleStage?.failed || 0, singleStage?.hold || 0]
    : stageBreakdown.map(s => s.total || 0);

  const colors = isSingleStage
    ? ['#198754', '#dc3545', '#ffc107']
    : [
        '#0d6efd', '#6610f2', '#6f42c1', '#d63384', '#dc3545',
        '#fd7e14', '#ffc107', '#198754', '#20c997', '#0dcaf0', '#495057'
      ];

  const options = {
    chart: {
      type: 'donut',
      height: 320
    },
    labels,
    colors,
    legend: {
      position: 'bottom',
      fontFamily: 'Inter, sans-serif',
      fontSize: '11px',
      horizontalAlign: 'center'
    },
    dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(0)}%` },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: isSingleStage ? `Stage ${singleStage?.stage_id}` : 'Total Tests',
              formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0)
            }
          }
        }
      }
    },
    tooltip: {
      y: {
        formatter: (val, { seriesIndex }) => {
          if (isSingleStage) {
            return `${val} tests (${labels[seriesIndex]})`;
          }
          const stg = stageBreakdown[seriesIndex];
          return `${val} executions (${stg ? stg.stage_name : ''})`;
        }
      }
    }
  };

  return (
    <div className="card shadow-sm h-100 border-0">
      <div className="card-header bg-white py-3 px-4 border-bottom">
        <h5 className="mb-0 fw-bold text-dark">
          {isSingleStage ? `Stage ${singleStage?.stage_id} Quality Distribution` : 'Stage Work Distribution'}
        </h5>
        <small className="text-secondary">
          {isSingleStage ? `Quality breakdown for ${singleStage?.stage_name}` : 'Testing workload split by production stage'}
        </small>
      </div>
      <div className="card-body p-4 d-flex align-items-center justify-content-center">
        {isMounted ? (
          <Chart options={options} series={series} type="donut" height={320} width="100%" />
        ) : (
          <div className="text-center py-5 text-muted">Loading chart engine...</div>
        )}
      </div>
    </div>
  );
};
