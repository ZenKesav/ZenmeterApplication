import React from 'react';

const Docs = () => {
  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <div>
              <h1 className="fs-3 mb-1 fw-bold">Documentation</h1>
              <p className="text-secondary mb-0">
                Guide through setup, hardware stages, and API usage of the Zenmeter Application.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm p-4">
            <div className="mb-4">
              <h2 className="h5 mb-2 fw-bold text-dark">Prerequisites</h2>
              <p className="text-muted">Before starting, ensure the following tools are installed:</p>
              <ul className="list-group list-group-flush">
                <li className="list-group-item ps-0">Node.js (v18 or higher recommended)</li>
                <li className="list-group-item ps-0">PostgreSQL (or SQLite fallback)</li>
                <li className="list-group-item ps-0">Modern Web Browser</li>
              </ul>
            </div>

            <div className="mb-4">
              <h2 className="h5 mb-2 fw-bold text-dark">Execution Commands</h2>
              <p className="text-muted">To launch the Frontend and Backend servers:</p>
              <pre className="bg-light border rounded p-3"><code>npm run dev</code></pre>
            </div>

            <div className="mb-2">
              <h2 className="h5 mb-2 fw-bold text-dark">Project Structure</h2>
              <pre className="bg-dark text-light p-4 rounded overflow-auto" style={{ fontSize: '0.9rem' }}>
                <code>
{`Frontend/
├── src/
│   ├── assets/           # Logos, product & avatar images
│   ├── components/       # Cards, Charts, Tables, Sidebar, Topbar, Footer
│   ├── app/              # Auth store & routes
│   ├── layouts/          # MainLayout & AuthLayout
│   ├── pages/            # Dashboard, Production, QC, Reports, Users, Roles, Settings, Docs, Login
│   ├── services/         # REST API & WebSocket clients
│   └── styles/           # Tabler icons & main SCSS/CSS styles`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Docs;
