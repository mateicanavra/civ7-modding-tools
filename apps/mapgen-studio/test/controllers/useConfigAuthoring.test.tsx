// @vitest-environment jsdom

import type { MapConfigEnvelope } from "@civ7/studio-contract";
import { act, renderHook } from "@testing-library/react";
import type { ChangeEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import "./_setup";
import {
  type UseConfigAuthoringArgs,
  useConfigAuthoring,
} from "../../src/app/hooks/useConfigAuthoring";
import { getRecipeDefaultCanonicalConfig } from "../../src/features/configAuthoring/canonicalConfig";
import { getRecipeArtifacts } from "../../src/recipes/catalog";

const defaultConfig = getRecipeDefaultCanonicalConfig("standard");

function setup(canonicalConfig: MapConfigEnvelope = defaultConfig) {
  const args: UseConfigAuthoringArgs = {
    canonicalConfig,
    setCanonicalConfig: vi.fn(),
    toast: vi.fn(),
  };
  const view = renderHook((current: UseConfigAuthoringArgs) => useConfigAuthoring(current), {
    initialProps: args,
  });
  return { ...view, args };
}

function importEvent(text: string): ChangeEvent<HTMLInputElement> {
  return {
    target: {
      files: [{ text: async () => text }],
      value: "selected.config.json",
    },
  } as unknown as ChangeEvent<HTMLInputElement>;
}

describe("useConfigAuthoring", () => {
  it("installs exact frozen catalog and recipe configs atomically", () => {
    const artifacts = getRecipeArtifacts("standard");
    const catalogConfig = artifacts.catalogConfigs.find((config) => config.id !== defaultConfig.id);
    if (catalogConfig === undefined) throw new Error("Standard catalog fixture is missing");
    const { result, args } = setup();

    act(() => result.current.selectConfig(catalogConfig.id));
    expect(args.setCanonicalConfig).toHaveBeenLastCalledWith(catalogConfig);

    act(() => result.current.selectRecipe("standard"));
    expect(args.setCanonicalConfig).toHaveBeenLastCalledWith(artifacts.defaultCanonicalConfig);
    expect(Object.isFrozen(artifacts.defaultCanonicalConfig)).toBe(true);
    expect(artifacts.defaultCanonicalConfig).not.toHaveProperty("source");
    expect(artifacts.defaultCanonicalConfig).not.toHaveProperty("preset");
  });

  it("edits only config payload while preserving envelope identity and catalog authority", () => {
    const artifacts = getRecipeArtifacts("standard");
    const beforeCatalog = structuredClone(artifacts.catalogConfigs);
    const { result, args } = setup();

    act(() => result.current.setPipelineConfig(structuredClone(defaultConfig.config)));

    const installed = vi.mocked(args.setCanonicalConfig).mock.calls[0]?.[0];
    expect(installed).toBeDefined();
    expect(installed).not.toBe(defaultConfig);
    expect(installed).toMatchObject({
      id: defaultConfig.id,
      name: defaultConfig.name,
      description: defaultConfig.description,
      recipe: defaultConfig.recipe,
      sortIndex: defaultConfig.sortIndex,
      latitudeBounds: defaultConfig.latitudeBounds,
    });
    expect(Object.isFrozen(installed)).toBe(true);
    expect(artifacts.catalogConfigs).toEqual(beforeCatalog);
  });

  it("resets only recipe values while preserving envelope identity, metadata, and latitude bounds", () => {
    const authored = {
      ...defaultConfig,
      id: "saved-config",
      name: "Saved Config",
      description: "User-authored metadata.",
      sortIndex: 41,
      latitudeBounds: { topLatitude: 67, bottomLatitude: -42 },
      config: { ...defaultConfig.config },
    };
    const { result, args } = setup(authored);

    act(() => result.current.setPipelineConfig(defaultConfig.config));

    expect(args.setCanonicalConfig).toHaveBeenCalledWith({
      ...authored,
      config: defaultConfig.config,
    });
  });

  it("imports one exact frozen envelope and leaves state unchanged on refusal", async () => {
    const { result, args } = setup();
    await act(async () => {
      await result.current.importFile(importEvent(JSON.stringify(defaultConfig)));
    });

    const imported = vi.mocked(args.setCanonicalConfig).mock.calls[0]?.[0];
    expect(imported).toEqual(defaultConfig);
    expect(Object.isFrozen(imported)).toBe(true);
    expect(imported).not.toHaveProperty("source");
    expect(imported).not.toHaveProperty("preset");

    vi.mocked(args.setCanonicalConfig).mockClear();
    await act(async () => {
      await result.current.importFile(
        importEvent(JSON.stringify({ canonicalConfig: defaultConfig }))
      );
    });

    expect(args.setCanonicalConfig).not.toHaveBeenCalled();
    expect(args.toast).toHaveBeenLastCalledWith(expect.stringContaining("Config import failed"), {
      variant: "error",
    });
  });
});
