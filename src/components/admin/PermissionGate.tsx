import { useUserRole } from '@/hooks/useUserRole';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface PermissionGateProps {
  children: React.ReactNode;
  minRole: AppRole;
  fallback?: React.ReactNode;
}

/**
 * Renders children only if the current user has at least the specified role.
 * Use this to conditionally show UI elements based on role hierarchy.
 */
const PermissionGate = ({ children, minRole, fallback = null }: PermissionGateProps) => {
  const { hasMinRole, loading } = useUserRole();

  if (loading) return null;
  if (!hasMinRole(minRole)) return <>{fallback}</>;

  return <>{children}</>;
};

export default PermissionGate;
