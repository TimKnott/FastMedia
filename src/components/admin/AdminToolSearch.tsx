import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  mainItems, contentItems, publicPageItems, adminItems, settingsItems, type MenuItem,
} from './AdminSidebar';

const groups: { label: string; items: MenuItem[] }[] = [
  { label: 'Main tools', items: mainItems },
  { label: 'Content', items: contentItems },
  { label: 'Public pages', items: publicPageItems },
  { label: 'Administration', items: adminItems },
  { label: 'System', items: settingsItems },
];

const AdminToolSearch = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { hasMinRole } = useUserRole();
  const { t } = useLanguage();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (url: string) => {
    setOpen(false);
    if (url.includes('?')) window.location.assign(url);
    else navigate(url);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 text-muted-foreground w-full max-w-xs justify-start"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search tools…</span>
        <kbd className="hidden sm:inline text-[10px] border border-border rounded px-1.5 py-0.5">Ctrl K</kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a tool name, e.g. find leads, inbox, SEO…" />
        <CommandList>
          <CommandEmpty>No matching tool.</CommandEmpty>
          {groups.map((g) => {
            const items = g.items.filter((i) => hasMinRole(i.minRole));
            if (!items.length) return null;
            return (
              <CommandGroup key={g.label} heading={g.label}>
                {items.map((i) => {
                  const title = t(i.titleKey);
                  return (
                    <CommandItem key={i.url + i.titleKey} value={`${title} ${i.url}`} onSelect={() => go(i.url)}>
                      <i.icon className="w-4 h-4 mr-2" />
                      <span>{title}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{i.url}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default AdminToolSearch;
