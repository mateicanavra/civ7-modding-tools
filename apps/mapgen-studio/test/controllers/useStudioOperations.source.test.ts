/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
import source from "../../src/app/hooks/useStudioOperations.ts?raw";

/**
 * Structural guards for the coordination layer. Comments are stripped first so
 * the doc-comment (which legitimately *describes* effects/error/status) doesn't
 * trip the matchers.
 */
const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

describe("useStudioOperations source — synchronous busy gate (BG-1 / BR-12)", () => {
  it("has no effect-based republish of the busy booleans", () => {
    expect(code).not.toMatch(/\buseEffect\b/);
    expect(code).not.toMatch(/\buseLayoutEffect\b/);
  });

  it("derives both busy booleans as plain render-scope consts from op status", () => {
    expect(code).toMatch(/const saveDeployRunning = saveDeployOperation\?\.status === "running"/);
    expect(code).toMatch(/const runInGameRunning = runInGameOperation\?\.status === "running"/);
  });

  it("mirrors op state through useLatestRef, not a hand-rolled render-phase ref write", () => {
    expect(code).toMatch(/useLatestRef\(runInGameOperation\)/);
    expect(code).toMatch(/useLatestRef\(saveDeployOperation\)/);
    expect(code).not.toMatch(/Ref\.current\s*=/);
  });
});

describe("useStudioOperations source — partition (ADD-2)", () => {
  it("does NOT derive error/status or touch browserRunner — those stay host-owned", () => {
    // error/status additionally depend on browserRunner.state, owned by
    // useBrowserRun; deriving them here would reintroduce the init-order
    // dependency this layer exists to remove.
    expect(code).not.toMatch(/browserRunner/);
    expect(code).not.toMatch(/const status\b/);
    expect(code).not.toMatch(/localError \?\?/);
  });
});
