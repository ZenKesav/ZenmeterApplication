import React from 'react';
import { useAuth } from '../../app/store';

export function PermissionGuard({ permission, children, fallback = null }) {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) {
    return fallback;
  }
  return <>{children}</>;
}

export default PermissionGuard;
