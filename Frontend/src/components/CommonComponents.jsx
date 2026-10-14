import React from 'react';

export function Button({ children, variant = 'primary', className = '', loading = false, disabled = false, ...props }) {
  const btnVariants = {
    primary: 'btn-primary',
    secondary: 'btn-outline-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
    warning: 'btn-warning'
  };

  return (
    <button
      className={`btn ${btnVariants[variant] || 'btn-primary'} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="d-flex align-items-center justify-content-center gap-2">
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="mb-3 w-100">
      {label && <label className="form-label fw-semibold text-dark small">{label}</label>}
      <input
        className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
        {...props}
      />
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, size = 'default', children }) {
  if (!isOpen) return null;

  const sizeClass = size === 'xl' ? 'modal-xl' : size === 'lg' ? 'modal-lg' : size === 'sm' ? 'modal-sm' : '';

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1060 }}>
      <div className={`modal-dialog modal-dialog-centered ${sizeClass}`}>
        <div className="modal-content shadow-lg border-0 rounded-3">
          <div className="modal-header border-bottom px-4 py-3 bg-white">
            <h5 className="modal-title fw-bold text-dark">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinner({ text = 'Loading data...' }) {
  return (
    <div className="p-5 text-center my-4">
      <div className="spinner-border text-primary" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 text-muted fw-medium small mb-0">{text}</p>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 5 }) {
  return (
    <div className="card shadow-sm border-0">
      <div className="table-responsive">
        <table className="table mb-0 align-middle">
          <thead className="table-light">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i}>
                  <div className="placeholder-glow">
                    <span className="placeholder col-6 py-2 rounded"></span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: columns }).map((_, c) => (
                  <td key={c}>
                    <div className="placeholder-glow">
                      <span className={`placeholder col-${(c % 3 === 0 ? 8 : (c % 2 === 0 ? 10 : 6))} py-2 rounded bg-secondary-subtle`}></span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SkeletonCard({ height = '180px' }) {
  return (
    <div className="card shadow-sm border-0 p-4" style={{ minHeight: height }}>
      <div className="placeholder-glow space-y-3">
        <span className="placeholder col-4 py-2 rounded mb-3 d-block"></span>
        <span className="placeholder col-8 py-3 rounded mb-2 d-block bg-secondary-subtle"></span>
        <span className="placeholder col-6 py-2 rounded d-block"></span>
      </div>
    </div>
  );
}

export function SkeletonChart({ height = '350px' }) {
  return (
    <div className="card shadow-sm border-0 p-4">
      <div className="placeholder-glow d-flex justify-content-between mb-4">
        <span className="placeholder col-4 py-2 rounded"></span>
        <span className="placeholder col-2 py-2 rounded"></span>
      </div>
      <div className="d-flex align-items-end justify-content-between gap-2" style={{ height: height }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="placeholder-glow flex-fill">
            <span
              className="placeholder w-100 rounded bg-secondary-subtle"
              style={{ height: `${Math.floor(Math.random() * 60 + 30)}%` }}
            ></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Pagination({ currentPage = 1, totalItems = 0, pageSize = 10, onPageChange, onPageSizeChange }) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pt-3 px-3 pb-2 border-top bg-white rounded-bottom">
      <div className="d-flex align-items-center gap-2 small text-secondary">
        <span>Showing <strong>{startItem}</strong> - <strong>{endItem}</strong> of <strong>{totalItems}</strong> entries</span>
        {onPageSizeChange && (
          <select
            className="form-select form-select-sm ms-2 pagination-select"
            style={{ width: 'auto' }}
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        )}
      </div>

      <nav aria-label="Table navigation">
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-item link-secondary page-link"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className="ti ti-chevron-left me-1"></i> Prev
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
            <li key={pg} className={`page-item ${currentPage === pg ? 'active' : ''}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(pg)}
              >
                {pg}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-item link-secondary page-link"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next <i className="ti ti-chevron-right ms-1"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export function TestResultBadge({ result }) {
  if (result === 'PASS') {
    return (
      <div className="p-3 bg-success-subtle border border-success text-success rounded-3 text-center space-y-1">
        <span className="fs-3 fw-bold tracking-wider d-block">PASS</span>
        <small className="d-block text-success fw-medium">All hardware & threshold criteria satisfied</small>
      </div>
    );
  }
  if (result === 'HOLD') {
    return (
      <div className="p-3 bg-warning-subtle border border-warning text-warning-emphasis rounded-3 text-center space-y-1">
        <span className="fs-3 fw-bold tracking-wider d-block">HOLD</span>
        <small className="d-block text-warning-emphasis fw-medium">Supervisor / Engineering review required</small>
      </div>
    );
  }
  return (
    <div className="p-3 bg-danger-subtle border border-danger text-danger rounded-3 text-center space-y-1">
      <span className="fs-3 fw-bold tracking-wider d-block">FAIL</span>
      <small className="d-block text-danger fw-medium">Hardware test parameter out of tolerance</small>
    </div>
  );
}

export function validatePasswordCriteria(password) {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (password.length > 12) {
    return { isValid: false, message: 'Password must not exceed 12 characters.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 numeric digit (0-9).' };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 special character (e.g. @, #, $, %, !).' };
  }
  return { isValid: true, message: '' };
}

export function PasswordRequirements({ password = '', isTouched = false }) {
  if (!isTouched && !password) return null;

  const pwd = String(password || '');
  const rules = [
    { label: '8 - 12 Characters', valid: pwd.length >= 8 && pwd.length <= 12 },
    { label: '1 Uppercase (A-Z)', valid: /[A-Z]/.test(pwd) },
    { label: '1 Lowercase (a-z)', valid: /[a-z]/.test(pwd) },
    { label: '1 Numeric digit (0-9)', valid: /[0-9]/.test(pwd) },
    { label: '1 Special char (@#$%)', valid: /[^A-Za-z0-9]/.test(pwd) }
  ];

  const allValid = rules.every(r => r.valid);

  return (
    <div
      className={`mt-2 p-2.5 rounded-3 border transition-all ${
        allValid ? 'bg-success-subtle border-success-subtle text-success' : 'bg-light border-secondary-subtle'
      }`}
      style={{ fontSize: '0.78rem' }}
    >
      <div className="d-flex align-items-center justify-content-between mb-2 pb-1 border-bottom border-light-subtle">
        <span className="fw-semibold text-dark d-flex align-items-center" style={{ fontSize: '0.78rem' }}>
          <i className="ti ti-shield-lock me-1.5 text-primary fs-6"></i>Password Requirements:
        </span>
        <span
          className={`badge font-mono px-2 py-0.5 ${
            pwd.length >= 8 && pwd.length <= 12
              ? 'bg-success text-white'
              : pwd.length > 12
              ? 'bg-danger text-white'
              : 'bg-secondary text-white'
          }`}
          style={{ fontSize: '0.7rem' }}
        >
          {pwd.length}/12 Chars
        </span>
      </div>
      <div className="row g-1.5">
        {rules.map((rule, idx) => (
          <div key={idx} className="col-6 d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
            {rule.valid ? (
              <i className="ti ti-check text-success fw-bold me-1"></i>
            ) : (
              <i className="ti ti-x text-danger fw-bold me-1"></i>
            )}
            <span className={rule.valid ? 'text-success fw-semibold' : 'text-muted'}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

