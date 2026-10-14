import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';

const initialThisYear = [42000, 53000, 48000, 61000, 72000, 69000, 74000, 82000, 78000, 86000, 91000, 97000];
const initialLastYear = [38000, 45000, 47000, 56000, 65000, 63000, 68000, 70000, 69000, 75000, 80000, 84000];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatCurrency = (val) => {
  if (val == null) return '-';
  const n = Number(val);
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

const SalesOverviewChart = () => {
  const [thisYearData, setThisYearData] = useState(initialThisYear);
  const [lastYearData, setLastYearData] = useState(initialLastYear);
  const [showingBoth, setShowingBoth] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleRandomize = () => {
    const rand = () => Math.round((Math.random() * 80 + 20) * 1000);
    setThisYearData(Array.from({ length: 12 }, rand));
    setLastYearData(Array.from({ length: 12 }, rand));
  };

  const handleToggleComparison = () => {
    setShowingBoth(prev => !prev);
  };

  const options = {
    chart: {
      type: 'area',
      height: 420,
      zoom: { enabled: false },
      toolbar: { show: false },
    },
    colors: ['#E66239', '#198754'],
    stroke: { width: [3, 2.5], curve: 'smooth' },
    markers: { size: 4, hover: { sizeOffset: 2 } },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 60, 100],
      },
    },
    yaxis: {
      labels: { formatter: (val) => formatCurrency(val) },
      title: { text: 'Sales (INR)' },
    },
    xaxis: {
      categories: months,
      tickPlacement: 'on',
    },
    tooltip: {
      shared: true,
      y: {
        formatter: (val) => formatCurrency(val),
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: { height: 340 },
          legend: { position: 'bottom', horizontalAlign: 'center' },
        },
      },
    ],
  };

  const series = showingBoth
    ? [
        { name: 'This Year', data: thisYearData },
        { name: 'Last Year', data: lastYearData },
      ]
    : [{ name: 'This Year', data: thisYearData }];

  return (
    <div className="card">
      <div className="card-body p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-3 gap-2">
          <div>
            <h2 className="mb-0 fs-5 fw-bold">Sales Overview</h2>
          </div>
          <div className="controls d-flex gap-2">
            <button className="btn btn-light btn-sm fw-medium border" onClick={handleRandomize}>
              Randomize Data
            </button>
            <button className="btn btn-primary btn-sm fw-medium" onClick={handleToggleComparison}>
              {showingBoth ? 'Show This Year Only' : 'Show Comparison'}
            </button>
          </div>
        </div>

        {isMounted && (
          <Chart options={options} series={series} type="area" height={420} />
        )}

        <div className="d-flex justify-content-end mt-2">
          <a href="#!" className="small text-primary text-decoration-none fw-medium">
            View detailed report
          </a>
        </div>
      </div>
    </div>
  );
};

export default SalesOverviewChart;
