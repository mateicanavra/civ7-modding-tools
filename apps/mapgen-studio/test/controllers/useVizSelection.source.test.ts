/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
import hookSource from "../../src/app/hooks/useVizSelection.ts?raw";
import hostSource from "../../src/app/StudioShell.tsx?raw";

// Strip comments so doc-comments (which legitimately name effects/cascade members)
// don't trip the ordering matchers. The eslint-disable assertion uses RAW source.
const host = hostSource.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const hook = hookSource.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

describe("useVizSelection source — render-phase + atomic ordering invariants", () => {
  it("LS-6: overlayDataTypeKey is derived in render scope BEFORE the internal useVizState", () => {
    const keyIdx = hook.indexOf(
      "const overlayDataTypeKey = overlaySelection?.overlayDataTypeKey ?? null;"
    );
    const vizIdx = hook.indexOf("useVizState({");
    expect(keyIdx).toBeGreaterThan(-1);
    expect(vizIdx).toBeGreaterThan(-1);
    // Forward edge of the overlay cycle: moving this into state/effect would feed
    // useVizState a stale `null` for one render.
    expect(keyIdx).toBeLessThan(vizIdx);
  });

  it("SS atomic group 1: stage-clamp → step-clamp → viz-sync in source order", () => {
    const stageClamp = hook.indexOf("setSelectedStageId((prev) =>");
    const stepClamp = hook.indexOf("setSelectedStepId((prev) =>");
    const vizSync = hook.indexOf("viz.setSelectedStepId(selectedStepId)");
    expect(stageClamp).toBeGreaterThan(-1);
    expect(stepClamp).toBeGreaterThan(-1);
    expect(vizSync).toBeGreaterThan(-1);
    expect(stageClamp).toBeLessThan(stepClamp);
    expect(stepClamp).toBeLessThan(vizSync);
  });

  it("SS-4: viz-sync keeps the exhaustive-deps suppression (deps [selectedStepId]) + dedupe guard", () => {
    // The dedupe guard reads viz.selectedStepId but it is excluded from the deps.
    expect(hook).toMatch(/if \(viz\.selectedStepId === selectedStepId\) return;/);
    // The suppression is intentional and load-bearing (RAW source — it IS a comment).
    expect(hookSource).toMatch(
      /eslint-disable-next-line react-hooks\/exhaustive-deps\n\s*\}, \[selectedStepId\]\);/
    );
  });

  it("EO-1: era/overlay atomic group keeps source order (manualEra-clamp → overlay-prune → overlay-variant-pref)", () => {
    const clampIdx = hook.indexOf(
      "setManualEra((prev) => clampNumber(prev, eraRange.min, eraRange.max))"
    );
    const pruneIdx = hook.indexOf('setOverlaySelectionId("")');
    const prefIdx = hook.indexOf("findVariantKeyForEra(availableVariants, manualEra)");
    expect(clampIdx).toBeGreaterThan(-1);
    expect(pruneIdx).toBeGreaterThan(-1);
    expect(prefIdx).toBeGreaterThan(-1);
    // The overlay-variant-pref output PERSISTS, so reversal is a real bug.
    expect(clampIdx).toBeLessThan(pruneIdx);
    expect(pruneIdx).toBeLessThan(prefIdx);
  });

  it("hook: contains exactly the 6 cascade effects (Tier-A atomicity)", () => {
    expect(hook.match(/useEffect\(/g)).toHaveLength(6);
  });

  it("hook: exposes the raw viz handle by value (no new memoization of viz)", () => {
    expect(hook).toMatch(/return \{\s*viz,/);
    expect(hook).not.toMatch(/const viz = useMemo/);
  });
});

describe("StudioShell source — 2.7 seam + cascade no longer host-owned", () => {
  it("calls useVizSelection threading recipe/recipeArtifacts/browserRunning and destructures viz", () => {
    expect(host).toMatch(/} = useVizSelection\(\{/);
    expect(host).toMatch(/recipe: recipeSettings\.recipe,/);
    expect(host).toMatch(/recipeArtifacts,/);
    expect(host).toMatch(/browserRunning,/);
  });

  it("keeps the vizIngestRef sink wiring in host render scope (the 2.6↔2.7 seam)", () => {
    expect(host).toMatch(/\n {2}vizIngestRef\.current = viz\.ingest;/);
  });

  it("keeps deck-autofit refs + backgroundGridEnabled host-side reading viz BY VALUE (2.7b boundary)", () => {
    expect(host).toMatch(/hasEverSeenVizManifestRef/);
    expect(host).toMatch(/lastAutoFitSpaceRef/);
    expect(host).toMatch(/const backgroundGridEnabled = useMemo/);
  });

  it("no longer owns the viz cascade (selectLayerFor / dataTypeModel / useVizState moved out)", () => {
    expect(host).not.toMatch(/const selectLayerFor = useCallback/);
    expect(host).not.toMatch(/const dataTypeModel = viz\.dataTypeModel/);
    expect(host).not.toMatch(/useVizState\(/);
  });
});
