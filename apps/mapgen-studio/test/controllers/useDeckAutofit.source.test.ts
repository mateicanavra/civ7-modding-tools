/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
import hookSource from "../../src/app/hooks/useDeckAutofit.ts?raw";
import hostSource from "../../src/app/StudioShell.tsx?raw";

const host = hostSource.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const hook = hookSource.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

describe("useDeckAutofit source — ordered pair + co-located guard refs (VL-5 / LS-7)", () => {
  it("LS-7: both guard refs are declared in the SAME hook scope", () => {
    expect(hook).toMatch(/const hasEverSeenVizManifestRef = useRef/);
    expect(hook).toMatch(/const lastAutoFitSpaceRef = useRef/);
  });

  it("VL-5 / LS-7: the per-space effect precedes the first-manifest effect in source order", () => {
    const perSpace = hook.indexOf("const spaceId = viz.effectiveLayer?.spaceId ?? null;");
    const firstManifest = hook.indexOf("hasEverSeenVizManifestRef.current = true;");
    expect(perSpace).toBeGreaterThan(-1);
    expect(firstManifest).toBeGreaterThan(-1);
    // Reversed order → the space-change fit would win the shared commit and set the
    // wrong initial camera.
    expect(perSpace).toBeLessThan(firstManifest);
  });

  it("hook: contains exactly the 2 autofit effects (the ordered pair, nothing else)", () => {
    expect(hook.match(/useEffect\(/g)).toHaveLength(2);
  });
});

describe("StudioShell source — autofit no longer host-owned (2.7b boundary)", () => {
  it("calls useDeckAutofit with the deck handle + viewport + viz projection", () => {
    expect(host).toMatch(
      /const \{ handleFitView \} = useDeckAutofit\(\{ deckApiRef, viewportSize, deckApiReadyTick, viz \}\);/
    );
  });

  it("wires the Fit button to the hook's handler (no inline closure)", () => {
    expect(host).toMatch(/onFitView=\{handleFitView\}/);
  });

  it("no longer declares the autofit guard refs or effects", () => {
    expect(host).not.toMatch(/hasEverSeenVizManifestRef/);
    expect(host).not.toMatch(/lastAutoFitSpaceRef/);
  });
});
