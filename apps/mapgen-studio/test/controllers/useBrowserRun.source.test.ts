/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
import hostSource from "../../src/app/StudioShell.tsx?raw";
import hookSource from "../../src/app/hooks/useBrowserRun.ts?raw";

// Strip comments so doc-comments (which legitimately name effects/errors/etc.)
// don't trip the matchers.
const host = hostSource.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const hook = hookSource.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

describe("StudioShell source — viz-ingest sink stays render-scope (BR-11)", () => {
  it("assigns vizIngestRef.current = viz.ingest in render scope, NOT inside an effect", () => {
    // Exactly two leading spaces = directly in the component body (render scope).
    // An effect/callback body would indent it 4+ spaces; this is the BR-11 falsifier
    // ("moved into an effect → early VizEvents dropped to the stale no-op ingest").
    expect(host).toMatch(/\n {2}vizIngestRef\.current = viz\.ingest;/);
    // The sink is read through the ref by the stable handler, never closed over directly.
    expect(host).toMatch(/vizIngestRef\.current\?\.\(event\)/);
  });
});

describe("StudioShell source — browserRunning + busy threading stay render-scope (BR-12)", () => {
  it("derives browserRunning in render scope and threads it + the busy flags into useBrowserRun", () => {
    expect(host).toMatch(/\n {2}const browserRunning = browserRunner\.state\.running;/);
    // The runner instance is host-owned (must precede the host `viz` call); the
    // command surface receives the runner actions + browserRunning + threaded
    // busy flags by value.
    expect(host).toMatch(/useBrowserRun\(\{/);
    expect(host).toMatch(/runnerActions: browserRunner\.actions/);
    expect(host).toMatch(/browserRunning,/);
    expect(host).toMatch(/runInGameRunning,/);
    expect(host).toMatch(/saveDeployRunning,/);
  });

  it("keeps the composite error/status host-derived (not absorbed into the hook)", () => {
    expect(host).toMatch(/const error = localError \?\? browserRunner\.state\.error/);
    expect(host).toMatch(/const status: GenerationStatus = browserRunning \?/);
  });
});

describe("useBrowserRun source — atomic trio + partition", () => {
  it("co-locates exactly the three auto-run effects in one hook (atomicity)", () => {
    expect(hook.match(/useEffect\(/g)).toHaveLength(3);
  });

  it("receives the busy flags as params — never re-derives them via useStudioOperations", () => {
    expect(hook).not.toMatch(/useStudioOperations/);
    expect(hook).toMatch(/runInGameRunning/);
    expect(hook).toMatch(/saveDeployRunning/);
  });

  it("reads its own authoring/run store slices directly", () => {
    expect(hook).toMatch(/useAuthoringStore/);
    expect(hook).toMatch(/useRunStore/);
  });

  it("does NOT own the composite error/status (those stay host-derived)", () => {
    expect(hook).not.toMatch(/localError \?\?/);
    expect(hook).not.toMatch(/const status\b/);
  });
});
