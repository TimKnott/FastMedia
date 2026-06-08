// SEO Daily Audit — crawls the production site's raw HTML (no JS execution)
// and stores per-URL findings so the admin can monitor health without SiteGuru.
//
// Triggered by pg_cron daily at 06:00 UTC, or on-demand via supabase.functions.invoke().

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BASE_URL = "https://www.fastmedia.pro";
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;

interface Finding {
  url: string;
  check_id: string;
  severity: "high" | "medium" | "low";
  current_value?: string | null;
  expected_value?: string | null;
  message: string;
}

const SEVERITY_WEIGHT: Record<string, number> = { high: 5, medium: 2, low: 1 };

/* -------------------------------- helpers ------------------------------- */

function pickAttr(html: string, regex: RegExp): string | null {
  const m = html.match(regex);
  return m ? m[1].trim() : null;
}

function pickAll(html: string, regex: RegExp): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const g = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
  while ((m = g.exec(html)) !== null) out.push(m[1].trim());
  return out;
}

async function fetchSitemapUrls(): Promise<string[]> {
  try {
    const res = await fetch(SITEMAP_URL, { headers: { "User-Agent": "FastMediaSEOBot/1.0" } });
    if (!res.ok) return [];
    const xml = await res.text();
    const locs = pickAll(xml, /<loc>([^<]+)<\/loc>/i);
    // De-dup, only http(s), strip trailing slash except root
    const norm = new Set<string>();
    for (const raw of locs) {
      try {
        const u = new URL(raw);
        let path = u.pathname;
        if (path.length > 1 && path.endsWith("/")) path = path.replace(/\/+$/, "");
        norm.add(`${u.origin}${path}`);
      } catch {
        /* skip malformed */
      }
    }
    return Array.from(norm);
  } catch (err) {
    console.error("sitemap fetch failed", err);
    return [];
  }
}

async function fetchPage(url: string): Promise<{ status: number; html: string }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "FastMediaSEOBot/1.0 (+https://www.fastmedia.pro)" },
      redirect: "follow",
    });
    const html = await res.text();
    return { status: res.status, html };
  } catch (err) {
    console.error("fetch failed", url, err);
    return { status: 0, html: "" };
  }
}

/* -------------------------------- checks -------------------------------- */

