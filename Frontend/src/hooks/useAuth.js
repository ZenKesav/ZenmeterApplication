import { useAuth } from '../app/store';

export { useAuth };

export function useRole() {
  const { user, hasRole } = useAuth();
  return { role: user?.role, hasRole };
}

export function usePermission() {
  const { permissions, hasPermission } = useAuth();
  return { permissions, hasPermission };
}
