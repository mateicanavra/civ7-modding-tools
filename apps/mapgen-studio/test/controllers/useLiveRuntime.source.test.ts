/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
import hookSource from "../../src/app/hooks/useLiveRuntime.ts?raw";
import hostSource from "../../src/app/StudioShell.tsx?raw";

// Strip comments so doc-comments (which legitimately name the refs/invariants/timers
// in prose) don't trip the source matchers.
const host = hostSource.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const hook = hookSource.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

describe("useLiveRuntime source — failureCount is display-only, no cadence (LR-4 / LR-8)", () => {
  it("LR-4/LR-8: the hook introduces NO setTimeout/setInterval/retry cadence", () => {
    // The failure counter feeds DISPLAY (Math.max into liveRuntime.failureCount) only.
    // If an extraction wires it to a timer (e.g. setTimeout(read, count*1000)) it would
    // turn an event-driven bounded read into a retry fan-out / polling DoS.
    expect(hook).not.toMatch(/setTimeout/);
    expect(hook).not.toMatch(/setInterval/);
    expect(hook).not.toMatch(/requestAnimationFrame/);
  });

  it("LR-4: liveSnapshotFailureCountRef only increments + feeds Math.max into failureCount (no scheduling)", () => {
    // The ref is read in exactly the display sites (the two Math.max calls) and written
    // in exactly the increment/reset sites — never passed to a scheduler.
    expect(hook).toMatch(/liveSnapshotFailureCountRef\.current \+ 1/);
    expect(hook).toMatch(
      /Math\.max\(current\.failureCount \?\? 0, liveSnapshotFailureCountRef\.current\)/
    );
    // No timer/scheduler ever receives the counter or a read fn.
    expect(hook).not.toMatch(/setTimeout\([^)]*liveSnapshotFailureCountRef/);
    expect(hook).not.toMatch(/setTimeout\([^)]*readLiveRuntimeSnapshot/);
  });
});

describe("useLiveRuntime source — atomic mount-lifecycle group (invariant b)", () => {
  it("the abort/mounted refs + mount-lifecycle effect + the 3 read fns are co-resident in the hook", () => {
    // The mount-lifecycle effect aborts BOTH controllers on unmount; the refs and the
    // three read fns must live in the SAME hook (they cannot be split — invariant b).
    expect(hook).toMatch(/liveRuntimeMountedRef\.current = true;/);
    expect(hook).toMatch(/liveRuntimeMountedRef\.current = false;/);
    expect(hook).toMatch(/liveSnapshotAbortRef\.current\?\.abort\(\);/);
    expect(hook).toMatch(/liveSetupAbortRef\.current\?\.abort\(\);/);
    expect(hook).toMatch(/const readLiveRuntimeSnapshot = useCallback\(/);
    expect(hook).toMatch(/const refreshLiveSetupFromEvent = useCallback\(/);
    expect(hook).toMatch(/const applyLiveGameState = useCallback\(/);
  });

  it("LR-2: readLiveRuntimeSnapshot aborts the prior controller BEFORE storing the new one", () => {
    // The abort must precede the new-controller assign; otherwise the prior in-flight
    // read is never cancelled and a stale response can clobber the newer commit.
    const abortIdx = hook.indexOf("liveSnapshotAbortRef.current?.abort();");
    const assignIdx = hook.indexOf("liveSnapshotAbortRef.current = snapshotAbortController;");
    expect(abortIdx).toBeGreaterThan(-1);
    expect(assignIdx).toBeGreaterThan(-1);
    expect(abortIdx).toBeLessThan(assignIdx);
  });

  it("orpcClient is threaded IN as a param (not the module import) for renderHook testability", () => {
    // The snapshot read must go through the injected client; a bare module import would
    // make the LR-2/LR-3 mock-driven contracts unobservable.
    expect(hook).toMatch(/const \{ orpcClient \} = args;/);
    expect(hook).toMatch(/await orpcClient\.civ7\.live\.snapshot\(/);
    // The bodies must NOT close over a VALUE import of the orpc client (only the
    // `import type` alias is allowed — it carries no runtime binding).
    expect(hook).not.toMatch(/^import \{ orpcClient \} from "\.\.\/\.\.\/lib\/orpc";/m);
  });
});

describe("StudioShell source — 2.10 seam (live-runtime no longer host-owned)", () => {
  it("calls useLiveRuntime and destructures the live-runtime surface", () => {
    expect(host).toMatch(/useLiveRuntime\(\{ orpcClient \}\)/);
    expect(host).toMatch(/\bliveRuntime,/);
    expect(host).toMatch(/setLiveRuntime,/);
    expect(host).toMatch(/liveRuntimeSuggestions,/);
    expect(host).toMatch(/liveSetup,/);
    expect(host).toMatch(/applyLiveGameState,/);
  });

  it("no longer owns the abort/mounted refs, the read fns, or the live-runtime state declarations", () => {
    expect(host).not.toMatch(/liveSnapshotFailureCountRef/);
    expect(host).not.toMatch(/activeLiveSnapshotRequestKeyRef/);
    expect(host).not.toMatch(/activeLiveSetupRequestKeyRef/);
    expect(host).not.toMatch(/liveSnapshotAbortRef/);
    expect(host).not.toMatch(/liveSetupAbortRef/);
    expect(host).not.toMatch(/liveRuntimeMountedRef/);
    expect(host).not.toMatch(/const readLiveRuntimeSnapshot = useCallback/);
    expect(host).not.toMatch(/const refreshLiveSetupFromEvent = useCallback/);
    expect(host).not.toMatch(/const applyLiveGameState = useCallback/);
    expect(host).not.toMatch(/setLiveRuntimeSnapshot/);
    expect(host).not.toMatch(/setLiveRuntimeSuggestions/);
    expect(host).not.toMatch(/setLiveSetup\b/);
  });

  it("§5: useLiveRuntime is initialized AFTER useSaveDeploy and BEFORE the operation-adoption effect", () => {
    const saveDeployIdx = host.indexOf("} = useSaveDeploy({");
    const liveRuntimeIdx = host.indexOf("useLiveRuntime({ orpcClient })");
    const adoptionIdx = host.indexOf("readAndAdoptStudioOperationsCurrent({");
    expect(saveDeployIdx).toBeGreaterThan(-1);
    expect(liveRuntimeIdx).toBeGreaterThan(-1);
    expect(adoptionIdx).toBeGreaterThan(-1);
    expect(saveDeployIdx).toBeLessThan(liveRuntimeIdx);
    expect(liveRuntimeIdx).toBeLessThan(adoptionIdx);
  });

  it("applyLiveGameState (from the hook) is wired into useStudioEvents", () => {
    const liveRuntimeIdx = host.indexOf("useLiveRuntime({ orpcClient })");
    const studioEventsIdx = host.indexOf("useStudioEvents({");
    expect(liveRuntimeIdx).toBeLessThan(studioEventsIdx);
    expect(host).toMatch(/useStudioEvents\(\{\s*applyLiveGameState,/);
  });
});
