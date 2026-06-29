/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
import source from "../../src/app/hooks/useViewportLayout.ts?raw";

/**
 * VL-6 (structural) — the recipe-DAG query is fetch-gated on the pipeline view.
 * The falsifier is a copy-paste regression to eager `enabled: true` (the shape
 * sibling queries use), which would fetch the DAG for every recipe on first
 * mount regardless of whether the pipeline tab is open. The behavioral test
 * proves the gate dynamically; this pins the literal so the gate can't silently
 * drift.
 */
describe("useViewportLayout source (VL-6)", () => {
  it("gates the recipe DAG query on the pipeline view", () => {
    const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    expect(code).toMatch(/enabled:\s*stageView === "pipeline"/);
  });
});
