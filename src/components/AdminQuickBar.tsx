import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Target, LayoutDashboard } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';

/** Slim bar shown on public pages to signed-in admins only. */
const AdminQuickBar = () => {
  const { hasMinRole, loading } = useUserRole();
  const { pathname } = useLocation();
  const [count, setCount] = useState<number | null>(null);
  const isAdmin = !loading && hasMinRole('admin');

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from('prospects').select('id', { count: 'exact', head: true }).then(({ count }) => setCount(count ?? 0));
  }, [isAdmin]);

  if (!isAdmin || pathname.startsWith('/admin')) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[110] h-10 px-4 rounded-full bg-primary text-primary-foreground text-sm flex items-center gap-4 shadow-xl">
      <span className="font-medium hidden sm:inline">Signed in as admin</span>
      <Link to="/admin/leads-hub" className="inline-flex items-center gap-1 font-semibold hover:underline">
        <Target className="w-3.5 h-3.5" /> Leads{count !== null ? ` (${count})` : ''}
      </Link>
      <Link to="/admin" className="inline-flex items-center gap-1 hover:underline">
        <LayoutDashboard className="w-3.5 h-3.5" /> Back office
      </Link>
    </div>
  );
};

export default AdminQuickBar;
