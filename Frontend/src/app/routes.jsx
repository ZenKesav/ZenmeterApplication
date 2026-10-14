import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import { LoadingSpinner } from '../components/CommonComponents';

const Login = lazy(() => import('../pages/Login/Login'));
const SignUp = lazy(() => import('../pages/SignUp/SignUp'));
const NotFound = lazy(() => import('../pages/NotFound/NotFound'));

const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const ProductionOverview = lazy(() => import('../pages/Production/ProductionOverview'));
const SupervisorTest = lazy(() => import('../pages/SupervisorTest/SupervisorTest'));
const QCTest = lazy(() => import('../pages/QCTest/QCTest'));
const MeterTraceability = lazy(() => import('../pages/Production/MeterTraceability'));
const StageAssignment = lazy(() => import('../pages/Assignments/StageAssignment'));
const StageExecution = lazy(() => import('../stages/StageExecution'));
const QCInspection = lazy(() => import('../pages/QC/QCInspection'));
const Reports = lazy(() => import('../pages/Reports/Reports'));
const UserProfile = lazy(() => import('../pages/Users/UserProfile'));
const UserList = lazy(() => import('../pages/Users/UserList'));
const UserView = lazy(() => import('../pages/Users/UserView'));
const LoginHistory = lazy(() => import('../pages/Users/LoginHistory'));
const RoleManagement = lazy(() => import('../pages/Roles/RoleManagement'));
const ShiftManagement = lazy(() => import('../pages/Shifts/ShiftManagement'));
const StageManagement = lazy(() => import('../pages/Stages/StageManagement'));
const StageSelection = lazy(() => import('../pages/Stages/StageSelection'));
const Settings = lazy(() => import('../pages/Settings/Settings'));
const Docs = lazy(() => import('../pages/Docs/Docs'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading Module..." />}>
      <Routes>
        {/* Auth & Standalone Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/404-error" element={<NotFound />} />
        </Route>

        {/* Main App Routes Protected */}
        <Route element={<ProtectedRoute />}>
          {/* Standalone Full-Screen Stage Selection Page (Without Sidebar/Topbar) */}
          <Route path="/select-stage" element={<StageSelection />} />
          <Route path="/stage-selection" element={<StageSelection />} />

          {/* Standard Main Layout Routes (With Sidebar & Topbar) */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="stage-production" element={<ProductionOverview />} />
            <Route path="supervisor-test" element={<SupervisorTest />} />
            <Route path="qc-test" element={<QCTest />} />
            <Route path="inventory" element={<Navigate to="/stage-production" replace />} />
            <Route path="production" element={<ProductionOverview />} />
            <Route path="production/traceability" element={<MeterTraceability />} />
            <Route path="create-product" element={<StageAssignment />} />
            <Route path="assignments" element={<StageAssignment />} />
            <Route path="stages/execute" element={<StageExecution />} />
            <Route path="stages/:stageId" element={<StageExecution />} />
            <Route path="qc" element={<QCInspection />} />
            <Route path="reports" element={<Reports />} />
            <Route path="users" element={<UserList />} />
            <Route path="users/view/:id" element={<UserView />} />
            <Route path="users/login-history" element={<LoginHistory />} />
            <Route path="login-history" element={<LoginHistory />} />
            <Route path="roles" element={<RoleManagement />} />
            <Route path="shifts" element={<ShiftManagement />} />
            <Route path="stage-management" element={<StageManagement />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="user-profile" element={<UserProfile />} />
            <Route path="docs" element={<Docs />} />
          </Route>
        </Route>

        {/* Fallback 404 */}
        <Route element={<AuthLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
