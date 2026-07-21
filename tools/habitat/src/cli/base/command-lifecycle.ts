const habitatCommandSignals = ["SIGINT", "SIGTERM"] as const;

type HabitatCommandSignal = (typeof habitatCommandSignals)[number];
type SignalListener = () => void;

interface HabitatSignalTarget {
  readonly pid: number;
  on(signal: HabitatCommandSignal, listener: SignalListener): unknown;
  removeListener(signal: HabitatCommandSignal, listener: SignalListener): unknown;
  kill(pid: number, signal: HabitatCommandSignal): boolean;
}

/**
 * Owns one Habitat command's cancellation and runtime-disposal boundary.
 *
 * SIGINT/SIGTERM first abort the active local oRPC call. Oclif's `finally` hook then calls
 * `finish`, which removes these listeners, disposes the shared Effect runtime, and re-delivers
 * the original signal so the host preserves its native signal exit status.
 */
export function installHabitatCommandLifecycle(
  disposeRuntime: () => Promise<void>,
  signalTarget: HabitatSignalTarget = process
) {
  const abortController = new AbortController();
  let interruptedBy: HabitatCommandSignal | undefined;
  let finishPromise: Promise<void> | undefined;

  const interrupt = (signal: HabitatCommandSignal) => {
    if (interruptedBy !== undefined) return;
    interruptedBy = signal;
    abortController.abort();
  };
  const onSigint = () => interrupt("SIGINT");
  const onSigterm = () => interrupt("SIGTERM");
  const listeners = [
    ["SIGINT", onSigint],
    ["SIGTERM", onSigterm],
  ] as const;

  for (const [signal, listener] of listeners) signalTarget.on(signal, listener);

  return {
    callerOptions: { signal: abortController.signal },
    finish: () => {
      finishPromise ??= (async () => {
        try {
          await disposeRuntime();
        } finally {
          for (const [signal, listener] of listeners) {
            signalTarget.removeListener(signal, listener);
          }
          if (interruptedBy !== undefined) {
            signalTarget.kill(signalTarget.pid, interruptedBy);
          }
        }
      })();
      return finishPromise;
    },
  };
}
