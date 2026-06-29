/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
import hookSource from "../../src/app/hooks/usePresetLifecycle.ts?raw";
import hostSource from "../../src/app/StudioShell.tsx?raw";

// Strip comments so doc-comments (which legitimately name effects/refs/contracts)
// don't trip the ordering matchers.
const host = hostSource.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const hook = hookSource.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

describe("usePresetLifecycle source — Tier-A effects + sole-owner ref", () => {
  it("PL-3: the reseed effect (none-reset) is declared BEFORE the apply effect (Tier-A order)", () => {
    const reseedIdx = hook.indexOf("setLastRunSnapshot(null)");
    const applyIdx = hook.indexOf("applyPresetConfig({");
    expect(reseedIdx).toBeGreaterThan(-1);
    expect(applyIdx).toBeGreaterThan(-1);
    // Splitting these across hooks (apply-before-reset) yields a non-none preset
    // showing defaults-only for one render.
    expect(reseedIdx).toBeLessThan(applyIdx);
  });

  it("owns exactly the 3 preset lifecycle effects", () => {
    expect(hook.match(/useEffect\(/g)).toHaveLength(3);
  });

  it("is the SOLE owner+reader of lastAppliedPresetRef (host no longer references it)", () => {
    expect(hook).toMatch(/const lastAppliedPresetRef = useRef</);
    expect(host).not.toMatch(/lastAppliedPresetRef/);
  });
});

describe("usePresetLifecycle source — contract bodies (identity-preserving)", () => {
  it("ADD-1: markPresetApplied stores the snapshot by reference (no clone / rewrap)", () => {
    // The single out-of-effect writer assigns the passed object verbatim.
    expect(hook).toMatch(/lastAppliedPresetRef\.current = snapshot;/);
    // No structural copy anywhere in the hook would silently break the === guard.
    expect(hook).not.toMatch(/structuredClone/);
    expect(hook).not.toMatch(/JSON\.parse\(JSON\.stringify/);
    // The in-effect self-write keeps resolved.config un-rewrapped.
    expect(hook).toMatch(
      /lastAppliedPresetRef\.current = \{ key: nextKey, config: resolved\.config \};/
    );
  });

  it("applyAuthoringSnapshot calls markPresetApplied FIRST, then the 5 setters in order", () => {
    const mark = hook.indexOf(
      "markPresetApplied({ key: snapshot.key, config: snapshot.pipelineConfig })"
    );
    const world = hook.indexOf("setWorldSettings(snapshot.worldSettings)");
    const pipeline = hook.indexOf("setPipelineConfig(snapshot.pipelineConfig)");
    const setup = hook.indexOf("setSetupConfig(snapshot.setupConfig)");
    // `setOverridesDisabled(false)` also appears in the reseed effect — anchor the
    // search inside the applyAuthoringSnapshot block (after the setupConfig write).
    const overrides = hook.indexOf("setOverridesDisabled(false)", setup);
    const recipe = hook.indexOf("setRecipeSettings(snapshot.recipeSettings)");
    for (const idx of [mark, world, pipeline, setup, overrides, recipe]) {
      expect(idx).toBeGreaterThan(-1);
    }
    expect(mark).toBeLessThan(world);
    expect(world).toBeLessThan(pipeline);
    expect(pipeline).toBeLessThan(setup);
    expect(setup).toBeLessThan(overrides);
    expect(overrides).toBeLessThan(recipe);
  });
});

describe("StudioShell source — 2.8 seam (preset lifecycle no longer host-owned)", () => {
  it("calls usePresetLifecycle and destructures the two synthesized contracts", () => {
    expect(host).toMatch(/} = usePresetLifecycle\(\{/);
    expect(host).toMatch(/markPresetApplied,/);
    expect(host).toMatch(/applyAuthoringSnapshot,/);
  });

  it("no longer owns the catalog/apply-effect surface (recipeArtifacts/usePresets/applyPresetConfig)", () => {
    expect(host).not.toMatch(/const recipeArtifacts = useMemo/);
    expect(host).not.toMatch(/usePresets\(/);
    expect(host).not.toMatch(/applyPresetConfig\(/);
  });

  it("PL-7/PL-11: the save handlers call markPresetApplied BEFORE the key-flip setRecipeSettings", () => {
    const markIdx = host.indexOf("markPresetApplied({ key: `builtin:${id}`, config: sanitized })");
    const flipIdx = host.indexOf(
      "setRecipeSettings((prev) => ({ ...prev, preset: `builtin:${id}` }))"
    );
    expect(markIdx).toBeGreaterThan(-1);
    expect(flipIdx).toBeGreaterThan(-1);
    // Ref written after the key flip → apply-effect re-applies and reverts the just-saved config.
    expect(markIdx).toBeLessThan(flipIdx);
  });

  it("syncStudioFromLiveGame routes through applyAuthoringSnapshot (no inline 5-setter block)", () => {
    expect(host).toMatch(/applyAuthoringSnapshot\(\{/);
  });
});
