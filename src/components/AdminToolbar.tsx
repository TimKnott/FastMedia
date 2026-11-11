import { useEffect } from "react";
import { usePreviewMode } from "@/contexts/PreviewModeContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eye, EyeOff, Upload, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
} from "@/components/ui/alert-dialog";

const AdminToolbar = () => {
  const { isSuperAdmin } = useUserRole();
  const { t, language } = useLanguage();
  const label =
    language === "cs"
      ? "Náhled nepublikovaných úprav"
      : language === "de"
        ? "Unveröffentlichte Änderungen"
        : "Preview unpublished edits";
  const { isPreview, setPreview, draftCount, refreshDraftCount, publishAll, discardAll, publishing } = usePreviewMode();

  useEffect(() => {
    if (isSuperAdmin) {
      refreshDraftCount();
    }
  }, [isSuperAdmin, refreshDraftCount]);

  if (!isSuperAdmin) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className={`relative h-8 w-8 shrink-0 rounded-lg ${isPreview ? "bg-accent/15 text-accent" : "text-muted-foreground"}`}
          aria-label={label}
          title={label}
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          {draftCount > 0 && (
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="z-[100] flex w-72 max-w-[calc(100vw-2rem)] flex-wrap items-center gap-2"
      >
        <p className="w-full text-sm font-medium">{label}</p>
        {/* Preview toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={isPreview ? "default" : "outline"}
                onClick={() => setPreview(!isPreview)}
                className="gap-2"
              >
                {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {isPreview ? "Show published text" : "Preview my unpublished edits"}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
              Switch this on to see the site with your saved-but-not-yet-published wording and images. Visitors still
              see the published version until you press Publish.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Draft count */}
        {draftCount > 0 && (
          <Badge variant="secondary" className="text-xs px-2 py-1">
            {draftCount} {draftCount !== 1 ? t("admin.drafts") : t("admin.draft")}
          </Badge>
        )}

        {/* Publish */}
        {draftCount > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="gap-2 gradient-accent text-accent-foreground" disabled={publishing}>
                {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {t("admin.publish")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("admin.publish_confirm")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("admin.publish_desc").replace("{count}", String(draftCount))}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={publishAll}>{t("admin.publish")}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Discard */}
        {draftCount > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="gap-2 text-destructive hover:text-destructive"
                disabled={publishing}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("admin.discard_all")}</AlertDialogTitle>
                <AlertDialogDescription>{t("admin.discard_desc")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={discardAll}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t("admin.discard")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Preview indicator */}
        {isPreview && <div className="w-full text-xs font-medium text-accent">{t("admin.preview_active")}</div>}
      </PopoverContent>
    </Popover>
  );
};

export default AdminToolbar;
