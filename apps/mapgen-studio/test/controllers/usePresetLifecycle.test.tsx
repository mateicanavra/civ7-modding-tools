// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./_setup";

// Spy on the pure config builders so we can count apply/reset invocations WITHOUT
// mocking the preset-resolution chain — `usePresets` / `mergeBuiltInPresets` /
// `toRepoBackedPreset` run for real so the `===` identity guards (ADD-1/ADD-1b)
// are exercised end-to-end, not against a stand-in. The spies wrap the real impls.
vi.mock("../../src/features/configOverrides/configBuilders", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../src/features/configOverrides/configBuilders")>();
  return {
    ...actual,
    applyPresetConfig: vi.fn(actual.applyPresetConfig),
    buildDefaultConfig: vi.fn(actual.buildDefaultConfig),
  };
});

import type { PipelineConfig } from "@swooper/mapgen-studio-ui/types";
import {
  type UsePresetLifecycleArgs,
  usePresetLifecycle,
} from "../../src/app/hooks/usePresetLifecycle";
import { LIVE_GAME_PRESET_ID, LIVE_GAME_PRESET_KEY } from "../../src/features/civ7Setup/livePreset";
import { DEFAULT_CIV7_STUDIO_SETUP_CONFIG } from "../../src/features/civ7Setup/setupConfig";
import {
  applyPresetConfig,
  buildDefaultConfig,
} from "../../src/features/configOverrides/configBuilders";
import { buildPresetExportFile } from "../../src/features/presets/importExport";
import type { BuiltInPreset } from "../../src/recipes/catalog";
import { DEFAULT_STUDIO_RECIPE_ID, getRecipeArtifacts } from "../../src/recipes/catalog";
import { DEFAULT_RECIPE_SETTINGS, DEFAULT_WORLD_SETTINGS } from "../../src/ui/constants/defaults";

const applySpy = vi.mocked(applyPresetConfig);
const buildSpy = vi.mocked(buildDefaultConfig);

const RECIPE = DEFAULT_STUDIO_RECIPE_ID;
const artifacts = getRecipeArtifacts(RECIPE);
// A real, schema-valid config object (stable identity) used as the saved/preset config.
const VALID_CFG = buildDefaultConfig(
  artifacts.configSchema,
  artifacts.uiMeta,
  artifacts.defaultConfig
) as PipelineConfig;
const SAVED_CFG = { ...VALID_CFG } as PipelineConfig;
const SAVED_PRESET: BuiltInPreset = { id: "saved-cfg", label: "Saved", config: SAVED_CFG };
const OVERRIDES = { [RECIPE]: { "saved-cfg": SAVED_PRESET } };

function makeProps(over: Partial<UsePresetLifecycleArgs> = {}): UsePresetLifecycleArgs {
  return {
    recipeSettings: { ...DEFAULT_RECIPE_SETTINGS, recipe: RECIPE, preset: "none" },
    repoBackedPresetOverridesByRecipe: {},
    livePresets: [],
    pipelineConfig: VALID_CFG,
    setWorldSettings: vi.fn(),
    setSetupConfig: vi.fn(),
    setPipelineConfig: vi.fn(),
    setOverridesDisabled: vi.fn(),
    setRecipeSettings: vi.fn(),
    setRepoBackedPresetOverridesByRecipe: vi.fn(),
    setLastRunSnapshot: vi.fn(),
    toast: vi.fn(),
    ...over,
  };
}

function setup(over: Partial<UsePresetLifecycleArgs> = {}) {
  const props = makeProps(over);
  const { result, rerender } = renderHook((p: UsePresetLifecycleArgs) => usePresetLifecycle(p), {
    initialProps: props,
  });
  const withPreset = (preset: string) =>
    rerender({ ...props, recipeSettings: { ...props.recipeSettings, preset } });
  return { result, rerender, props, withPreset };
}

const order = (fn: ReturnType<typeof vi.fn>) => fn.mock.invocationCallOrder[0];

beforeEach(() => {
  localStorage.clear();
  applySpy.mockClear();
  buildSpy.mockClear();
});
afterEach(() => {
  vi.clearAllMocks();
});