function auditPage(url: string, status: number, html: string, titleMap: Map<string, string[]>, descMap: Map<string, string[]>): Finding[] {
  const findings: Finding[] = [];

  if (status === 0) {
    findings.push({ url, check_id: "fetch_failed", severity: "high", message: "Could not fetch URL" });
    return findings;
  }
  if (status >= 400) {
    findings.push({
      url,
      check_id: "status_code_unexpected",
      severity: "high",
      current_value: String(status),
      expected_value: "200",
      message: `Page returned ${status}`,
    });
    return findings;
  }

  // Title
  const title = pickAttr(html, /<title[^>]*>([^<]*)<\/title>/i);
  if (!title) {
    findings.push({ url, check_id: "title_missing", severity: "high", message: "Missing <title>" });
  } else {
    if (title.length < 30 || title.length > 70) {
      findings.push({
        url,
        check_id: "title_length",
        severity: "medium",
        current_value: `${title.length} chars`,
        expected_value: "30–70 chars",
        message: `Title length out of range: "${title}"`,
      });
    }
    const arr = titleMap.get(title.toLowerCase()) ?? [];
    arr.push(url);
    titleMap.set(title.toLowerCase(), arr);
  }

  // Description
  const desc = pickAttr(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i)
    ?? pickAttr(html, /<meta\s+content=["']([^"']*)["']\s+name=["']description["'][^>]*>/i);
  if (!desc) {
    findings.push({ url, check_id: "description_missing", severity: "high", message: "Missing meta description" });
  } else {
    if (desc.length < 70 || desc.length > 165) {
      findings.push({
        url,
        check_id: "description_length",
        severity: "medium",
        current_value: `${desc.length} chars`,
        expected_value: "70–165 chars",
        message: "Description length out of range",
      });
    }
    const arr = descMap.get(desc.toLowerCase()) ?? [];
    arr.push(url);
    descMap.set(desc.toLowerCase(), arr);
  }

  // Canonical
  const canonicals = pickAll(html, /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  if (canonicals.length === 0) {
    findings.push({ url, check_id: "canonical_missing", severity: "high", message: "Missing <link rel=\"canonical\">" });
  } else if (canonicals.length > 1) {
    findings.push({
      url,
      check_id: "canonical_duplicate",
      severity: "high",
      current_value: canonicals.join(" | "),
      message: "Multiple canonical tags",
    });
  } else {
    const c = canonicals[0];
    if (!c.startsWith("https://www.fastmedia.pro")) {
      findings.push({
        url,
        check_id: "canonical_wrong_host",
        severity: "high",
        current_value: c,
        expected_value: "https://www.fastmedia.pro...",
        message: "Canonical does not use www host",
      });
    }
    const cleanCurrent = url.replace(/\/+$/, "") || url;
    const cleanCanonical = c.replace(/\/+$/, "");
    if (cleanCurrent !== cleanCanonical && cleanCurrent + "/" !== c) {
      findings.push({
        url,
        check_id: "canonical_mismatch",
        severity: "medium",
        current_value: c,
        expected_value: cleanCurrent,
        message: "Canonical does not point to this page",
      });
    }
  }

  // H1
  const h1s = pickAll(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1s.length === 0) {
    findings.push({ url, check_id: "h1_missing", severity: "high", message: "No <h1> found in raw HTML" });
  } else if (h1s.length > 1) {
    findings.push({
      url,
      check_id: "h1_multiple",
      severity: "medium",
      current_value: `${h1s.length}`,
      expected_value: "1",
      message: "More than one <h1>",
    });
  }

  // Open Graph
  const ogTags = ["og:title", "og:description", "og:url", "og:type", "og:image"];
  for (const tag of ogTags) {
    const re = new RegExp(`<meta\\s+property=["']${tag}["']\\s+content=["']([^"']+)["'][^>]*>`, "i");
    if (!re.test(html)) {
      findings.push({
        url,
        check_id: `og_missing:${tag}`,
        severity: tag === "og:image" ? "low" : "medium",
        message: `Missing ${tag} tag`,
      });
    }
  }

  // JSON-LD
  if (!/<script[^>]+type=["']application\/ld\+json["'][^>]*>/i.test(html)) {
    findings.push({ url, check_id: "jsonld_missing", severity: "medium", message: "No JSON-LD structured data" });
  }

  // Unintentional noindex
  if (/<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) {
    findings.push({
      url,
      check_id: "noindex_unexpected",
      severity: "high",
      message: "Page is marked noindex",
    });
  }

  return findings;
}

/* -------------------------------- handler ------------------------------- */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  let body: { triggered_by?: string; urls?: string[] } = {};
  try {
    body = await req.json();
  } catch {
    /* may be empty */
  }

  const triggeredBy = body.triggered_by ?? "manual";

  // Insert run
  const { data: runRow, error: runErr } = await supabase
    .from("seo_audit_runs")
    .insert({ triggered_by: triggeredBy })
    .select("id")
    .single();
  if (runErr || !runRow) {
    return new Response(JSON.stringify({ error: runErr?.message ?? "run insert failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const runId = runRow.id as string;

  // URL list
  let urls = body.urls && Array.isArray(body.urls) && body.urls.length > 0
    ? body.urls
    : await fetchSitemapUrls();
  if (urls.length === 0) urls = [BASE_URL];

  // Limit per-run to keep within edge function timeout (most sites well under)
  const MAX_URLS = 80;
  if (urls.length > MAX_URLS) urls = urls.slice(0, MAX_URLS);

  const titleMap = new Map<string, string[]>();
  const descMap = new Map<string, string[]>();
  const allFindings: Finding[] = [];

  for (const url of urls) {
    const { status, html } = await fetchPage(url);
    const f = auditPage(url, status, html, titleMap, descMap);
    allFindings.push(...f);
  }

  // Duplicate title / description findings
  for (const [, list] of titleMap) {
    if (list.length > 1) {
      for (const u of list) {
        allFindings.push({
          url: u,
          check_id: "title_duplicate",
          severity: "high",
          current_value: `Shared by ${list.length} pages`,
          message: "Title is not unique across the site",
        });
      }
    }
  }
  for (const [, list] of descMap) {
    if (list.length > 1) {
      for (const u of list) {
        allFindings.push({
          url: u,
          check_id: "description_duplicate",
          severity: "high",
          current_value: `Shared by ${list.length} pages`,
          message: "Meta description is not unique",
        });
      }
    }
  }

  // Health score (100 - weighted issues, floored at 0)
  let weighted = 0;
  for (const f of allFindings) weighted += SEVERITY_WEIGHT[f.severity] ?? 1;
  const maxPossible = urls.length * 10; // rough scaling
  const healthScore = Math.max(0, Math.min(100, Math.round(100 - (weighted / Math.max(1, maxPossible)) * 100)));

  // Upsert findings: insert new, refresh last_seen_at + run_id for existing,
  // and reopen if previously resolved.
  for (const f of allFindings) {
    const { data: existing } = await supabase
      .from("seo_audit_findings")
      .select("id, resolved_at")
      .eq("url", f.url)
      .eq("check_id", f.check_id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("seo_audit_findings")
        .update({
          last_seen_at: new Date().toISOString(),
          run_id: runId,
          severity: f.severity,
          current_value: f.current_value ?? null,
          expected_value: f.expected_value ?? null,
          message: f.message,
          resolved_at: null, // reopen
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("seo_audit_findings").insert({
        run_id: runId,
        url: f.url,
        check_id: f.check_id,
        severity: f.severity,
        current_value: f.current_value ?? null,
        expected_value: f.expected_value ?? null,
        message: f.message,
      });
    }
  }

  // Mark previously-open findings that were NOT seen this run as resolved
  const seenKeys = new Set(allFindings.map((f) => `${f.url}::${f.check_id}`));
  const { data: openFindings } = await supabase
    .from("seo_audit_findings")
    .select("id, url, check_id")
    .is("resolved_at", null)
    .is("ignored_at", null);
  if (openFindings) {
    for (const row of openFindings) {
      const key = `${row.url}::${row.check_id}`;
      // Only auto-resolve URLs that were part of THIS audit's URL set
      if (urls.includes(row.url) && !seenKeys.has(key)) {
        await supabase
          .from("seo_audit_findings")
          .update({ resolved_at: new Date().toISOString() })
          .eq("id", row.id);
      }
    }
  }

  // Finalise run
  await supabase
    .from("seo_audit_runs")
    .update({
      finished_at: new Date().toISOString(),
      urls_checked: urls.length,
      issues_found: allFindings.length,
      health_score: healthScore,
    })
    .eq("id", runId);

  // ---- Email alert: notify on NEW high-severity findings in this run ----
  try {
    const { data: newHighFindings } = await supabase
      .from("seo_audit_findings")
      .select("url, check_id, message, current_value, first_seen_at, run_id")
      .eq("run_id", runId)
      .eq("severity", "high")
      .is("resolved_at", null)
      .is("ignored_at", null);

    const trulyNew = (newHighFindings ?? []).filter((f: any) => {
      if (!f.first_seen_at) return true;
      return Date.now() - new Date(f.first_seen_at).getTime() < 5 * 60 * 1000;
    });

    if (trulyNew.length > 0) {
      const apiKey = Deno.env.get("MAILGUN_API_KEY");
      const domain = Deno.env.get("MAILGUN_DOMAIN") ?? "notify.fastmedia.pro";
      if (apiKey) {
        const rows = trulyNew.slice(0, 25).map((f: any) =>
          `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:12px;"><a href="${f.url}">${f.url}</a></td>` +
          `<td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:12px;"><code>${f.check_id}</code></td>` +
          `<td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:12px;">${f.message ?? ""}</td></tr>`,
        ).join("");
        const html = `
          <div style="font-family:Inter,Arial,sans-serif;max-width:680px;margin:auto;color:#1a1a2e;">
            <h2 style="color:#c0392b;margin:0 0 8px;">🔴 ${trulyNew.length} new high-severity SEO issue${trulyNew.length > 1 ? "s" : ""}</h2>
            <p style="color:#666;margin:0 0 16px;">FastMedia.Pro daily audit — health score <strong>${healthScore}/100</strong></p>
            <table style="width:100%;border-collapse:collapse;">
              <thead><tr style="background:#f5f6fa;text-align:left;">
                <th style="padding:8px 10px;font-size:11px;text-transform:uppercase;">URL</th>
                <th style="padding:8px 10px;font-size:11px;text-transform:uppercase;">Check</th>
                <th style="padding:8px 10px;font-size:11px;text-transform:uppercase;">Issue</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>
            <p style="margin-top:24px;font-size:13px;">View full dashboard: <a href="https://fastmedia.pro/admin/seo-health">fastmedia.pro/admin/seo-health</a></p>
          </div>`;
        const form = new FormData();
        form.append("from", `FastMedia SEO Monitor <seo@${domain}>`);
        form.append("to", "timknott2011@gmail.com");
        form.append("subject", `[SEO ALERT] ${trulyNew.length} new high-severity issue${trulyNew.length > 1 ? "s" : ""} — health ${healthScore}/100`);
        form.append("html", html);
        form.append("h:Reply-To", "support@fastmedia.pro");
        const auth = "Basic " + btoa(`api:${apiKey}`);
        let res = await fetch(`https://api.eu.mailgun.net/v3/${domain}/messages`, { method: "POST", headers: { Authorization: auth }, body: form });
        if (!res.ok) {
          res = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, { method: "POST", headers: { Authorization: auth }, body: form });
        }
        if (!res.ok) console.error("seo-daily-audit alert mailgun error", res.status, await res.text());
      } else {
        console.warn("MAILGUN_API_KEY not set — skipping SEO alert email");
      }
    }
  } catch (err) {
    console.error("seo-daily-audit alert failed", err);
  }

  return new Response(
    JSON.stringify({
      run_id: runId,
      urls_checked: urls.length,
      issues_found: allFindings.length,
      health_score: healthScore,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
