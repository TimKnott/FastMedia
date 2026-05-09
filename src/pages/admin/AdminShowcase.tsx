import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, RefreshCw, Trash2, Plus, AlertTriangle } from "lucide-react";

type Showcase = {
  id: string;
  name: string;
  slug: string;
  lovable_url: string;
  access_token: string;
  is_active: boolean;
  created_at: string;
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);

const newToken = () => {
  const a = new Uint8Array(24);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
};

const publicLink = (s: Showcase) =>
  `${window.location.origin}/showcase/${s.slug}?k=${s.access_token}`;

const AdminShowcase = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Showcase[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({ name: "", slug: "", lovable_url: "" });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("showcase_projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    setItems((data as Showcase[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!draft.name || !draft.lovable_url) {
      toast({ title: "Name and URL are required", variant: "destructive" });
      return;
    }
    const slug = draft.slug ? slugify(draft.slug) : slugify(draft.name);
    const { error } = await supabase.from("showcase_projects").insert({
      name: draft.name,
      slug,
      lovable_url: draft.lovable_url,
      access_token: newToken(),
      is_active: true,
    });
    if (error) {
      toast({ title: "Could not create", description: error.message, variant: "destructive" });
      return;
    }
    setDraft({ name: "", slug: "", lovable_url: "" });
    toast({ title: "Project added" });
    load();
  };

  const update = async (id: string, patch: Partial<Showcase>) => {
    const { error } = await supabase.from("showcase_projects").update(patch).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this project? The current link will stop working.")) return;
    const { error } = await supabase.from("showcase_projects").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Deleted" });
    load();
  };

  const rotate = async (id: string) => {
    if (!confirm("Rotate token? The previous link will stop working immediately.")) return;
    await update(id, { access_token: newToken() });
    toast({ title: "Token rotated" });
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Link copied" });
  };

  const isEditorUrl = (u: string) => /lovable\.dev\/projects\//i.test(u);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Showcase Projects</h1>
        <p className="text-sm text-muted-foreground">
          Private, token-gated project previews served from your domain.
        </p>
      </div>

      <Card className="p-4 space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add project
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label>Display name</Label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="FastMedia Showcase"
            />
          </div>
          <div>
            <Label>Slug (URL)</Label>
            <Input
              value={draft.slug}
              onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
              placeholder="auto from name"
            />
          </div>
          <div>
            <Label>Embedded URL</Label>
            <Input
              value={draft.lovable_url}
              onChange={(e) => setDraft({ ...draft, lovable_url: e.target.value })}
              placeholder="https://your-project.lovable.app"
            />
          </div>
        </div>
        {draft.lovable_url && isEditorUrl(draft.lovable_url) && (
          <div className="flex items-start gap-2 text-sm text-amber-600">
            <AlertTriangle className="w-4 h-4 mt-0.5" />
            <span>
              That looks like a Lovable editor URL — it will not embed. Use the project's published URL
              (e.g. <code>your-project.lovable.app</code> or its custom domain).
            </span>
          </div>
        )}
        <div>
          <Button onClick={create}>Create</Button>
        </div>
      </Card>

      <div className="space-y-3">
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && items.length === 0 && (
          <p className="text-sm text-muted-foreground">No showcase projects yet.</p>
        )}
        {items.map((s) => (
          <Card key={s.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <Input
                    value={s.name}
                    onChange={(e) => setItems((p) => p.map((x) => (x.id === s.id ? { ...x, name: e.target.value } : x)))}
                    onBlur={(e) => update(s.id, { name: e.target.value })}
                    className="max-w-xs font-semibold"
                  />
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={s.is_active}
                      onCheckedChange={(v) => update(s.id, { is_active: v })}
                    />
                    <span className="text-xs text-muted-foreground">{s.is_active ? "Active" : "Disabled"}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <Label className="text-xs">Slug</Label>
                    <Input
                      value={s.slug}
                      onChange={(e) => setItems((p) => p.map((x) => (x.id === s.id ? { ...x, slug: e.target.value } : x)))}
                      onBlur={(e) => update(s.id, { slug: slugify(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Embedded URL</Label>
                    <Input
                      value={s.lovable_url}
                      onChange={(e) => setItems((p) => p.map((x) => (x.id === s.id ? { ...x, lovable_url: e.target.value } : x)))}
                      onBlur={(e) => update(s.id, { lovable_url: e.target.value })}
                    />
                    {isEditorUrl(s.lovable_url) && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Editor URLs cannot be embedded — use the published URL.
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <Label className="text-xs">Private link</Label>
                  <div className="flex items-center gap-2">
                    <Input readOnly value={publicLink(s)} className="font-mono text-xs" />
                    <Button size="sm" variant="outline" onClick={() => copy(publicLink(s))}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="sm" variant="outline" onClick={() => rotate(s.id)}>
                  <RefreshCw className="w-4 h-4 mr-1" /> Rotate
                </Button>
                <Button size="sm" variant="destructive" onClick={() => remove(s.id)}>
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminShowcase;
