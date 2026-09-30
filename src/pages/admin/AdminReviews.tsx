import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

type R = { id: string; name: string; company: string | null; rating: number; review_text: string; status: string; created_at: string };
const db = supabase as any;

export default function AdminReviews() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("pending");
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin_reviews"],
    queryFn: async () => {
      const { data, error } = await db.from("client_reviews").select("id, name, company, rating, review_text, status, created_at").order("created_at", { ascending: false });
      if (error) throw error;
      return data as R[];
    },
  });
  const setStatus = async (id: string, status: string) => {
    const { error } = await db.from("client_reviews").update({ status, approved_at: status === "approved" ? new Date().toISOString() : null }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "approved" ? "Approved and now on the website" : "Updated");
    qc.invalidateQueries({ queryKey: ["admin_reviews"] });
    qc.invalidateQueries({ queryKey: ["approved_reviews"] });
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    const { error } = await db.from("client_reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin_reviews"] });
  };
  const rows = data.filter((r) => filter === "all" || r.status === filter);
  const count = (s: string) => data.filter((r) => r.status === s).length;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Star className="h-6 w-6" />Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">Client reviews from /reviews. Only approved ones appear on the website and homepage.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {["pending", "approved", "rejected", "all"].map((s) => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}>
            {s[0].toUpperCase() + s.slice(1)}{s !== "all" && ` (${count(s)})`}
          </Button>
        ))}
      </div>
      {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
      {!isLoading && rows.length === 0 && <p className="text-sm text-muted-foreground">No reviews here.</p>}
      <div className="space-y-3">
        {rows.map((r) => (
          <Card key={r.id} className="p-4 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{r.name}</span>
              {r.company && <span className="text-sm text-muted-foreground">· {r.company}</span>}
              <span className="text-accent">{"★".repeat(r.rating)}<span className="text-muted">{"★".repeat(5 - r.rating)}</span></span>
              <Badge variant={r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : "secondary"}>{r.status}</Badge>
              <span className="text-xs text-muted-foreground ml-auto">{new Date(r.created_at).toLocaleDateString("en-GB")}</span>
            </div>
            <p className="text-sm">{r.review_text}</p>
            <div className="flex gap-2">
              {r.status !== "approved" && <Button size="sm" onClick={() => setStatus(r.id, "approved")}>Approve</Button>}
              {r.status !== "rejected" && <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "rejected")}>Reject</Button>}
              <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
