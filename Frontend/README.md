# Zenmeter R&D Web Application Frontend

Modern React application for Zenmeter Smart Meter Production Line Management.

## Structure

```
src/
├── app/          # App root, routes, store & providers
├── assets/       # Global static assets (images, icons, fonts)
├── components/   # Reusable UI & Domain Components
├── constants/    # Application wide constants
├── hooks/        # Custom React Hooks
├── layouts/      # Application Layout Wrappers
├── pages/        # Router Page Views
├── services/     # API Clients & WebSocket Gateways
├── stages/       # Hardware & Jig Stage Execution Modules
├── styles/       # CSS Design System Tokens & Style Sheets
└── utils/        # Helper Functions & Utility Functions
```

## Running the Frontend

```bash
npm install
npm run dev
```

## Structure
Frontend/
├── package.json
├── vite.config.js
├── index.html
├── .env
├── .env.example
├── .gitignore
├── README.md
│
├── public/
│   ├── logo/
│   ├── icons/
│   └── images/
│
└── src/
    ├── app/                              # Core App entry, routes & store
    │   ├── App.jsx
    │   ├── routes.jsx
    │   ├── store.jsx / store.js
    │   ├── websocket.js
    │   └── ProtectedRoute.jsx
    │
    ├── assets/                           # Static assets
    │   ├── images/
    │   ├── icons/
    │   └── fonts/
    │
    ├── components/                       # Atomic & Domain components
    │   ├── Button/ (Button.jsx)
    │   ├── Input/ (Input.jsx)
    │   ├── Select/ (Select.jsx)
    │   ├── Checkbox/ (Checkbox.jsx)
    │   ├── Modal/ (Modal.jsx)
    │   ├── Table/ (Table.jsx, InventoryTable.jsx)
    │   ├── Pagination/ (Pagination.jsx)
    │   ├── Search/ (Search.jsx)
    │   ├── Filter/ (Filter.jsx)
    │   ├── DatePicker/ (DatePicker.jsx)
    │   ├── Dropdown/ (Dropdown.jsx)
    │   ├── Tabs/ (Tabs.jsx)
    │   ├── Card/ (StatCard, LowStockCard, RecentSalesCard, TopProductsCard)
    │   ├── StatusBadge/ (StatusBadge.jsx)
    │   ├── Loading/ (Loading.jsx)
    │   ├── ErrorMessage/ (ErrorMessage.jsx)
    │   ├── ConfirmationDialog/ (ConfirmationDialog.jsx)
    │   ├── Header/ (Header.jsx)
    │   ├── Sidebar/ (Sidebar.jsx)
    │   ├── Footer/ (Footer.jsx)
    │   ├── Breadcrumb/ (Breadcrumb.jsx)
    │   ├── Scanner/ (Scanner.jsx)
    │   ├── QRScanner/ (QRScanner.jsx)
    │   ├── MeterSearch/ (MeterSearch.jsx)
    │   ├── MeterInfo/ (MeterInfo.jsx)
    │   ├── StageStatus/ (StageStatus.jsx)
    │   ├── TestResult/ (TestResult.jsx)
    │   ├── Measurement/ (Measurement.jsx)
    │   └── ProductionStatus/ (ProductionStatus.jsx)
    │
    ├── constants/                        # Global Application Constants
    │   ├── roles.js
    │   ├── permissions.js
    │   ├── stages.js
    │   ├── statuses.js
    │   ├── shifts.js
    │   ├── routes.js
    │   └── messages.js
    │
    ├── hooks/                            # Custom React Hooks
    │   ├── useAuth.js
    │   ├── useRole.js
    │   ├── usePermission.js
    │   ├── useWebSocket.js
    │   ├── useStage.js
    │   ├── useMeter.js
    │   ├── useLoading.js
    │   └── useDebounce.js
    │
    ├── layouts/                          # App Layout Wrappers
    │   ├── MainLayout/ (MainLayout.jsx, MainLayout.css)
    │   ├── AuthLayout/ (AuthLayout.jsx)
    │   └── DashboardLayout/ (DashboardLayout.jsx)
    │
    ├── pages/                            # Router Page Views
    │   ├── Login/ (Login.jsx)
    │   ├── Dashboard/ (AdminDashboard/, SupervisorDashboard/, OperatorDashboard/, QCDashboard/, ReportDashboard/)
    │   ├── Production/ (ProductionDashboard/, MeterList/, MeterDetails/, ProductionHistory/)
    │   ├── Assignments/ (AssignmentList/, AssignStage/, AssignmentHistory/)
    │   ├── QC/ (QCInspection/, RejectedMeters/, QCReports/)
    │   ├── Reports/ (DailyReport/, WeeklyReport/, MonthlyReport/, YearlyReport/, StageReport/)
    │   ├── Users/ (UserList/, UserView/, CreateUser/, EditUser/, LoginHistory/)
    │   ├── Roles/ (RoleManagement/)
    │   ├── Permissions/ (Permissions.jsx)
    │   ├── Shifts/ (ShiftManagement.jsx)
    │   ├── Settings/ (Settings.jsx, ShiftSettings/, StageSettings/, StationSettings/, SystemSettings/)
    │   ├── Docs/ (Docs.jsx)
    │   ├── SignUp/ (SignUp.jsx)
    │   └── NotFound/ (NotFound.jsx)
    │
    ├── stages/                           # Stage Execution Sub-architecture
    │   ├── stage01-pcb-code-loading/ (components/, hooks/, services/, index.js)
    │   ├── stage02-nic-pcb-test/ (components/, hooks/, services/, index.js)
    │   ├── stage04-nic-print/ (components/, hooks/, services/, index.js)
    │   ├── stage06-calibration/ (components/, hooks/, services/, index.js)
    │   ├── stage07-meter-print/ (components/, hooks/, services/, index.js)
    │   ├── stage08-final-validation/ (components/, hooks/, services/, index.js)
    │   ├── stage09-pvc-seal/ (components/, hooks/, services/, index.js)
    │   ├── stage10-meter-box-print/ (components/, hooks/, services/, index.js)
    │   └── stage11-master-box-print/ (components/, hooks/, services/, index.js)
    │
    ├── services/                         # API Clients & Service Gateways
    │   ├── apiClient.js
    │   ├── authService.js
    │   ├── meterService.js
    │   ├── productionService.js
    │   ├── stageService.js
    │   ├── assignmentService.js
    │   ├── qcService.js
    │   ├── reportService.js
    │   ├── userService.js
    │   ├── roleService.js
    │   ├── permissionService.js
    │   ├── shiftService.js
    │   └── websocketService.js
    │
    ├── styles/                           # Style Tokens & Utilities
    │   ├── global.css
    │   ├── variables.css
    │   ├── layout.css
    │   ├── responsive.css
    │   └── components.css
    │
    ├── utils/                            # Helper Functions & Utilities
    │   ├── dateUtils.js
    │   ├── formatUtils.js
    │   ├── validationUtils.js
    │   ├── storageUtils.js
    │   ├── permissionUtils.js
    │   ├── exportUtils.js
    │   └── errorUtils.js
    │
    ├── main.jsx
    └── index.css
