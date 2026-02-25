import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { History, RotateCcw, Search, Filter, ChevronDown, Clock, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ContentVersion {
  id: string;
  content_key: string;
  language: string;
  value: string;
  status: string;
  changed_by: string | null;
  change_type: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 25;

const AdminContentHistory = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rollbackTarget, setRollbackTarget] = useState<ContentVersion | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['content-versions', search, typeFilter, statusFilter, page],
    queryFn: async () => {
      let query = supabase
        .from('site_content_versions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

      if (search) {
        query = query.ilike('content_key', `%${search}%`);
      }
      if (typeFilter !== 'all') {
        query = query.eq('change_type', typeFilter);
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { versions: (data ?? []) as ContentVersion[], total: count ?? 0 };
    },
  });

  const rollbackMutation = useMutation({
    mutationFn: async (version: ContentVersion) => {
      // Upsert the old value back into site_content
      const { error } = await supabase
        .from('site_content')
        .upsert(
          {
            content_key: version.content_key,
            language: version.language,
            value: version.value,
            status: version.status,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'content_key,language,status' }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Content rolled back successfully');
      queryClient.invalidateQueries({ queryKey: ['content-versions'] });
      setRollbackTarget(null);
    },
    onError: (err: any) => {
      toast.error(`Rollback failed: ${err.message}`);
    },
  });

  const versions = data?.versions ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const changeTypeBadge = (type: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      update: { label: 'Update', variant: 'default' },
      insert: { label: 'Create', variant: 'secondary' },
      delete: { label: 'Delete', variant: 'destructive' },
      rollback: { label: 'Rollback', variant: 'outline' },
    };
    const config = map[type] || { label: type, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <History className="w-6 h-6" />
          Content Version History
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse all content changes and rollback to any previous version.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by content key..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Change type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="insert">Create</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="rollback">Rollback</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading version history...</div>
      ) : versions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No version history found.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {versions.map((v, i) => (
            <div
              key={v.id}
              className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border hover:shadow-sm transition-shadow group"
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center pt-1">
                <div className="w-3 h-3 rounded-full bg-primary shrink-0" />
                {i < versions.length - 1 && <div className="w-px h-full bg-border mt-1" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <code className="text-sm font-mono text-foreground bg-muted px-2 py-0.5 rounded">
                    {v.content_key}
                  </code>
                  {changeTypeBadge(v.change_type)}
                  <Badge variant="outline" className="text-xs">
                    {v.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs uppercase">
                    {v.language}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {v.value}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(v.created_at), 'dd.MM.yyyy HH:mm:ss')}
                  </span>
                  {v.changed_by && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {v.changed_by.slice(0, 8)}…
                    </span>
                  )}
                </div>
              </div>

              {/* Rollback button */}
              <Button
                variant="outline"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 gap-1.5"
                onClick={() => setRollbackTarget(v)}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Rollback
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages} ({total} entries)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Rollback confirmation dialog */}
      <Dialog open={!!rollbackTarget} onOpenChange={() => setRollbackTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rollback Content</DialogTitle>
            <DialogDescription>
              This will restore <code className="bg-muted px-1 rounded">{rollbackTarget?.content_key}</code> to the value it had at{' '}
              {rollbackTarget && format(new Date(rollbackTarget.created_at), 'dd.MM.yyyy HH:mm')}.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 rounded-lg p-4 text-sm max-h-40 overflow-y-auto">
            {rollbackTarget?.value}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRollbackTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => rollbackTarget && rollbackMutation.mutate(rollbackTarget)}
              disabled={rollbackMutation.isPending}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {rollbackMutation.isPending ? 'Rolling back...' : 'Confirm Rollback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContentHistory;
