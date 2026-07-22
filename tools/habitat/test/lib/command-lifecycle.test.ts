import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { pathToFileURL } from "node:url";
import { repoRoot } from "@habitat/cli/resources/paths";
import { describe, expect, test, vi } from "vitest";

// biome-ignore lint/plugin: This fixture proves lifecycle behavior without eagerly loading the CLI graph.
const { installHabitatCommandLifecycle } = await import("@habitat/cli/cli/base/command-lifecycle");

type TestSignal = "SIGINT" | "SIGTERM";
const posixProcessTest =
  process.platform === "darwin" || process.platform === "linux" ? test : test.skip;

class TestSignalTarget {
  readonly pid = 4242;
  readonly kills: Array<Readonly<{ pid: number; signal: TestSignal }>> = [];
  private readonly listeners = new Map<TestSignal, Set<() => void>>();

  on(signal: TestSignal, listener: () => void): void {
    const listeners = this.listeners.get(signal) ?? new Set();
    listeners.add(listener);
    this.listeners.set(signal, listeners);
  }

  removeListener(signal: TestSignal, listener: () => void): void {
    this.listeners.get(signal)?.delete(listener);
  }

  kill(pid: number, signal: TestSignal): boolean {
    this.kills.push({ pid, signal });
    return true;
  }

  emit(signal: TestSignal): void {
    for (const listener of this.listeners.get(signal) ?? []) listener();
  }

  listenerCount(signal: TestSignal): number {
    return this.listeners.get(signal)?.size ?? 0;
  }
}

