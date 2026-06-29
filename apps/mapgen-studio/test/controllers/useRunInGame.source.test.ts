/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
import hookSource from "../../src/app/hooks/useRunInGame.ts?raw";
import hostSource from "../../src/app/StudioShell.tsx?raw";

// Strip comments so doc-comments (which legitimately name the contracts/refs/
// invariants) don't trip the matchers.
const host = hostSource.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const hook = hookSource.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

describe("useRunInGame source — RIG-2 (materializationMode is a render-time prop, never an effect-ref)", () => {
  it("reads runInGameMaterializationMode straight from the destructured args (no local useState/useRef for it)", () => {
    // RIG-2 (security-adjacent): the durable/disposable routing value must be the
    // render-time prop. The hook must NOT own it via state or an effect-assigned ref —
    // that would forward a previous-render mode to the daemon.
    expect(hook).toMatch(/const \{[\s\S]*runInGameMaterializationMode,[\s\S]*\} = args;/);
    // No effect ever assigns a materialization-mode ref, and the hook does not
    // re-derive the mode from preset/config (that derivation stays HOST, §7.6).
    expect(hook).not.toMatch(/MaterializationModeRef/);
    expect(hook).not.toMatch(/useState<["']durable["']/);
    expect(hook).not.toMatch(/configsEqual/);
  });
});

describe("useRunInGame source — RIG-4 (fingerprint includes materializationMode)", () => {
  it("the run-in-game fingerprint memo passes materializationMode into buildRunInGameFingerprint", () => {
    const fingerprint = hook.slice(
      hook.indexOf("buildRunInGameFingerprint({"),
      hook.indexOf("buildRunInGameFingerprint({") + 400
    );
    expect(fingerprint).toContain("materializationMode: runInGameMaterializationMode");
  });
});

describe("useRunInGame source — RIG-1/3 (calls the pinned pure logic, does not re-derive it)", () => {
  it("the relation memo calls relationForRunInGameOperation (not an inline equality)", () => {
    expect(hook).toMatch(/relationForRunInGameOperation\(\{/);
    expect(hook).toMatch(/import \{[\s\S]*relationForRunInGameOperation[\s\S]*\} from/);
  });

  it("fingerprint/relation pure logic is imported from features/runInGame/* (not redefined here)", () => {
    expect(hook).toContain('from "../../features/runInGame/clientState"');
    // The hook does not redeclare the pinned pure functions.
    expect(hook).not.toMatch(/function relationForRunInGameOperation/);
    expect(hook).not.toMatch(/function buildRunInGameFingerprint/);
  });
});

describe("useRunInGame source — RIG-5 (sync routes through applyAuthoringSnapshot, no inline 5-setter)", () => {
  it("syncStudioFromLiveGame calls applyAuthoringSnapshot and does NOT re-implement the ordered write", () => {
    expect(hook).toMatch(/const syncStudioFromLiveGame = useCallback\(/);
    expect(hook).toMatch(/applyAuthoringSnapshot\(\{/);
    // The contract owner (usePresetLifecycle) performs the 5-setter ordered write;
    // this caller must NOT inline setWorldSettings/setPipelineConfig/setOverridesDisabled.
    expect(hook).not.toMatch(/setWorldSettings\(/);
    expect(hook).not.toMatch(/setPipelineConfig\(/);
    expect(hook).not.toMatch(/setOverridesDisabled\(/);
  });
});

describe("useRunInGame source — RIG-6 (busy-gate + status-≠-ok guards present, in order)", () => {
  it("the sync handler opens with the status≠ok early return, then the busy-gate", () => {
    const sync = hook.slice(hook.indexOf("const syncStudioFromLiveGame = useCallback("));
    const statusGuardIdx = sync.indexOf('if (liveRuntime.status !== "ok") return;');
    const busyGateIdx = sync.indexOf(
      "if (browserRunning || runInGameRunning || saveDeployRunning)"
    );
    expect(statusGuardIdx).toBeGreaterThan(-1);
    expect(busyGateIdx).toBeGreaterThan(-1);
    // The fully-silent status guard precedes the (toast-emitting) busy gate.
    expect(statusGuardIdx).toBeLessThan(busyGateIdx);
  });

  it("the launch handler opens with the run/save busy gate (never silent)", () => {
    const launch = hook.slice(hook.indexOf("const handleRunInGame = useCallback("));
    expect(launch).toMatch(/if \(runInGameRunning \|\| saveDeployRunning\) \{/);
  });
});

describe("useRunInGame source — D1 (hardcoded recipeId untouched)", () => {
  it("handleRunInGame still pins the recipeId to 'mod-swooper-maps/standard' (out of scope)", () => {
    expect(hook).toContain('recipeId: "mod-swooper-maps/standard"');
  });
});

describe("StudioShell source — 2.11 seam (run-in-game no longer host-owned)", () => {
  it("calls useRunInGame and destructures the run-in-game surface", () => {
    expect(host).toMatch(/} = useRunInGame\(\{/);
    expect(host).toMatch(/runInGameCurrentRelation,/);
    expect(host).toMatch(/handleRunInGame,/);
    expect(host).toMatch(/syncStudioFromLiveGame,/);
    expect(host).toMatch(/copyRunInGameDiagnostics,/);
  });

  it("no longer owns the run-in-game handlers / fingerprint / relation / terminal toast", () => {
    expect(host).not.toMatch(/const handleRunInGame = useCallback/);
    expect(host).not.toMatch(/const syncStudioFromLiveGame = useCallback/);
    expect(host).not.toMatch(/const copyRunInGameDiagnostics = useCallback/);
    expect(host).not.toMatch(/const runInGameCurrentFingerprint = useMemo/);
    expect(host).not.toMatch(/const runInGameCurrentRelation = useMemo/);
    expect(host).not.toMatch(/useRunInGameTerminalToast\(/);
    expect(host).not.toMatch(/buildRunInGameFingerprint/);
    expect(host).not.toMatch(/runCurrentConfigInGame/);
  });

  it("§7.6: the host KEEPS the cycle-break derivations (computed host, threaded IN)", () => {
    // provedRunInGameSource + runInGameMaterializationMode are host-computed; the
    // host passes them INTO useRunInGame.
    expect(host).toMatch(/const provedRunInGameSource = useMemo/);
    expect(host).toMatch(/const runInGameMaterializationMode = useMemo/);
    expect(host).toMatch(/const displayedPresetOptions = useMemo/);
    expect(host).toMatch(/const studioMatchesProvedLiveSource = useMemo/);
    // ...and threads them into the hook call.
    expect(host).toMatch(/provedRunInGameSource,/);
    expect(host).toMatch(/runInGameMaterializationMode,/);
    expect(host).toMatch(/applyAuthoringSnapshot,/);
  });

  it("§5: useRunInGame is initialized AFTER useLiveRuntime and useSaveDeploy", () => {
    const liveIdx = host.indexOf("useLiveRuntime({");
    const saveIdx = host.indexOf("} = useSaveDeploy({");
    const runIdx = host.indexOf("} = useRunInGame({");
    for (const idx of [liveIdx, saveIdx, runIdx]) expect(idx).toBeGreaterThan(-1);
    expect(liveIdx).toBeLessThan(runIdx);
    expect(saveIdx).toBeLessThan(runIdx);
  });
});
