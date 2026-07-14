// @vitest-environment jsdom

import type { PipelineConfig } from "@swooper/mapgen-studio-ui/types";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./_setup";

vi.mock("../../src/features/mapConfigSave/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/features/mapConfigSave/api")>();
  return { ...actual, saveRepoBackedConfig: vi.fn() };
});

import { type UseSaveDeployArgs, useSaveDeploy } from "../../src/app/hooks/useSaveDeploy";
import { createStudioEditorCanonicalConfig } from "../../src/features/configAuthoring/canonicalConfig";
import { saveRepoBackedConfig } from "../../src/features/mapConfigSave/api";
import { createMapConfigSaveDeployStatus } from "../../src/features/mapConfigSave/status";
import { getRecipeArtifacts } from "../../src/recipes/catalog";

const recipeId = "mod-swooper-maps/standard";
const validConfig = getRecipeArtifacts(recipeId).defaultConfig as PipelineConfig;
const editor = createStudioEditorCanonicalConfig();
const saveRpc = vi.mocked(saveRepoBackedConfig);

function completeStatus(requestId: string) {
  return createMapConfigSaveDeployStatus({
    requestId,
    phase: "complete",
  });
}

function failedStatus(requestId: string) {
  return createMapConfigSaveDeployStatus({
    requestId,
    phase: "failed",
    safeFailureCategory: "save",
    recoveryActions: ["retry-save-deploy"],
  });
}

function makeArgs(over: Partial<UseSaveDeployArgs> = {}): UseSaveDeployArgs {
  return {
    saveDeployOperation: null,
    setSaveDeployOperation: vi.fn(),
    saveDeployRunning: false,
    browserRunning: false,
    runInGameRunning: false,
    recipeId,
    authoringConfigSource: { kind: "editor", canonicalConfig: editor },
    pipelineConfig: validConfig,
    adoptSavedEditorConfig: vi.fn(),
    toast: vi.fn(),
    ...over,
  };
}

function setup(over: Partial<UseSaveDeployArgs> = {}) {
  const props = makeArgs(over);
  const view = renderHook((current: UseSaveDeployArgs) => useSaveDeploy(current), {
    initialProps: props,
  });
  return { ...view, props };
}

beforeEach(() => saveRpc.mockReset());
afterEach(() => vi.clearAllMocks());

describe("useSaveDeploy catalog/editor ownership", () => {
  it("disables the current-save action semantically and never writes a catalog path", async () => {
    const { result, props } = setup({
      authoringConfigSource: {
        kind: "catalog",
        sourcePath: "mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json",
      },
    });

    expect(result.current.canSaveToCurrent).toBe(false);
    await act(async () => result.current.handleSaveToCurrent());

    expect(saveRpc).not.toHaveBeenCalled();
    expect(props.toast).toHaveBeenCalledWith(
      "Catalog configs are read-only. Save & Deploy As creates an editor config.",
      { variant: "info" }
    );
  });

  it("saves the exact editor envelope to its editor-owned default target", async () => {
    saveRpc.mockResolvedValue({
      ok: true,
      status: completeStatus("editor-save"),
    });
    const { result } = setup();

    expect(result.current.canSaveToCurrent).toBe(true);
    await act(async () => result.current.handleSaveToCurrent());

    expect(saveRpc).toHaveBeenCalledTimes(1);
    expect(saveRpc.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ canonicalConfig: editor })
    );
    expect(saveRpc.mock.calls[0]?.[0].canonicalConfig).toBe(editor);
    expect(saveRpc.mock.calls[0]?.[0]).not.toHaveProperty("sourcePath");
  });

  it("adopts the saved editor config only after Save As succeeds", async () => {
    saveRpc.mockResolvedValue({
      ok: true,
      status: completeStatus("save-as"),
    });
    const { result, props } = setup();

    await act(async () =>
      result.current.handleSaveDialogConfirm({ label: "New Editor", description: "Test save" })
    );

    const saved = vi.mocked(props.adoptSavedEditorConfig).mock.calls[0]?.[0];
    const deployed = saveRpc.mock.calls[0]?.[0]?.canonicalConfig;
    expect(saved).toBeDefined();
    expect(deployed).toBe(saved);
    expect(deployed).toMatchObject({ id: "new-editor", name: "New Editor" });
    expect(saveRpc.mock.calls[0]?.[0]).not.toHaveProperty("sourcePath");
  });

  it("leaves the visible authoring source unchanged when Save As fails", async () => {
    saveRpc.mockResolvedValue({ ok: false, status: failedStatus("failed-copy") });
    const originalSource = { kind: "editor" as const, canonicalConfig: editor };
    const { result, props } = setup({ authoringConfigSource: originalSource });

    await act(async () => result.current.handleSaveDialogConfirm({ label: "Failed Copy" }));

    expect(saveRpc).toHaveBeenCalledTimes(1);
    expect(props.adoptSavedEditorConfig).not.toHaveBeenCalled();
    expect(props.authoringConfigSource).toBe(originalSource);
    expect(props.toast).toHaveBeenCalledWith(
      "Config save failed: Saving the map configuration failed.",
      { variant: "error" }
    );
  });

  it("rejects invalid drafts before local persistence or RPC", async () => {
    const invalidPipeline = { invalid: true } as unknown as PipelineConfig;
    const { result, props } = setup({ pipelineConfig: invalidPipeline });

    await act(async () => result.current.handleSaveDialogConfirm({ label: "Invalid" }));

    expect(props.adoptSavedEditorConfig).not.toHaveBeenCalled();
    expect(saveRpc).not.toHaveBeenCalled();
    expect(props.toast).toHaveBeenCalledWith(
      "Config save failed: config is invalid for this recipe.",
      { variant: "error" }
    );
  });

  it("rejects an invalid editor envelope before RPC", async () => {
    const invalidEditor = { ...editor, config: {} };
    const { result, props } = setup({
      authoringConfigSource: {
        kind: "editor",
        canonicalConfig: invalidEditor,
      },
    });

    await act(async () => result.current.handleSaveToCurrent());

    expect(saveRpc).not.toHaveBeenCalled();
    expect(props.toast).toHaveBeenCalledWith(
      "Config save failed: Config is invalid for this recipe.",
      { variant: "error" }
    );
  });
});
