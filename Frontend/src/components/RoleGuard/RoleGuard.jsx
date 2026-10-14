import React from 'react';
import { useAuth } from '../../app/store';

export function RoleGuard({ roles = [], children, fallback = null }) {
  const { hasRole } = useAuth();
  if (!hasRole(...roles)) {
    return fallback;
  }
  return <>{children}</>;
}

export default RoleGuard;
