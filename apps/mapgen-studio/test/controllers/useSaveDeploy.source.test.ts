/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
import hookSource from "../../src/app/hooks/useSaveDeploy.ts?raw";
import hostSource from "../../src/app/StudioShell.tsx?raw";

// Strip comments so doc-comments (which legitimately name the effects/refs/
// invariants) don't trip the ordering matchers.
const host = hostSource.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const hook = hookSource.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

describe("useSaveDeploy source — Tier-B effect pair (SD-5 / SD-10)", () => {
  it("SD-10: the ref assign is the FIRST statement of the SSE-mirror effect", () => {
    // The mirror effect body opens with the render-fresh ref write; if a guard or the
    // terminal check is hoisted above it, the sync waiter branch reads a stale ref.
    const mirrorIdx = hook.indexOf("saveDeployOperationRef.current = saveDeployOperation;");
    const guardIdx = hook.indexOf("if (!saveDeployOperation || !isSaveDeployTerminal(");
    expect(mirrorIdx).toBeGreaterThan(-1);
    expect(guardIdx).toBeGreaterThan(-1);
    expect(mirrorIdx).toBeLessThan(guardIdx);
    // Anchor that the assign sits immediately inside a useEffect opener (no statement
    // between `useEffect(() => {` and the ref write).
    expect(hook).toMatch(
      /useEffect\(\(\) => \{\s*saveDeployOperationRef\.current = saveDeployOperation;/
    );
  });

  it("SD-5: the SSE-mirror effect is declared BEFORE the unmount-cleanup effect", () => {
    // Same-commit, both effects run; the mirror must win so a terminal op that
    // arrives in the unmount commit still resolves (not spuriously 'wait cancelled').
    const mirrorIdx = hook.indexOf("saveDeployOperationRef.current = saveDeployOperation;");
    const cleanupIdx = hook.indexOf('new Error("Save/Deploy wait cancelled")');
    expect(mirrorIdx).toBeGreaterThan(-1);
    expect(cleanupIdx).toBeGreaterThan(-1);
    expect(mirrorIdx).toBeLessThan(cleanupIdx);
  });

  it("owns exactly the 2 save/deploy effects + the waiter callback", () => {
    expect(hook.match(/useEffect\(/g)).toHaveLength(2);
    expect(hook).toMatch(/const waitForSaveDeployTerminalEvent = useCallback\(/);
  });

  it("SD-8: setSaveDeployOperation(initial 'queued') precedes the first await in the save core", () => {
    const queuedIdx = hook.indexOf("setSaveDeployOperation(initial)");
    const firstAwaitIdx = hook.indexOf("await saveRepoBackedConfig({");
    expect(queuedIdx).toBeGreaterThan(-1);
    expect(firstAwaitIdx).toBeGreaterThan(-1);
    expect(queuedIdx).toBeLessThan(firstAwaitIdx);
  });

  it("SD-7: the waiter is awaited only behind the isSaveDeployTerminal short-circuit", () => {
    expect(hook).toMatch(
      /isSaveDeployTerminal\(result\.status\)\s*\?\s*result\.status\s*:\s*await waitForSaveDeployTerminalEvent\(requestId\)/
    );
  });
});

describe("StudioShell source — 2.9 seam (save/deploy no longer host-owned)", () => {
  it("calls useSaveDeploy and destructures the save surface", () => {
    expect(host).toMatch(/} = useSaveDeploy\(\{/);
    expect(host).toMatch(/handleSaveDialogConfirm,/);
    expect(host).toMatch(/handleSaveAsNew,/);
    expect(host).toMatch(/handleSaveToCurrent,/);
    expect(host).toMatch(/saveDialogState,/);
    expect(host).toMatch(/closeSaveDialog,/);
  });

  it("no longer owns the waiter machinery, the save handlers, or the save-dialog state", () => {
    expect(host).not.toMatch(/saveDeployOperationRef/);
    expect(host).not.toMatch(/saveDeployWaitersRef/);
    expect(host).not.toMatch(/waitForSaveDeployTerminalEvent/);
    expect(host).not.toMatch(/const saveRepoBackedConfigWithState = useCallback/);
    expect(host).not.toMatch(/const handleSaveDialogConfirm = useCallback/);
    expect(host).not.toMatch(/const \[saveDialogState/);
    expect(host).not.toMatch(/SAVE_DEPLOY_TERMINAL_EVENT_TIMEOUT_MS/);
    expect(host).not.toMatch(/type SaveDeployTerminalWaiter/);
  });

  it("§5: useSaveDeploy is initialized BEFORE the operation-adoption effect fires", () => {
    const hookIdx = host.indexOf("} = useSaveDeploy({");
    const adoptionIdx = host.indexOf("readAndAdoptStudioOperationsCurrent({");
    expect(hookIdx).toBeGreaterThan(-1);
    expect(adoptionIdx).toBeGreaterThan(-1);
    expect(hookIdx).toBeLessThan(adoptionIdx);
  });
});
