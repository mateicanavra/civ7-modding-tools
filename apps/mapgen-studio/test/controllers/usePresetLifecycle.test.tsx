// @vitest-environment jsdom

import type { PipelineConfig } from "@swooper/mapgen-studio-ui/types";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./_setup";
import {
  type UsePresetLifecycleArgs,
  usePresetLifecycle,
} from "../../src/app/hooks/usePresetLifecycle";
import {
  admitPipelineConfig,
  createStudioEditorCanonicalConfig,
} from "../../src/features/configAuthoring/canonicalConfig";
import { DEFAULT_STUDIO_RECIPE_ID, getRecipeArtifacts } from "../../src/recipes/catalog";
import { DEFAULT_RECIPE_SETTINGS } from "../../src/ui/constants/defaults";

const recipeArtifacts = getRecipeArtifacts(DEFAULT_STUDIO_RECIPE_ID);
const catalog = recipeArtifacts.studioBuiltInPresets?.[0];
if (!catalog) throw new Error("Expected a generated catalog config for lifecycle tests");
const editor = createStudioEditorCanonicalConfig();

function makeArgs(over: Partial<UsePresetLifecycleArgs> = {}): UsePresetLifecycleArgs {
  return {
    recipeSettings: { ...DEFAULT_RECIPE_SETTINGS },
    authoringConfigSource: { kind: "editor", canonicalConfig: editor },
    setAuthoringConfigSource: vi.fn(),
    setAuthoringSelection: vi.fn(),
    setConfigEditingEnabled: vi.fn(),
    setRecipeSettings: vi.fn(),
    setLastRunSnapshot: vi.fn(),
    toast: vi.fn(),
    ...over,
  };
}

function setup(over: Partial<UsePresetLifecycleArgs> = {}) {
  const props = makeArgs(over);
  const view = renderHook((current: UsePresetLifecycleArgs) => usePresetLifecycle(current), {
    initialProps: props,
  });
  return { ...view, props };
}

beforeEach(() => localStorage.clear());
afterEach(() => vi.clearAllMocks());

