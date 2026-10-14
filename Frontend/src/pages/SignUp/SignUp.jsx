import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import zenmeterLogo from '../../assets/images/zenmeter_logo.png';
import zenmeterBackgroungImages from '../../assets/images/zenmeter-solutions-pvt-ltd-electronic-city-phase-2-bangalore-digital-meter-manufacturers-Du3h8sS3fl.avif';
import officeImg from '../../assets/images/zenmeter_img.jpg';
import { PasswordRequirements, validatePasswordCriteria } from '../../components/CommonComponents';

const SignUp = () => {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [role, setRole] = useState('OPERATOR');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!employeeId || !password || !name) {
      setError('Please fill in all required fields.');
      return;
    }
    const pwdRes = validatePasswordCriteria(password);
    if (!pwdRes.isValid) {
      setError(pwdRes.message);
      return;
    }
    navigate('/login');
  };

  return (
    <div className="position-relative min-vh-100 w-100 d-flex align-items-center justify-content-center p-3 p-sm-4 overflow-hidden m-0">
      <img
        src={zenmeterBackgroungImages}
        alt="Zenmeter Background"
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ objectFit: 'cover', objectPosition: 'center', zIndex: 0 }}
      />
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          backgroundColor: 'rgba(239, 244, 255, 0.35)',
          backdropFilter: 'blur(6px)',
          zIndex: 1,
        }}
      ></div>

      <div
        className="card shadow-lg border-0 overflow-hidden rounded-4 position-relative"
        style={{ maxWidth: '960px', width: '100%', zIndex: 2 }}
      >
        <div className="row g-0">
          <div className="col-lg-6 d-none d-lg-block position-relative bg-dark">
            <img
              src={officeImg}
              alt="Zenmeter Office Workspace"
              className="w-100 h-100 position-absolute top-0 start-0"
              style={{ objectFit: 'cover', opacity: 0.85 }}
            />
          </div>

          <div className="col-lg-6 col-12 p-4 p-md-5 bg-white">
            <div className="mb-4 text-center">
              <NavLink to="/login" className="d-inline-flex align-items-center justify-content-center mb-3 text-decoration-none">
                <img src={zenmeterLogo} alt="Zenmeter Logo" style={{ height: '60px', width: 'auto' }} />
              </NavLink>
              <h1 className="h4 fw-bold mb-1 text-dark">Create Employee Account</h1>
              <p className="text-secondary small mb-0">Register for access to Zenmeter Portal</p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="alert alert-danger py-2 px-3 small text-center rounded-3 mb-3" role="alert">
                  <i className="ti ti-alert-circle me-1"></i> {error}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-medium text-dark small">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium text-dark small">Employee ID</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. EMP006"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium text-dark small">Role</label>
                <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="OPERATOR">Operator</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="QC">QC Inspector</option>
                  <option value="REPORT_VIEWER">Report Viewer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label fw-medium text-dark small">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  maxLength={12}
                  value={password}
                  onFocus={() => setPasswordTouched(true)}
                  onChange={(e) => {
                    setPassword(e.target.value.slice(0, 12));
                    setPasswordTouched(true);
                  }}
                  required
                />
                <PasswordRequirements password={password} isTouched={passwordTouched || password.length > 0} />
              </div>

              <button className="btn btn-primary w-100 py-2.5 fw-semibold" type="submit">
                Register Account
              </button>
            </form>

            <div className="text-center mt-3 small text-muted">
              Already registered?{' '}
              <NavLink to="/login" className="link-primary fw-semibold text-decoration-none">
                Sign In
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
