import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VBOUT_BASE = "https://api.vbout.com/1";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function verifyAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims) throw new Error("Unauthorized");

  const userId = data.claims.sub;

  // Check admin role
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  const roleWeight: Record<string, number> = {
    super_admin: 100,
    admin: 80,
    moderator: 60,
    editor: 40,
    user: 20,
  };

  if (!roleData || (roleWeight[roleData.role] ?? 0) < 40) {
    throw new Error("Forbidden");
  }

  return supabase;
}

async function vboutGet(endpoint: string) {
  const key = Deno.env.get("VBOUT_API_KEY")!;
  const separator = endpoint.includes("?") ? "&" : "?";
  const url = `${VBOUT_BASE}/${endpoint}${separator}key=${key}`;
  const res = await fetch(url);
  return res.json();
}

async function vboutPost(endpoint: string, body: Record<string, unknown>) {
  const key = Deno.env.get("VBOUT_API_KEY")!;
  const params = new URLSearchParams();
  params.set("key", key);
  for (const [k, v] of Object.entries(body)) {
    params.set(k, String(v));
  }
  const res = await fetch(`${VBOUT_BASE}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  return res.json();
}

// Rate-limited batch sync helper
async function syncBatch(
  contacts: Array<{ email: string; fields?: Record<string, string> }>,
  listId: string
) {
  const results = { synced: 0, errors: 0, errorDetails: [] as string[] };
  const BATCH_SIZE = 10;
  const DELAY_MS = 750; // ~13 req/s to stay under 15/s

  for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
    const batch = contacts.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async (contact) => {
      try {
        const body: Record<string, unknown> = {
          email: contact.email,
          listid: listId,
          status: "active",
        };
        if (contact.fields) {
          for (const [k, v] of Object.entries(contact.fields)) {
            body[k] = v;
          }
        }
        await vboutPost("contacts/sync.json", body);
        results.synced++;
      } catch (e) {
        results.errors++;
        results.errorDetails.push(`${contact.email}: ${(e as Error).message}`);
      }
    });
    await Promise.all(promises);
    if (i + BATCH_SIZE < contacts.length) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }
  return results;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = await verifyAdmin(req);
    const { action, ...params } = await req.json();

    switch (action) {
      case "get-lists": {
        const data = await vboutGet("emailmarketing/getlists.json");
        return json(data);
      }

      case "get-contacts": {
        const { listId } = params;
        if (!listId) return json({ error: "listId required" }, 400);
        const data = await vboutGet(
          `contacts/getcontacts.json?listid=${listId}`
        );
        return json(data);
      }

      case "sync-subscribers": {
        const { listId } = params;
        if (!listId) return json({ error: "listId required" }, 400);
        const { data: subs, error } = await supabase
          .from("newsletter_subscribers")
          .select("email");
        if (error) return json({ error: error.message }, 500);
        const contacts = (subs ?? []).map((s: { email: string }) => ({
          email: s.email,
        }));
        const result = await syncBatch(contacts, listId);
        return json(result);
      }

      case "sync-leads": {
        const { listId } = params;
        if (!listId) return json({ error: "listId required" }, 400);
        const { data: leads, error } = await supabase
          .from("leads")
          .select("email, name, phone, trade, source");
        if (error) return json({ error: error.message }, 500);
        const contacts = (leads ?? []).map(
          (l: {
            email: string;
            name: string;
            phone?: string;
            trade: string;
            source: string;
          }) => ({
            email: l.email,
            fields: {
              firstname: l.name.split(" ")[0] || "",
              lastname: l.name.split(" ").slice(1).join(" ") || "",
              phone: l.phone || "",
              company: l.trade,
              custom_source: l.source,
            },
          })
        );
        const result = await syncBatch(contacts, listId);
        return json(result);
      }

      case "get-campaigns": {
        const data = await vboutGet("emailmarketing/getcampaigns.json");
        return json(data);
      }

      case "send-campaign": {
        const { campaignId } = params;
        if (!campaignId)
          return json({ error: "campaignId required" }, 400);
        // Held: Vbout list sends cannot be checked per recipient against the legal gate,
        // suppression list or rendered unsubscribe footer, so this route fails closed.
        return json({ error: "Vbout campaign sending is disabled: recipients cannot be checked against the legal eligibility gate. Use the approval-gated outreach queue." }, 403);
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (e) {
    const msg = (e as Error).message;
    const status = msg === "Unauthorized" || msg === "Forbidden" ? 401 : 500;
    return json({ error: msg }, status);
  }
});
