import { useEffect } from 'react';
import { usePreviewMode } from '@/contexts/PreviewModeContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Eye, EyeOff, Upload, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const AdminToolbar = () => {
  const { isSuperAdmin } = useUserRole();
  const {
    isPreview,
    setPreview,
    draftCount,
    refreshDraftCount,
    publishAll,
    discardAll,
    publishing,
  } = usePreviewMode();

  useEffect(() => {
    if (isSuperAdmin) {
      refreshDraftCount();
    }
  }, [isSuperAdmin, refreshDraftCount]);

  if (!isSuperAdmin) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 bg-card/95 backdrop-blur-lg border border-border rounded-2xl shadow-xl px-4 py-3">
      {/* Preview toggle */}
      <Button
        size="sm"
        variant={isPreview ? 'default' : 'outline'}
        onClick={() => setPreview(!isPreview)}
        className="gap-2"
      >
        {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        {isPreview ? 'Vorschau aus' : 'Vorschau'}
      </Button>

      {/* Draft count */}
      {draftCount > 0 && (
        <Badge variant="secondary" className="text-xs px-2 py-1">
          {draftCount} Entwurf{draftCount !== 1 ? 'e' : ''}
        </Badge>
      )}

      {/* Publish */}
      {draftCount > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" className="gap-2 gradient-accent text-accent-foreground" disabled={publishing}>
              {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Veröffentlichen
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Änderungen veröffentlichen?</AlertDialogTitle>
              <AlertDialogDescription>
                {draftCount} Entwurf{draftCount !== 1 ? 'e' : ''} werden für alle Besucher sichtbar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={publishAll}>Veröffentlichen</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Discard */}
      {draftCount > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="ghost" className="gap-2 text-destructive hover:text-destructive" disabled={publishing}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Alle Entwürfe verwerfen?</AlertDialogTitle>
              <AlertDialogDescription>
                Alle unveröffentlichten Änderungen gehen unwiderruflich verloren.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={discardAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Verwerfen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Preview indicator */}
      {isPreview && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
          Vorschau-Modus aktiv
        </div>
      )}
    </div>
  );
};

export default AdminToolbar;
