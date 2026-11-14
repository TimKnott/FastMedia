// Regression-test the Zelený Kůň source patch without accessing Lovable.
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";

const root = mkdtempSync(join(tmpdir(), "zelenykun-seo-"));
const sourceDir = resolve("seo-integrations/zelenykun");
const script = join(sourceDir, "apply-seo-patch.mjs");
try {
  mkdirSync(join(root, "src/routes"), { recursive: true });
  const homepage = [
    'import { createFileRoute } from "@tanstack/react-router";',
    'export const Route = createFileRoute("/")({',
    '  head: ({ loaderData }) => {',
    '    const h = { scripts: [] };',
    '    const local = { "@context": "https://schema.org", "@type": "LocalBusiness" };',
    '    return { ...h, scripts: [...h.scripts, { type: "application/ld+json", children: JSON.stringify(local) }] };',
    '  },',
    '});',
  ].join("\n");
  writeFileSync(join(root, "src/routes/index.tsx"), homepage);
  const apply = () => spawnSync(process.execPath, [script, root], { encoding: "utf8" });
  const first = apply();
  assert.equal(first.status, 0, first.stderr);
  const output = readFileSync(join(root, "src/routes/index.tsx"), "utf8");
  assert.ok(output.includes("JSON.stringify([local, fodderProductSchema("));
  assert.equal(output.split("fodderProductSchema(").length - 1, 1);
  assert.ok(existsSync(join(root, "public/llms.txt")));
  assert.ok(existsSync(join(root, "src/lib/fodder-product-schema.ts")));
  const second = apply();
  assert.equal(second.status, 0, second.stderr);
  assert.equal(readFileSync(join(root, "src/routes/index.tsx"), "utf8"), output);
  const llms = readFileSync(join(root, "public/llms.txt"), "utf8");
  assert.ok(llms.includes("https://zelenykun.com/feeding-guide"));
  assert.ok(llms.includes("25 CZK"));
  console.log("Zelený Kůň source patch regression passed (combined JSON-LD, files and idempotence)");
} finally {
  rmSync(root, { recursive: true, force: true });
}
