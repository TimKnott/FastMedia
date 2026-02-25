import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

// Role hierarchy: super_admin > admin > moderator > editor > user
const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 100,
  admin: 80,
  moderator: 60,
  editor: 40,
  user: 20,
};

export const getRoleLevel = (role: AppRole | string): number =>
  ROLE_HIERARCHY[role] ?? 0;

export const hasMinimumRole = (userRole: AppRole | string | null, requiredRole: AppRole | string): boolean => {
  if (!userRole) return false;
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
};

export const useUserRole = () => {
  const [role, setRole] = useState<AppRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async (uid: string) => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', uid)
        .maybeSingle();
      setRole((data?.role as AppRole) ?? null);
      setUserId(uid);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          fetchRole(session.user.id);
        } else {
          setRole(null);
          setUserId(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    role,
    userId,
    loading,
    isSuperAdmin: role === 'super_admin',
    isAdmin: hasMinimumRole(role, 'admin'),
    isEditor: hasMinimumRole(role, 'editor'),
    isModerator: hasMinimumRole(role, 'moderator'),
    hasMinRole: (minRole: AppRole | string) => hasMinimumRole(role, minRole),
  };
};
