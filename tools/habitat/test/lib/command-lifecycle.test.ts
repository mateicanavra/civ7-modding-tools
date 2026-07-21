import { installHabitatCommandLifecycle } from "@habitat/cli/cli/base/command-lifecycle";
import { describe, expect, test, vi } from "vitest";

type TestSignal = "SIGINT" | "SIGTERM";

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
    target.emit("SIGTERM");

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

  test("keeps signal ownership until runtime disposal completes", async () => {
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
    target.emit("SIGTERM");
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
