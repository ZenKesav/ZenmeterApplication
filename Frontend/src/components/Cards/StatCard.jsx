import React from 'react';

const StatCard = ({ title, value, changeText, variant = 'primary', icon = 'ti-report-analytics' }) => {
  return (
    <div className={`card p-4 bg-white shadow-sm border border-light-subtle rounded-3 h-100`}>
      <div className="d-flex gap-3 align-items-center">
        <div className={`icon-shape icon-md bg-${variant} text-white rounded-3 d-flex align-items-center justify-content-center flex-shrink-0`} style={{ width: '48px', height: '48px' }}>
          <i className={`${icon} fs-4`}></i>
        </div>
        <div>
          <h2 className="mb-1 fs-6 text-muted fw-semibold">{title}</h2>
          <h3 className="fw-bold mb-0 fs-3 text-dark">{value}</h3>
          <p className={`text-${variant} mb-0 small fw-medium mt-1`}>{changeText}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
