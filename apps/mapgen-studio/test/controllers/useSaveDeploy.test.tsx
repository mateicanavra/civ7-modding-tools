// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./_setup";

vi.mock("../../src/features/mapConfigSave/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/features/mapConfigSave/api")>();
  return { ...actual, saveRepoBackedConfig: vi.fn() };
});

import { type UseSaveDeployArgs, useSaveDeploy } from "../../src/app/hooks/useSaveDeploy";
import { getRecipeDefaultCanonicalConfig } from "../../src/features/configAuthoring/canonicalConfig";
import { saveRepoBackedConfig } from "../../src/features/mapConfigSave/api";
import { createMapConfigSaveDeployStatus } from "../../src/features/mapConfigSave/status";

const canonicalConfig = getRecipeDefaultCanonicalConfig("standard");
const saveRpc = vi.mocked(saveRepoBackedConfig);

function completeStatus(requestId: string) {
  return createMapConfigSaveDeployStatus({ requestId, phase: "complete" });
}

function failedStatus(requestId: string) {
  return createMapConfigSaveDeployStatus({
    requestId,
    phase: "failed",
    safeFailureCategory: "save",
    recoveryActions: ["retry-save-deploy"],
  });
}

function runningStatus(requestId: string) {
  return createMapConfigSaveDeployStatus({ requestId, phase: "deploying" });
}

function idleStatus(requestId: string) {
  return createMapConfigSaveDeployStatus({ requestId, phase: "idle" });
}

