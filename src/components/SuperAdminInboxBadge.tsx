import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

const STORAGE_KEY = 'fastmedia-inbox-last-seen';
const POLL_MS = 30_000;

const SuperAdminInboxBadge = () => {
  const { isSuperAdmin, loading } = useUserRole();
  const [unread, setUnread] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) return;

    const fetchCount = async () => {
      const lastSeen = localStorage.getItem(STORAGE_KEY) || '1970-01-01T00:00:00Z';
      const { count } = await supabase
        .from('inbound_emails')
        .select('id', { count: 'exact', head: true })
        .gt('created_at', lastSeen)
        .neq('status', 'skipped');
      setUnread(count ?? 0);
    };

    fetchCount();
    const interval = setInterval(fetchCount, POLL_MS);

    const channel = supabase
      .channel('super-admin-inbox')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'inbound_emails' },
        () => fetchCount(),
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [isSuperAdmin]);

  const markSeen = () => {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setUnread(0);
  };

  if (loading || !isSuperAdmin || dismissed || unread === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 240, damping: 20 }}
        className="fixed bottom-6 left-6 z-[60]"
        role="alert"
        aria-live="polite"
      >
        <Link
          to="/admin/emails"
          onClick={markSeen}
          className="group flex items-center gap-3 rounded-full bg-destructive text-destructive-foreground pl-3 pr-4 py-2.5 shadow-[0_8px_32px_-4px_hsl(var(--destructive)/0.55)] ring-2 ring-destructive/40 hover:ring-destructive/70 transition-all"
        >
          <span className="relative inline-flex">
            <span className="absolute inline-flex h-full w-full rounded-full bg-destructive-foreground/30 opacity-75 animate-ping" />
            <Mail className="relative w-4 h-4" />
          </span>
          <span className="font-semibold text-sm tracking-wide">
            {unread} new message{unread === 1 ? '' : 's'}
          </span>
          <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-destructive-foreground text-destructive text-xs font-bold">
            {unread > 99 ? '99+' : unread}
          </span>
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-background border border-border text-muted-foreground hover:text-foreground flex items-center justify-center shadow-sm"
          aria-label="Dismiss"
        >
          <X className="w-3 h-3" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default SuperAdminInboxBadge;
