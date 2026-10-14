import React from 'react';
import { NavLink } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4">
      <div className="text-center" style={{ maxWidth: '500px' }}>
        <h1 className="display-1 fw-bold text-primary mb-0">404</h1>
        <h2 className="h4 fw-bold text-dark mb-3">Page Not Found</h2>
        <p className="text-muted mb-4">
          The requested page could not be found or you do not have permission to view it.
        </p>
        <NavLink to="/dashboard" className="btn btn-primary px-4 py-2 fw-medium">
          <i className="ti ti-home me-2"></i>Back to Dashboard
        </NavLink>
      </div>
    </div>
  );
};

export default NotFound;
