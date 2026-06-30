/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
// Vite `?raw` import inlines the hook's source text. Vite resolves it relative
// to this file, so it works under any cwd and in both node and jsdom envs —
// unlike `import.meta.url`, which Vite's module runner serves as an `http:` URL.
import useLatestRefSource from "../../src/app/hooks/useLatestRef.ts?raw";

/**
 * IMPROVE-2 gating (structural) — `useLatestRef` syncs via a render-phase write
 * (`ref.current = value`), never through an effect. An effect-based sync would
 * silently regress the hook to lag one commit behind; the behavioral test
 * catches that dynamically, and this guard catches it the instant the source
 * changes.
 */
describe("useLatestRef source (IMPROVE-2)", () => {
  it("contains no effect-based sync — render-phase write only", () => {
    // The doc comment legitimately *describes* effects; strip comments before
    // matching so the guard only inspects executable code.
    const code = useLatestRefSource
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");
    expect(code).not.toMatch(/\buseEffect\b/);
    expect(code).not.toMatch(/\buseLayoutEffect\b/);
    expect(code).toMatch(/ref\.current\s*=\s*value/);
  });
});
