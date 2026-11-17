import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Static release gates complement (but do not replace) authenticated
 * browser tests, server-side RLS tests and production smoke tests.
 */
const root = process.cwd();
const app = readFileSync(resolve(root, "src/App.tsx"), "utf8");
const sidebar = readFileSync(resolve(root, "src/components/admin/AdminSidebar.tsx"), "utf8");
const dashboard = readFileSync(resolve(root, "src/pages/admin/AdminWebsiteAdvantage.tsx"), "utf8");

describe("Website Advantage Super Admin release gates", () => {
  it("requires the super_admin role for the dashboard route", () => {
    expect(app).toMatch(/path="website-advantage"[^\n]*ProtectedRoute minRole="super_admin"/);
  });

  it("restricts the sidebar entry to super_admin", () => {
    expect(sidebar).toMatch(/url: '\/admin\/website-advantage'[^\n]*minRole: 'super_admin'/);
  });

  it("includes all eight portfolio domains", () => {
    for (const domain of [
      "fastmedia.pro", "sevenhourteacher.com", "koneastaje.com",
      "zelenykun.com", "standatoys.com", "theprogenitors.com",
      "calcurly.com", "justiceleague.online",
    ]) expect(dashboard).toContain(domain);
  });

  it("includes onboarding and explicit release evidence requirements", () => {
    expect(dashboard).toContain("Getting started");
    expect(dashboard).toContain("Professional release checklist");
    expect(dashboard).toContain("rollback");
    expect(dashboard).toContain("Not verified");
  });


  it("keeps the versioned portfolio registry aligned with the dashboard", () => {
    const registry = JSON.parse(readFileSync(resolve(root, "config/website-advantage-portfolio.json"), "utf8"));
    expect(registry.sites).toHaveLength(8);
    for (const site of registry.sites) expect(dashboard).toContain(site.url.endsWith("/") ? site.url.slice(0, -1) : site.url);
    expect(registry.release_policy.requires_super_admin_for_private_data).toBe(true);
    expect(registry.release_policy.no_automatic_production_write).toBe(true);
  });

  it("labels the historical audit as evidence, not live health", () => {
    expect(dashboard).toContain("Historical sample: 17 Nov 2026");
    expect(dashboard).toContain("Current health not verified");
    expect(dashboard).toContain('"SevenHourTeacher": "unknown"');
  });

  it("does not introduce cross-site credentials or write actions", () => {
    expect(dashboard).not.toMatch(/supabase\.functions\.invoke|fetch\(|axios\.|service_role|secret_key|localStorage\.setItem/);
  });
});