describe("usePresetLifecycle catalog/editor ownership", () => {
  it("selects a catalog config as a source-path reference rather than copying its bytes", () => {
    const { result, props } = setup();

    act(() =>
      result.current.applyRecipeSettingsChange({
        ...props.recipeSettings,
        preset: `builtin:${catalog.canonicalConfig.id}`,
      })
    );

    expect(props.setAuthoringSelection).toHaveBeenCalledWith(
      { kind: "catalog", sourcePath: catalog.sourcePath },
      { ...props.recipeSettings, preset: `builtin:${catalog.canonicalConfig.id}` }
    );
    expect(props.setAuthoringConfigSource).not.toHaveBeenCalled();
    expect(props.setRecipeSettings).not.toHaveBeenCalled();
  });

  it("turns a catalog edit into the visible editor-owned canonicalConfig", () => {
    const { result, props } = setup({
      recipeSettings: {
        ...DEFAULT_RECIPE_SETTINGS,
        preset: `builtin:${catalog.canonicalConfig.id}`,
      },
      authoringConfigSource: { kind: "catalog", sourcePath: catalog.sourcePath },
    });
    const admitted = admitPipelineConfig({
      schema: recipeArtifacts.configSchema,
      config: catalog.canonicalConfig.config,
      label: "edited-catalog-test",
    });
    if (!admitted.ok) throw new Error("Expected catalog config to be admitted");
    const edited: PipelineConfig = admitted.value;

    act(() => result.current.setPipelineConfig(edited));

    expect(props.setAuthoringSelection).toHaveBeenCalledTimes(1);
    const [nextSource, nextSettings] = vi.mocked(props.setAuthoringSelection).mock.calls[0] ?? [];
    expect(nextSource).toMatchObject({
      kind: "editor",
      canonicalConfig: { id: "studio-current", config: edited },
    });
    expect(nextSettings).toEqual({ ...props.recipeSettings, preset: "none" });
    if (!nextSource || nextSource.kind !== "editor") throw new Error("Expected editor source");
    expect(nextSource.canonicalConfig).not.toBe(catalog.canonicalConfig);
    expect(nextSource.canonicalConfig.id).not.toBe(catalog.canonicalConfig.id);
    expect(nextSource.canonicalConfig.config).not.toBe(edited);
    expect(Object.isFrozen(nextSource.canonicalConfig)).toBe(true);
  });

  it("does not infer a catalog source from a stale preset key during hydration", () => {
    const persistedEditor = createStudioEditorCanonicalConfig({
      metadata: {
        ...editor,
        id: "editor-after-catalog-edit",
        name: "Editor After Catalog Edit",
      },
    });
    const { props } = setup({
      recipeSettings: {
        ...DEFAULT_RECIPE_SETTINGS,
        preset: `builtin:${catalog.canonicalConfig.id}`,
      },
      authoringConfigSource: { kind: "editor", canonicalConfig: persistedEditor },
    });

    expect(props.setAuthoringConfigSource).not.toHaveBeenCalled();
    expect(props.setAuthoringSelection).not.toHaveBeenCalled();
  });

  it("rejects an invalid draft before it can become persisted editor state", () => {
    const { result, props } = setup({
      authoringConfigSource: { kind: "catalog", sourcePath: catalog.sourcePath },
    });

    act(() => result.current.setPipelineConfig({ invalid: true } as unknown as PipelineConfig));

    expect(props.setAuthoringConfigSource).not.toHaveBeenCalled();
    expect(props.setAuthoringSelection).not.toHaveBeenCalled();
    expect(props.toast).toHaveBeenCalledWith(
      "Config edit failed: config is invalid for this recipe.",
      expect.objectContaining({ variant: "error" })
    );
  });

  it("resolves catalog data from immutable generated artifacts on demand", () => {
    const { result } = setup();
    const resolved = result.current.resolvePreset(`builtin:${catalog.canonicalConfig.id}`);

    expect(Object.isFrozen(catalog.canonicalConfig)).toBe(true);
    expect(Object.isFrozen(catalog.canonicalConfig.config)).toBe(true);
    expect(resolved).toEqual({
      source: "builtin",
      id: catalog.canonicalConfig.id,
      label: catalog.canonicalConfig.name,
      description: catalog.canonicalConfig.description,
      sourcePath: catalog.sourcePath,
      canonicalConfig: catalog.canonicalConfig,
    });
  });

  it("recovers a missing catalog source only through the explicit recovery actions", () => {
    const { result, props } = setup({
      recipeSettings: {
        ...DEFAULT_RECIPE_SETTINGS,
        preset: "builtin:removed-config",
      },
      authoringConfigSource: {
        kind: "blocked",
        reason: "missing-catalog-source",
        sourcePath: "mods/mod-swooper-maps/src/maps/configs/removed-config.config.json",
      },
    });

    expect(result.current.pipelineConfig).toBeNull();
    expect(result.current.authoringBlockReason).toBe("missing-catalog-source");

    act(() => result.current.recoverWithCatalogConfig());
    expect(props.setAuthoringSelection).toHaveBeenCalledWith(
      { kind: "catalog", sourcePath: catalog.sourcePath },
      expect.objectContaining({ preset: `builtin:${catalog.canonicalConfig.id}` })
    );

    vi.clearAllMocks();
    act(() => result.current.recoverWithNewEditorConfig());
    const recovered = vi.mocked(props.setAuthoringSelection).mock.calls[0]?.[0];
    expect(recovered).toMatchObject({ kind: "editor" });
    if (!recovered || recovered.kind !== "editor") {
      throw new Error("Expected editor recovery source");
    }
    expect(
      admitPipelineConfig({
        schema: recipeArtifacts.configSchema,
        config: recovered.canonicalConfig.config,
        label: "recovered-editor-test",
      }).ok
    ).toBe(true);
  });

  it("never exposes an admitted run snapshot as a selectable config", () => {
    const { result } = setup();

    expect(result.current.presetOptions.some((option) => option.value.startsWith("live:"))).toBe(
      false
    );
    expect(result.current.resolvePreset("live:admitted-request")).toBeNull();
  });
});