function makeArgs(over: Partial<UseSaveDeployArgs> = {}): UseSaveDeployArgs {
  return {
    saveDeployOperation: null,
    setSaveDeployOperation: vi.fn(),
    saveDeployRunning: false,
    browserRunning: false,
    runInGameRunning: false,
    canonicalConfig,
    setCanonicalConfig: vi.fn(),
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

describe("useSaveDeploy config ownership", () => {
  it("saves the exact current config without a path authority field", async () => {
    saveRpc.mockResolvedValue({ ok: true, status: completeStatus("config-save") });
    const { result } = setup();

    expect(result.current.canSaveToCurrent).toBe(true);
    await act(async () => result.current.handleSaveToCurrent());

    expect(saveRpc).toHaveBeenCalledTimes(1);
    expect(saveRpc.mock.calls[0]?.[0]).toEqual(expect.objectContaining({ canonicalConfig }));
    expect(saveRpc.mock.calls[0]?.[0].canonicalConfig).toBe(canonicalConfig);
    expect(saveRpc.mock.calls[0]?.[0]).not.toHaveProperty("sourcePath");
  });

  it("adopts a Save As config only after save and deploy succeeds", async () => {
    saveRpc.mockResolvedValue({ ok: true, status: completeStatus("save-as") });
    const { result, props } = setup();

    await act(async () =>
      result.current.handleSaveDialogConfirm({ name: "New Config", description: "Test save" })
    );

    const saved = vi.mocked(props.setCanonicalConfig).mock.calls[0]?.[0];
    const deployed = saveRpc.mock.calls[0]?.[0]?.canonicalConfig;
    expect(saved).toBeDefined();
    expect(deployed).toBe(saved);
    expect(deployed).toMatchObject({ id: "new-config", name: "New Config" });
    expect(saveRpc.mock.calls[0]?.[0]).not.toHaveProperty("sourcePath");
  });

  it("leaves the visible config unchanged when Save As fails", async () => {
    saveRpc.mockResolvedValue({ ok: false, status: failedStatus("failed-copy") });
    const { result, props } = setup();

    await act(async () => result.current.handleSaveDialogConfirm({ name: "Failed Copy" }));

    expect(saveRpc).toHaveBeenCalledTimes(1);
    expect(props.setCanonicalConfig).not.toHaveBeenCalled();
    expect(props.toast).toHaveBeenCalledWith(
      "Config save failed: Saving the map configuration failed.",
      { variant: "error" }
    );
  });

  it("presents an observed daemon completion over a later failed response", async () => {
    const response = deferred<Awaited<ReturnType<typeof saveRepoBackedConfig>>>();
    let operation = null as UseSaveDeployArgs["saveDeployOperation"];
    const setSaveDeployOperation: UseSaveDeployArgs["setSaveDeployOperation"] = (update) => {
      operation = typeof update === "function" ? update(operation) : update;
    };
    saveRpc.mockReturnValue(response.promise);
    const { result, props } = setup({ setSaveDeployOperation });
    let save: Promise<void> | undefined;

    await act(async () => {
      save = result.current.handleSaveToCurrent();
      await Promise.resolve();
    });
    const requestId = saveRpc.mock.calls[0]?.[0].requestId;
    if (!requestId) throw new Error("Expected Save/Deploy request identity");
    act(() => {
      result.current.adoptSaveDeployOperation(null);
      result.current.adoptSaveDeployOperation(completeStatus(requestId));
    });
    await act(async () => {
      response.resolve({ ok: false, status: failedStatus(requestId) });
      await save;
    });

    expect(operation).toEqual(completeStatus(requestId));
    expect(props.toast).toHaveBeenCalledWith("Config saved and deployed.", {
      variant: "success",
    });
    expect(props.toast).not.toHaveBeenCalledWith(expect.stringContaining("failed"), {
      variant: "error",
    });
  });

  it("blocks a second admission while recovery temporarily clears display state", async () => {
    const response = deferred<Awaited<ReturnType<typeof saveRepoBackedConfig>>>();
    let operation = null as UseSaveDeployArgs["saveDeployOperation"];
    const setSaveDeployOperation: UseSaveDeployArgs["setSaveDeployOperation"] = (update) => {
      operation = typeof update === "function" ? update(operation) : update;
    };
    saveRpc.mockReturnValue(response.promise);
    const { result, props } = setup({ setSaveDeployOperation });
    let save: Promise<void> | undefined;

    await act(async () => {
      save = result.current.handleSaveToCurrent();
      await Promise.resolve();
    });
    const requestId = saveRpc.mock.calls[0]?.[0].requestId;
    if (!requestId) throw new Error("Expected Save/Deploy request identity");
    await act(async () => {
      result.current.adoptSaveDeployOperation(null);
      await result.current.handleSaveToCurrent();
    });
    expect(saveRpc).toHaveBeenCalledTimes(1);
    expect(props.toast).toHaveBeenCalledWith(
      "Config save failed: Save/deploy admission is already in progress; finish that operation before saving.",
      { variant: "error" }
    );

    await act(async () => {
      result.current.adoptSaveDeployOperation(completeStatus(requestId));
      response.resolve({ ok: true, status: runningStatus(requestId) });
      await save;
    });

    expect(operation).toEqual(completeStatus(requestId));
    expect(props.toast).toHaveBeenCalledWith("Config saved and deployed.", {
      variant: "success",
    });
  });

  it("does not treat an idle response as successful completion", async () => {
    const response = deferred<Awaited<ReturnType<typeof saveRepoBackedConfig>>>();
    saveRpc.mockReturnValue(response.promise);
    const { result, props } = setup();
    let save: Promise<void> | undefined;

    await act(async () => {
      save = result.current.handleSaveToCurrent();
      await Promise.resolve();
    });
    const requestId = saveRpc.mock.calls[0]?.[0].requestId;
    if (!requestId) throw new Error("Expected Save/Deploy request identity");
    await act(async () => {
      response.resolve({ ok: true, status: idleStatus(requestId) });
      await Promise.resolve();
    });
    expect(props.toast).not.toHaveBeenCalledWith("Config saved and deployed.", {
      variant: "success",
    });

    await act(async () => {
      result.current.adoptSaveDeployOperation(completeStatus(requestId));
      await save;
    });
    expect(props.toast).toHaveBeenCalledWith("Config saved and deployed.", {
      variant: "success",
    });
  });

  it("does not register a terminal waiter after unmount", async () => {
    const response = deferred<Awaited<ReturnType<typeof saveRepoBackedConfig>>>();
    saveRpc.mockReturnValue(response.promise);
    const { result, props, unmount } = setup();
    let save: Promise<void> | undefined;

    await act(async () => {
      save = result.current.handleSaveToCurrent();
      await Promise.resolve();
    });
    const requestId = saveRpc.mock.calls[0]?.[0].requestId;
    if (!requestId) throw new Error("Expected Save/Deploy request identity");
    unmount();
    await act(async () => {
      response.resolve({ ok: true, status: runningStatus(requestId) });
      await save;
    });

    expect(props.toast).not.toHaveBeenCalled();
  });

  it("rejects invalid configs before save or deploy", async () => {
    const { result, props } = setup({
      canonicalConfig: { ...canonicalConfig, config: {} },
    });

    await act(async () => result.current.handleSaveToCurrent());

    expect(saveRpc).not.toHaveBeenCalled();
    expect(props.toast).toHaveBeenCalledWith(
      "Config save failed: Config is invalid for this recipe.",
      { variant: "error" }
    );
  });
});

function deferred<T>() {
  let resolvePromise = (_value: T): void => {
    throw new Error("Deferred promise resolver was not initialized");
  };
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });
  return { promise, resolve: resolvePromise };
}
