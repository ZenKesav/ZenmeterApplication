import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';

const SalesPurchaseChart = () => {
  const [timeRange, setTimeRange] = useState('This Year');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const options = {
    colors: ['#E66239', '#f7a085'],
    chart: {
      type: 'bar',
      height: 350,
      width: '100%',
      toolbar: {
        show: false,
      },
    },
    grid: {
      show: true,
      borderColor: '#e2e8f0',
    },
    legend: {
      show: true,
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 500,
      position: 'top',
      horizontalAlign: 'right',
      markers: {
        size: 5,
        shape: 'square',
        strokeWidth: 0,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '45%',
        borderRadius: 3,
        borderRadiusApplication: 'end',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: false,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: ['28 Jan', '29 Jan', '30 Jan', '31 Jan', '1 Feb', '2 Feb', '3 Feb', '4 Feb', '5 Feb'],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => `${val}k`,
      },
      title: {
        text: '$ (thousands)',
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val) => `$ ${val} thousands`,
      },
    },
  };

  const series = [
    {
      name: 'Sales',
      data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
    },
    {
      name: 'Purchase',
      data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
    },
  ];

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center bg-transparent px-4 py-3">
        <h3 className="h5 mb-0 fw-bold">Sales vs Purchase</h3>
        <div>
          <select
            className="form-select form-select-sm"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="This Year">This Year</option>
            <option value="This Month">This Month</option>
            <option value="This Week">This Week</option>
          </select>
        </div>
      </div>
      <div className="card-body p-4">
        {isMounted && <Chart options={options} series={series} type="bar" height={350} />}
      </div>
    </div>
  );
};

export default SalesPurchaseChart;
