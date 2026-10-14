# Zenmeter Backend API Engine

Enterprise Node.js Backend Service for Zenmeter R&D Test Development Application.

## Project Structure

```
backend/
├── package.json
├── .env
├── .env.example
├── README.md
├── Dockerfile
└── src/
    ├── app.js                   # Express application setup
    ├── server.js                # Server entrypoint & WebSocket initialization
    ├── config/                  # Environment & service configurations
    ├── middleware/              # Auth, validation, permission & error middleware
    ├── common/                  # Constants, custom errors, response helpers
    ├── database/                # Connection pool, schemas & seeders
    ├── auth/                    # Authentication module
    ├── users/                   # User management module
    ├── roles/                   # Role management module
    ├── permissions/             # Permission management module
    ├── meters/                  # Meter master & traceability module
    ├── production/              # Production operations module
    ├── assignments/             # Stage/operator assignments module
    ├── qc/                      # Quality Control operations module
    ├── dashboard/               # Live dashboard & analytics module
    ├── reports/                 # Production reporting module
    ├── cache/                   # Redis/caching layer
    ├── realtime/                # WebSocket & event publishers
    ├── hardware/                # Hardware drivers & Jig communication
    ├── engine/                  # Stage, test & workflow engines
    ├── stages/                  # Application-controlled stage implementations (Stages 01 - 11)
    └── audit/                   # Audit trail logging module
```

## Running the Backend

```bash
# Install dependencies
npm install

# Run seed database script
npm run seed

# Start in development mode
npm run dev
```
