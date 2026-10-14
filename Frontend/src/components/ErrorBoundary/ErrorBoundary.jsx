import React from 'react';
import { useLocation } from 'react-router-dom';

class ErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Render Error:', error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && (prevProps.location?.pathname !== this.props.location?.pathname || prevProps.location?.key !== this.props.location?.key)) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4">
          <div className="card shadow-sm border-0 rounded-4 text-center p-4" style={{ maxWidth: '500px' }}>
            <div className="mb-3 text-warning">
              <i className="ti ti-alert-triangle fs-1"></i>
            </div>
            <h4 className="fw-bold text-dark mb-2">Page View Refresh Required</h4>
            <p className="text-secondary small mb-3">
              {this.state.error?.message || 'An unexpected display issue occurred while rendering this page.'}
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button
                className="btn btn-outline-primary px-4 py-2 fw-semibold rounded-3"
                onClick={this.handleReset}
              >
                <i className="ti ti-refresh me-1"></i> Try Again
              </button>
              <button
                className="btn btn-primary px-4 py-2 fw-semibold rounded-3"
                onClick={() => {
                  this.handleReset();
                  window.location.reload();
                }}
              >
                <i className="ti ti-reload me-1"></i> Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ErrorBoundary({ children }) {
  const location = useLocation();
  return <ErrorBoundaryInner location={location}>{children}</ErrorBoundaryInner>;
}