describe("usePresetLifecycle — markPresetApplied / applyAuthoringSnapshot identity contracts", () => {
  it("ADD-1: markPresetApplied stores the EXACT config so the post-save apply-effect skip-guard short-circuits", () => {
    const { result, props, withPreset } = setup({ repoBackedPresetOverridesByRecipe: OVERRIDES });
    applySpy.mockClear();
    // Mimic the host save path: record the saved preset BEFORE the key flip.
    act(() => result.current.markPresetApplied({ key: "builtin:saved-cfg", config: SAVED_CFG }));
    withPreset("builtin:saved-cfg");
    // resolvePreset("builtin:saved-cfg").config === SAVED_CFG === lastApplied.config → skip.
    expect(applySpy).toHaveBeenCalledTimes(0);
    expect(props.setPipelineConfig).not.toHaveBeenCalled();
  });

  it("ADD-1b: applyAuthoringSnapshot records snapshot.pipelineConfig by reference (no re-apply) and writes the 5 setters in order", () => {
    const LIVE_CFG = { ...VALID_CFG } as PipelineConfig;
    const livePresets = [{ id: LIVE_GAME_PRESET_ID, label: "Live Game", config: LIVE_CFG }];
    const { result, props, withPreset } = setup({ livePresets });
    applySpy.mockClear();
    act(() =>
      result.current.applyAuthoringSnapshot({
        key: LIVE_GAME_PRESET_KEY,
        worldSettings: DEFAULT_WORLD_SETTINGS,
        pipelineConfig: LIVE_CFG,
        setupConfig: DEFAULT_CIV7_STUDIO_SETUP_CONFIG,
        recipeSettings: { ...props.recipeSettings, preset: LIVE_GAME_PRESET_KEY },
      })
    );
    withPreset(LIVE_GAME_PRESET_KEY);
    // resolvePreset(LIVE_GAME_PRESET_KEY).config === LIVE_CFG === lastApplied.config → skip.
    expect(applySpy).toHaveBeenCalledTimes(0);
    // 5-setter ordered write: world → pipeline → setup → overrides → recipe.
    expect(order(props.setWorldSettings)).toBeLessThan(order(props.setPipelineConfig));
    expect(order(props.setPipelineConfig)).toBeLessThan(order(props.setSetupConfig));
    expect(order(props.setSetupConfig)).toBeLessThan(order(props.setOverridesDisabled));
    expect(order(props.setOverridesDisabled)).toBeLessThan(order(props.setRecipeSettings));
    expect(props.setOverridesDisabled).toHaveBeenCalledWith(false);
  });
});

describe("usePresetLifecycle — preset apply-effects (PL-2..6, Tier-A)", () => {
  it("PL-2/PL-4/PL-5: a resolvable preset applies once; a same-key re-render does not re-apply", () => {
    const { props, withPreset } = setup({ repoBackedPresetOverridesByRecipe: OVERRIDES });
    applySpy.mockClear();
    withPreset("builtin:saved-cfg");
    expect(applySpy).toHaveBeenCalledTimes(1);
    expect(props.setPipelineConfig).toHaveBeenCalledTimes(1);
    // Ref advanced synchronously inside the apply → a same-key re-render skips.
    withPreset("builtin:saved-cfg");
    expect(applySpy).toHaveBeenCalledTimes(1);
  });

  it("PL-2: an unresolvable preset key sets presetError and leaves the config untouched", () => {
    const { result, props, withPreset } = setup({ repoBackedPresetOverridesByRecipe: OVERRIDES });
    applySpy.mockClear();
    withPreset("builtin:does-not-exist");
    expect(applySpy).toHaveBeenCalledTimes(0);
    expect(props.setPipelineConfig).not.toHaveBeenCalled();
    expect(result.current.presetError?.title).toBe("Preset not found");
    expect(props.toast).toHaveBeenCalledWith("Preset not found", { variant: "error" });
  });

  it("PL-3/PL-6: switching to 'none' resets via buildDefaultConfig + clears the ref, so re-selecting the same key re-applies", () => {
    const { props, withPreset } = setup({ repoBackedPresetOverridesByRecipe: OVERRIDES });
    withPreset("builtin:saved-cfg");
    applySpy.mockClear();
    buildSpy.mockClear();
    // → none: the reseed effect runs buildDefaultConfig + setLastRunSnapshot(null), and
    // the ref is cleared. NOTE: the clear is written redundantly by BOTH the reseed effect
    // and the apply-effect's `kind==='none'` branch — so the re-apply assertion below pins
    // that AT LEAST ONE clear survives (removing both is the real falsifier); buildSpy /
    // setLastRunSnapshot pin the reseed body directly.
    withPreset("none");
    expect(buildSpy).toHaveBeenCalledTimes(1);
    expect(props.setLastRunSnapshot).toHaveBeenCalledWith(null);
    expect(applySpy).toHaveBeenCalledTimes(0);
    // → same key again: ref was nulled → guard fails → re-applies.
    withPreset("builtin:saved-cfg");
    expect(applySpy).toHaveBeenCalledTimes(1);
  });
});

