import { useAuth } from '../app/store';

export function useRole() {
  const { user, hasRole } = useAuth();
  return {
    role: user?.role,
    hasRole
  };
}

export default useRole;
