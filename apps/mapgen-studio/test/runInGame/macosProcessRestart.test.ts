import { describe, expect, it } from "vitest";

import {
  shutdownCiv7MacProcess,
  waitForMacProcessExit,
  type ExecFileAsync,
} from "../../src/server/runInGame/macosProcessRestart";

function createPgrepMiss(): Error & { code: number; stdout: string; stderr: string } {
  return Object.assign(new Error("no matching process"), { code: 1, stdout: "", stderr: "" });
}

function createHarness(runningResults: boolean[]) {
  let nowMs = 0;
  const calls: Array<{ file: string; args: string[] }> = [];
  const execFileAsync: ExecFileAsync = async (file, args) => {
    calls.push({ file, args });
    if (file === "pgrep") {
      const running = runningResults.length === 0 ? false : runningResults.shift();
      if (running) return { stdout: "12345\n", stderr: "" };
      throw createPgrepMiss();
    }
    return { stdout: "", stderr: "" };
  };

  return {
    calls,
    execFileAsync,
    now: () => nowMs,
    sleep: async (ms: number) => {
      nowMs += ms;
    },
  };
}

describe("macOS Civ7 process restart helpers", () => {
  it("requires stable process absence before treating Civ as shut down", async () => {
    const harness = createHarness([true, false, true, false, false]);

    const result = await waitForMacProcessExit({
      execFileAsync: harness.execFileAsync,
      sleep: harness.sleep,
      now: harness.now,
      processPattern: "CivilizationVII.app/Contents/MacOS/CivilizationVII",
      timeoutMs: 10_000,
      pollIntervalMs: 1_000,
      stableAbsentPolls: 2,
    });

    expect(result).toMatchObject({
      exited: true,
      polls: 5,
      stableAbsentPolls: 2,
    });
  });

  it("escalates to pkill and waits before returning from shutdown", async () => {
    const harness = createHarness([true, true, false, false]);

    const result = await shutdownCiv7MacProcess({
      execFileAsync: harness.execFileAsync,
      sleep: harness.sleep,
      now: harness.now,
      tail: (value) => value,
      processPattern: "CivilizationVII.app/Contents/MacOS/CivilizationVII",
      gracefulQuitTimeoutMs: 1_000,
      forceQuitTimeoutMs: 10_000,
      forceKillTimeoutMs: 10_000,
      pollIntervalMs: 1_000,
      stableAbsentPolls: 2,
    });

    expect(result.gracefulExit.exited).toBe(false);
    expect(result.kill?.command).toBe("pkill -f CivilizationVII.app/Contents/MacOS/CivilizationVII");
    expect(result.forcedExit).toMatchObject({
      exited: true,
      stableAbsentPolls: 2,
    });
    expect(harness.calls.map((call) => call.file)).toEqual([
      "osascript",
      "pgrep",
      "pgrep",
      "pkill",
      "pgrep",
      "pgrep",
    ]);
  });

  it("throws if Civ remains alive after force kill", async () => {
    const harness = createHarness([true, true, true, true, true, true]);

    await expect(shutdownCiv7MacProcess({
      execFileAsync: harness.execFileAsync,
      sleep: harness.sleep,
      now: harness.now,
      tail: (value) => value,
      processPattern: "CivilizationVII.app/Contents/MacOS/CivilizationVII",
      gracefulQuitTimeoutMs: 0,
      forceQuitTimeoutMs: 0,
      forceKillTimeoutMs: 0,
      pollIntervalMs: 1_000,
      stableAbsentPolls: 1,
    })).rejects.toThrow("Civ7 process did not exit");

    expect(harness.calls.filter((call) => call.file === "pkill").map((call) => call.args)).toEqual([
      ["-f", "CivilizationVII.app/Contents/MacOS/CivilizationVII"],
      ["-9", "-f", "CivilizationVII.app/Contents/MacOS/CivilizationVII"],
    ]);
  });
});