describe("usePresetLifecycle — delete + import handlers (PL-10, PL-15)", () => {
  it("PL-15: handleDeletePreset does NOT reset when the selected preset is not local", () => {
    const { result, props } = setup({
      recipeSettings: { ...DEFAULT_RECIPE_SETTINGS, recipe: RECIPE, preset: "builtin:saved-cfg" },
      repoBackedPresetOverridesByRecipe: OVERRIDES,
    });
    act(() => result.current.handleDeletePreset());
    expect(props.setRecipeSettings).not.toHaveBeenCalled();
    expect(props.toast).toHaveBeenCalledWith("Select a scratch config to delete.", {
      variant: "info",
    });
  });

  it("PL-15: handleDeletePreset resets to 'none' when a local scratch preset is deleted", () => {
    const { result, props, rerender } = setup();
    let localId = "";
    act(() => {
      localId = result.current.presetActions.saveAsNew({
        recipeId: RECIPE,
        label: "Scratch",
        config: VALID_CFG,
      }).preset.id;
    });
    rerender({ ...props, recipeSettings: { ...props.recipeSettings, preset: `local:${localId}` } });
    act(() => result.current.handleDeletePreset());
    expect(props.setRecipeSettings).toHaveBeenCalled();
    const updater = props.setRecipeSettings.mock.calls.at(-1)?.[0] as (
      prev: typeof props.recipeSettings
    ) => typeof props.recipeSettings;
    expect(updater(props.recipeSettings)).toMatchObject({ preset: "none" });
  });

  it("PL-15: handleDeletePreset does NOT reset when a local preset is selected but nothing was deleted", () => {
    const { result, props } = setup({
      recipeSettings: { ...DEFAULT_RECIPE_SETTINGS, recipe: RECIPE, preset: "local:nonexistent" },
    });
    act(() => result.current.handleDeletePreset());
    // deleteLocal → { deleted:false } → the reset is gated on `deleted`, so it must NOT fire.
    expect(props.setRecipeSettings).not.toHaveBeenCalled();
  });

  it("PL-10: a cross-recipe import file stages pendingImport and does NOT apply it (no resolve attempt)", async () => {
    const built = buildPresetExportFile({
      recipeId: "some-other-recipe",
      preset: { label: "Foreign", config: VALID_CFG },
    });
    const file = new File([built.json], built.filename, { type: "application/json" });
    const { result, props } = setup();
    await act(async () => {
      await result.current.handleImportFileChange({
        target: { files: [file], value: "" },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.pendingImport?.recipeId).toBe("some-other-recipe");
    // Not applied: no recipe switch and no resolve-failure error surfaced.
    expect(props.setRecipeSettings).not.toHaveBeenCalled();
    expect(result.current.presetError).toBeNull();
    // cancel clears the staged import.
    act(() => result.current.cancelImportSwitch());
    expect(result.current.pendingImport).toBeNull();
  });

  it("PL-10: a same-recipe import applies immediately (no confirm gate)", async () => {
    const built = buildPresetExportFile({
      recipeId: RECIPE,
      preset: { label: "Imported", config: VALID_CFG },
    });
    const file = new File([built.json], built.filename, { type: "application/json" });
    const { result, props } = setup();
    await act(async () => {
      await result.current.handleImportFileChange({
        target: { files: [file], value: "" },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.pendingImport).toBeNull();
    expect(props.setRecipeSettings).toHaveBeenCalled();
  });
});
