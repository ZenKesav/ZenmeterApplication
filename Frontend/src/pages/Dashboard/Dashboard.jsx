import React from 'react';
import { useAuth } from '../../app/store';
import {
  AdminDashboardView,
  SupervisorDashboardView,
  OperatorDashboardView,
  QCDashboardView,
  ReportDashboardView
} from './DashboardViews';

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;

  const normRole = (user.role || 'ADMIN').toUpperCase().replace(/\s+/g, '_');

  if (normRole === 'ADMIN' || normRole.includes('ADMIN')) return <AdminDashboardView />;
  if (normRole === 'SUPERVISOR' || normRole.includes('SUPERVISOR')) return <SupervisorDashboardView />;
  if (normRole === 'OPERATOR' || normRole.includes('OPERATOR')) return <OperatorDashboardView />;
  if (normRole === 'QC' || normRole.includes('QC')) return <QCDashboardView />;
  if (normRole === 'REPORT_VIEWER' || normRole.includes('REPORT') || normRole.includes('VIEWER')) return <ReportDashboardView />;

  return <AdminDashboardView />;
}
