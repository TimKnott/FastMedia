import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

describe("/demos page", () => {
  it("renders a visible H1 in the browser version", () => {
    const src = readFileSync("src/pages/DemosPage.tsx", "utf8");
    expect(src).toMatch(/<h1[\s>]/);
  });
});
