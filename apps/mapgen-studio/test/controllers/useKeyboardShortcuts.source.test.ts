/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
import source from "../../src/app/hooks/useKeyboardShortcuts.ts?raw";

/**
 * Structural guards for the global-shortcut listener. Comments are stripped
 * first so the doc-comment (which legitimately names `triggerRun`/`reroll` and
 * describes the re-subscribe hazard) doesn't trip the matchers.
 */
const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

describe("useKeyboardShortcuts source — render-phase latest-ref write (KB-1)", () => {
  it("mirrors the live context through useLatestRef, not a manual render-phase write", () => {
    expect(code).toMatch(/const shortcutsRef = useLatestRef\(context\)/);
    // No hand-rolled `shortcutsRef.current = {...}` write (that's what
    // useLatestRef now owns); only the read `const ctx = shortcutsRef.current`.
    expect(code).not.toMatch(/shortcutsRef\.current\s*=/);
  });
});

describe("useKeyboardShortcuts source — install-once listener reading ctx at invocation (KB-2)", () => {
  it("registers exactly one keydown listener and tears it down symmetrically", () => {
    expect(code.match(/addEventListener\("keydown"/g)).toHaveLength(1);
    expect(code.match(/removeEventListener\("keydown"/g)).toHaveLength(1);
  });

  it("uses a single effect with empty deps so the listener is not re-subscribed per render", () => {
    expect(code.match(/useEffect\(/g)).toHaveLength(1);
    expect(code).toMatch(/\},\s*\[\]\s*\);/);
  });

  it("reads the latest values via shortcutsRef.current, never capturing `context` directly", () => {
    expect(code).toMatch(/const ctx = shortcutsRef\.current/);
    // Capturing `context.run`/`context.stages` etc. in the effect closure is
    // the stale-capture falsifier — the hook must go through the ref instead.
    expect(code).not.toMatch(/context\./);
  });
});