describe("Habitat command lifecycle", () => {
  test("aborts once, then disposes before re-delivering the first signal", async () => {
    const target = new TestSignalTarget();
    const events: string[] = [];
    const lifecycle = installHabitatCommandLifecycle(async () => {
      events.push("dispose");
    }, target);
    lifecycle.callerOptions.signal.addEventListener("abort", () => events.push("abort"));

    target.emit("SIGINT");

    expect(lifecycle.callerOptions.signal.aborted).toBe(true);
    expect(events).toEqual(["abort"]);
    expect(target.kills).toEqual([]);

    await lifecycle.finish();
    await lifecycle.finish();

    expect(events).toEqual(["abort", "dispose"]);
    expect(target.kills).toEqual([{ pid: 4242, signal: "SIGINT" }]);
    expect(target.listenerCount("SIGINT")).toBe(0);
    expect(target.listenerCount("SIGTERM")).toBe(0);
  });

  test("repeated cancellation forces the first native signal while disposal is pending", async () => {
    const target = new TestSignalTarget();
    const lifecycle = installHabitatCommandLifecycle(
      () => new Promise<void>(() => undefined),
      target
    );

    target.emit("SIGINT");
    target.emit("SIGTERM");

    expect(lifecycle.callerOptions.signal.aborted).toBe(true);
    expect(target.kills).toEqual([{ pid: 4242, signal: "SIGINT" }]);
    expect(target.listenerCount("SIGINT")).toBe(0);
    expect(target.listenerCount("SIGTERM")).toBe(0);
  });

  posixProcessTest.each([
    { first: "SIGINT", repeated: "SIGTERM" },
    { first: "SIGTERM", repeated: "SIGINT" },
  ] as const)(
    "preserves $first across a real mixed-signal sequence",
    async ({ first, repeated }) => {
      const fixtureRoot = mkdtempSync(path.join(tmpdir(), "habitat-command-lifecycle-"));
      const scriptPath = path.join(fixtureRoot, "mixed-signal.mjs");
      const stateRoot = path.join(fixtureRoot, "state");
      const lifecycleModule = pathToFileURL(
        path.join(repoRoot, "tools/habitat/src/runtime/process-lifecycle.ts")
      ).href;
      writeFileSync(scriptPath, mixedSignalFixtureScript(lifecycleModule), "utf8");
      const child = spawn("bun", [scriptPath], {
        cwd: repoRoot,
        env: { ...process.env, HABITAT_LIFECYCLE_STATE_ROOT: stateRoot },
        stdio: "ignore",
      });
      const exited = observeChildExit(child);

      try {
        await waitForPath(`${stateRoot}.ready`);
        expect(child.kill(first)).toBe(true);
        await waitForPath(`${stateRoot}.interrupted`);
        expect(child.kill(repeated)).toBe(true);

        await expect(withDeadline(exited, 5_000, "mixed-signal fixture")).resolves.toEqual({
          code: null,
          signal: first,
        });
      } finally {
        if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
        await withDeadline(exited, 1_000, "mixed-signal fixture cleanup").catch(() => undefined);
        rmSync(fixtureRoot, { recursive: true, force: true });
      }
    }
  );

  test("forces the first native signal when scoped cleanup never reaches finish", async () => {
    vi.useFakeTimers();
    try {
      const target = new TestSignalTarget();
      const lifecycle = installHabitatCommandLifecycle(
        () => new Promise<void>(() => undefined),
        target
      );

      target.emit("SIGINT");
      await vi.advanceTimersByTimeAsync(2_001);

      expect(lifecycle.callerOptions.signal.aborted).toBe(true);
      expect(target.kills).toEqual([{ pid: 4242, signal: "SIGINT" }]);
      expect(target.listenerCount("SIGINT")).toBe(0);
      expect(target.listenerCount("SIGTERM")).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  test("normal completion disposes once, removes listeners, and does not synthesize a signal", async () => {
    const target = new TestSignalTarget();
    const dispose = vi.fn(async () => {});
    const lifecycle = installHabitatCommandLifecycle(dispose, target);

    expect(target.listenerCount("SIGINT")).toBe(1);
    expect(target.listenerCount("SIGTERM")).toBe(1);

    await Promise.all([lifecycle.finish(), lifecycle.finish()]);

    expect(dispose).toHaveBeenCalledTimes(1);
    expect(lifecycle.callerOptions.signal.aborted).toBe(false);
    expect(target.kills).toEqual([]);
    expect(target.listenerCount("SIGINT")).toBe(0);
    expect(target.listenerCount("SIGTERM")).toBe(0);
  });

  test("bounds runtime disposal even without a host signal", async () => {
    vi.useFakeTimers();
    try {
      const target = new TestSignalTarget();
      const lifecycle = installHabitatCommandLifecycle(
        () => new Promise<void>(() => undefined),
        target
      );
      const finished = lifecycle.finish();
      const rejection = expect(finished).rejects.toThrow(
        "Habitat runtime disposal exceeded its cleanup deadline."
      );

      await vi.advanceTimersByTimeAsync(1_501);
      await rejection;

      expect(target.kills).toEqual([]);
      expect(target.listenerCount("SIGINT")).toBe(0);
      expect(target.listenerCount("SIGTERM")).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  test("first-signal fail-safe survives invoked finish with hung runtime disposal", async () => {
    vi.useFakeTimers();
    try {
      const target = new TestSignalTarget();
      const lifecycle = installHabitatCommandLifecycle(
        () => new Promise<void>(() => undefined),
        target
      );

      target.emit("SIGTERM");
      const finished = lifecycle.finish();
      const rejection = expect(finished).rejects.toThrow(
        "Habitat runtime disposal exceeded its cleanup deadline."
      );
      await vi.advanceTimersByTimeAsync(1_501);
      await rejection;

      expect(lifecycle.callerOptions.signal.aborted).toBe(true);
      expect(target.kills).toEqual([{ pid: 4242, signal: "SIGTERM" }]);
      expect(target.listenerCount("SIGINT")).toBe(0);
      expect(target.listenerCount("SIGTERM")).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  test("keeps first-signal ownership until runtime disposal completes", async () => {
    const target = new TestSignalTarget();
    let releaseDispose: (() => void) | undefined;
    const disposal = new Promise<void>((resolve) => {
      releaseDispose = resolve;
    });
    const lifecycle = installHabitatCommandLifecycle(() => disposal, target);

    target.emit("SIGINT");
    const finished = lifecycle.finish();
    await Promise.resolve();

    expect(target.listenerCount("SIGINT")).toBe(1);
    expect(target.listenerCount("SIGTERM")).toBe(1);
    expect(target.kills).toEqual([]);

    releaseDispose?.();
    await finished;

    expect(target.kills).toEqual([{ pid: 4242, signal: "SIGINT" }]);
    expect(target.listenerCount("SIGINT")).toBe(0);
    expect(target.listenerCount("SIGTERM")).toBe(0);
  });

  test("preserves signal termination even if runtime disposal rejects", async () => {
    const target = new TestSignalTarget();
    const lifecycle = installHabitatCommandLifecycle(async () => {
      throw new Error("dispose failed");
    }, target);

    target.emit("SIGTERM");

    await expect(lifecycle.finish()).rejects.toThrow("dispose failed");
    expect(target.kills).toEqual([{ pid: 4242, signal: "SIGTERM" }]);
    expect(target.listenerCount("SIGINT")).toBe(0);
    expect(target.listenerCount("SIGTERM")).toBe(0);
  });
});

function mixedSignalFixtureScript(lifecycleModule: string): string {
  return [
    `import { installHabitatProcessLifecycle } from ${JSON.stringify(lifecycleModule)};`,
    'import { writeFileSync } from "node:fs";',
    "const stateRoot = process.env.HABITAT_LIFECYCLE_STATE_ROOT;",
    "let lifecycle;",
    "lifecycle = installHabitatProcessLifecycle(",
    "  () => {",
    '    writeFileSync(`${stateRoot}.interrupted`, "");',
    "    void lifecycle.finish().catch(() => undefined);",
    "  },",
    "  () => new Promise(() => undefined)",
    ");",
    'writeFileSync(`${stateRoot}.ready`, "");',
    "setInterval(() => undefined, 1_000);",
  ].join("\n");
}

function observeChildExit(child: ReturnType<typeof spawn>) {
  return new Promise<{ readonly code: number | null; readonly signal: NodeJS.Signals | null }>(
    (resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (code, signal) => resolve({ code, signal }));
    }
  );
}

async function waitForPath(filePath: string): Promise<void> {
  const deadline = Date.now() + 5_000;
  while (!existsSync(filePath)) {
    if (Date.now() >= deadline) throw new Error(`Timed out waiting for ${filePath}.`);
    await sleep(20);
  }
}

async function withDeadline<A>(promise: Promise<A>, timeoutMs: number, label: string): Promise<A> {
  return Promise.race([
    promise,
    sleep(timeoutMs).then(() => {
      throw new Error(`Timed out waiting for ${label}.`);
    }),
  ]);
}
