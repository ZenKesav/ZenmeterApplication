import { useAuth } from '../app/store';

export function usePermission() {
  const { permissions, hasPermission } = useAuth();
  return {
    permissions,
    hasPermission
  };
}

export default usePermission;
