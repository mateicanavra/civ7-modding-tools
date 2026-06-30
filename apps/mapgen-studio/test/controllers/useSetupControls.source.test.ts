/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
import hookSource from "../../src/app/hooks/useSetupControls.ts?raw";
import hostSource from "../../src/app/StudioShell.tsx?raw";

// Strip comments so doc-comments (which legitimately name the pinned pure fns /
// the invariants) don't trip the matchers.
const host = hostSource.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const hook = hookSource.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

describe("useSetupControls source — SC-1/2/3 pinned pure logic stays in features/* (called, not re-derived)", () => {
  it("drift detection delegates to the pinned VALUE-equality fn (SC-4: studioSetupDriftsFromSavedConfig → studioSetupConfigsEqual)", () => {
    // The hook must CALL the pure drift fn, never inline a JSON.stringify / `===`
    // identity comparison. The pure fn (pinned in setupConfig.test.ts) routes
    // through studioSetupConfigsEqual.
    expect(hook).toMatch(/return studioSetupDriftsFromSavedConfig\(setupConfig, savedConfig\)/);
    expect(hook).not.toMatch(/JSON\.stringify/);
  });

  it("saved-config selection delegates to the pinned replace + clear fns (SC-1/2)", () => {
    expect(hook).toMatch(/setSetupConfig\(studioSetupConfigFromSavedConfigFile\(savedConfig\)\)/);
    expect(hook).toMatch(/setSetupConfig\(\(current\) => clearStudioSetupSavedConfig\(current\)\)/);
  });
});

describe("useSetupControls source — SC-5 (autoplay guard ordering)", () => {
  it("the re-entrant guard short-circuits BEFORE the busy gate and BEFORE the RPC", () => {
    const guardIdx = hook.indexOf("if (autoplayActionRunning) {");
    const busyIdx = hook.indexOf('subject: "Autoplay",');
    const rpcIdx = hook.indexOf("await requestCiv7Autoplay(action)");
    expect(guardIdx).toBeGreaterThan(-1);
    expect(busyIdx).toBeGreaterThan(-1);
    expect(rpcIdx).toBeGreaterThan(-1);
    expect(guardIdx).toBeLessThan(busyIdx);
    expect(busyIdx).toBeLessThan(rpcIdx);
  });

  it("the in-flight flag is set BEFORE the await and cleared in a finally", () => {
    const setIdx = hook.indexOf("setAutoplayActionRunning(true);");
    const awaitIdx = hook.indexOf("await requestCiv7Autoplay(action)");
    const clearIdx = hook.indexOf("setAutoplayActionRunning(false);");
    expect(setIdx).toBeGreaterThan(-1);
    expect(awaitIdx).toBeGreaterThan(-1);
    expect(clearIdx).toBeGreaterThan(-1);
    expect(setIdx).toBeLessThan(awaitIdx);
    expect(awaitIdx).toBeLessThan(clearIdx);
    // The clear sits inside a `finally` block.
    expect(hook).toMatch(/\}\s*finally\s*\{\s*setAutoplayActionRunning\(false\);\s*\}/);
  });

  it("reads the LIVE liveRuntime.autoplayActive to pick start vs stop (not a stale capture)", () => {
    expect(hook).toMatch(/const action = liveRuntime\.autoplayActive \? "stop" : "start";/);
    // The handler dep array lists the live value so the closure is rebuilt on change.
    expect(hook).toMatch(/liveRuntime\.autoplayActive,/);
  });
});

describe("useSetupControls source — SC-6 (explore guard ordering, try/finally)", () => {
  it("the re-entrant guard short-circuits BEFORE the busy gate and BEFORE the RPC", () => {
    const guardIdx = hook.indexOf("if (exploreActionRunning) {");
    const busyIdx = hook.indexOf('subject: "Explore",');
    const rpcIdx = hook.indexOf("await liveControlPort.display.explore.request(");
    expect(guardIdx).toBeGreaterThan(-1);
    expect(busyIdx).toBeGreaterThan(-1);
    expect(rpcIdx).toBeGreaterThan(-1);
    expect(guardIdx).toBeLessThan(busyIdx);
    expect(busyIdx).toBeLessThan(rpcIdx);
  });

  it("the in-flight flag is set BEFORE the await and cleared in a finally that wraps a try/catch", () => {
    const setIdx = hook.indexOf("setExploreActionRunning(true);");
    const awaitIdx = hook.indexOf("await liveControlPort.display.explore.request(");
    const clearIdx = hook.indexOf("setExploreActionRunning(false);");
    expect(setIdx).toBeGreaterThan(-1);
    expect(awaitIdx).toBeLessThan(clearIdx);
    expect(setIdx).toBeLessThan(awaitIdx);
    expect(hook).toMatch(/\}\s*finally\s*\{\s*setExploreActionRunning\(false\);\s*\}/);
    // try/catch wraps the RPC (error path toasts, does not rethrow).
    expect(hook).toMatch(/\}\s*catch\s*\(err\)\s*\{/);
  });
});

describe("StudioShell source — 2.12 seam (setup-controls no longer host-owned)", () => {
  it("calls useSetupControls and destructures the setup-controls surface", () => {
    expect(host).toMatch(/} = useSetupControls\(\{/);
    expect(host).toMatch(/setupControlOptions,/);
    expect(host).toMatch(/savedSetupConfigModified,/);
    expect(host).toMatch(/handleSavedSetupConfigChange,/);
    expect(host).toMatch(/handleToggleAutoplay,/);
    expect(host).toMatch(/handleExplore,/);
    expect(host).toMatch(/autoplayActionRunning,/);
    expect(host).toMatch(/exploreActionRunning,/);
  });

  it("no longer owns the moved declarations (memos, handlers, in-flight state)", () => {
    expect(host).not.toMatch(/const setupControlOptions = useMemo/);
    expect(host).not.toMatch(/const savedSetupConfigModified = useMemo/);
    expect(host).not.toMatch(/const handleSavedSetupConfigChange = useCallback/);
    expect(host).not.toMatch(/const handleToggleAutoplay = useCallback/);
    expect(host).not.toMatch(/const handleExplore = useCallback/);
    expect(host).not.toMatch(/setAutoplayActionRunning/);
    expect(host).not.toMatch(/setExploreActionRunning/);
    // The autoplay/explore RPC entry points are no longer imported by the host.
    expect(host).not.toMatch(/import \{ requestCiv7Autoplay \}/);
    expect(host).not.toMatch(/import \{ liveControlPort \}/);
  });

  it("§5: useSetupControls is initialized AFTER useLiveRuntime + useStudioOperations + useSetupDataQueries", () => {
    const liveRuntimeIdx = host.indexOf("useLiveRuntime({ orpcClient })");
    const operationsIdx = host.indexOf("} = useStudioOperations();");
    const dataQueriesIdx = host.indexOf("} = useSetupDataQueries();");
    const setupControlsIdx = host.indexOf("} = useSetupControls({");
    expect(liveRuntimeIdx).toBeGreaterThan(-1);
    expect(operationsIdx).toBeGreaterThan(-1);
    expect(dataQueriesIdx).toBeGreaterThan(-1);
    expect(setupControlsIdx).toBeGreaterThan(-1);
    expect(liveRuntimeIdx).toBeLessThan(setupControlsIdx);
    expect(operationsIdx).toBeLessThan(setupControlsIdx);
    expect(dataQueriesIdx).toBeLessThan(setupControlsIdx);
  });
});
