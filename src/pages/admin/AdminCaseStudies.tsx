import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, FileText, ExternalLink } from 'lucide-react';
import PermissionGate from '@/components/admin/PermissionGate';
import CaseStudyEditorDialog from '@/components/admin/CaseStudyEditorDialog';
import { caseStudiesTable, useAllCaseStudies, resolvePdfUrl, type CaseStudy } from '@/hooks/useCaseStudies';
import { useToast } from '@/hooks/use-toast';

const AdminCaseStudies = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useAllCaseStudies();
  const items = data ?? [];
  const [editing, setEditing] = useState<CaseStudy | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['case-studies'] });

  const togglePublished = async (item: CaseStudy) => {
    const { error } = await caseStudiesTable().update({ is_published: !item.is_published }).eq('id', item.id);
    if (error) {
      toast({ title: 'Could not change visibility', description: error.message, variant: 'destructive' });
      return;
    }
    refresh();
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = items[index + direction];
    const current = items[index];
    if (!target || !current) return;
    const a = await caseStudiesTable().update({ sort_order: target.sort_order }).eq('id', current.id);
    const b = await caseStudiesTable().update({ sort_order: current.sort_order }).eq('id', target.id);
    if (a.error || b.error) {
      toast({ title: 'Could not reorder', description: (a.error || b.error)?.message, variant: 'destructive' });
      return;
    }
    refresh();
  };

  const remove = async (item: CaseStudy) => {
    if (!window.confirm(`Delete "${item.brand}"? This cannot be undone.`)) return;
    const { error } = await caseStudiesTable().delete().eq('id', item.id);
    if (error) {
      toast({ title: 'Could not delete', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Case study deleted' });
    refresh();
  };

  const openPdf = async (item: CaseStudy) => {
    const url = await resolvePdfUrl(item);
    if (!url) {
      toast({ title: 'No PDF attached', description: 'Visitors get a generated summary PDF until you upload one.' });
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const nextSortOrder = items.length ? Math.max(...items.map((i) => i.sort_order)) + 1 : 1;

  return (
    <PermissionGate minRole="editor">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Case studies</h1>
            <p className="text-muted-foreground">
              Add case studies, attach their PDF, reorder them and choose which appear on the website.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="/case-studies" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                View page
              </a>
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              New case study
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">No case studies yet.</Card>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <Card key={item.id} className="p-4 flex flex-wrap items-center gap-4">
                {item.thumbnail_url && (
                  <img loading="lazy" decoding="async" src={item.thumbnail_url} alt={item.brand} className="w-24 h-16 object-cover rounded-md" />
                )}
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{item.brand}</span>
                    {item.tag_en && <Badge variant="secondary">{item.tag_en}</Badge>}
                    {!item.is_published && <Badge variant="outline">Hidden</Badge>}
                    {(item.pdf_path || item.pdf_url) && <Badge variant="outline">PDF</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.summary_en || item.summary_cs}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Switch checked={item.is_published} onCheckedChange={() => togglePublished(item)} />
                  <Button size="icon" variant="ghost" onClick={() => openPdf(item)} aria-label="Open PDF">
                    <FileText className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move up">
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={index === items.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditing(item);
                      setDialogOpen(true);
                    }}
                    aria-label="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(item)} aria-label="Delete">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <CaseStudyEditorDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          item={editing}
          nextSortOrder={nextSortOrder}
        />
      </div>
    </PermissionGate>
  );
};

export default AdminCaseStudies;
