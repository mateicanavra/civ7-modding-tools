const habitatProcessSignals = ["SIGINT", "SIGTERM"] as const;
const habitatRuntimeFinishDeadlineMs = 1_500;
const habitatSignalReplayDeadlineMs = 2_000;

/** Signals whose native exit identity Habitat preserves across scoped cleanup. */
type HabitatProcessSignal = (typeof habitatProcessSignals)[number];
type SignalListener = () => void;

/** Minimal host process authority required to capture and re-deliver cancellation. */
export interface HabitatSignalTarget {
  readonly pid: number;
  on(signal: HabitatProcessSignal, listener: SignalListener): unknown;
  removeListener(signal: HabitatProcessSignal, listener: SignalListener): unknown;
  kill(pid: number, signal: HabitatProcessSignal): boolean;
}

/**
 * Owns signal capture, interruption, finalization, and native signal replay for one process edge.
 *
 * The first SIGINT or SIGTERM interrupts the caller-owned execution and starts a cleanup
 * deadline. `finish` keeps signal ownership while that execution releases its resources, then
 * removes the temporary listeners and re-delivers the original signal. A repeated signal forces
 * immediate replay of that first signal, so a stuck finalizer cannot replace or swallow native
 * cancellation indefinitely.
 */
export function installHabitatProcessLifecycle(
  interrupt: () => void,
  finishRuntime: () => Promise<void>,
  signalTarget: HabitatSignalTarget = process
) {
  let interruptedBy: HabitatProcessSignal | undefined;
  let finishPromise: Promise<void> | undefined;
  let replayed = false;
  let signalDeadline: ReturnType<typeof setTimeout> | undefined;

  const removeListeners = () => {
    for (const [signal, listener] of listeners) {
      signalTarget.removeListener(signal, listener);
    }
  };
  const replaySignal = (signal: HabitatProcessSignal) => {
    if (replayed) return;
    replayed = true;
    if (signalDeadline !== undefined) clearTimeout(signalDeadline);
    removeListeners();
    signalTarget.kill(signalTarget.pid, signal);
  };

  const interruptOnce = (signal: HabitatProcessSignal) => {
    if (interruptedBy !== undefined) {
      replaySignal(interruptedBy);
      return;
    }
    interruptedBy = signal;
    signalDeadline = setTimeout(() => replaySignal(signal), habitatSignalReplayDeadlineMs);
    interrupt();
  };
  const onSigint = () => interruptOnce("SIGINT");
  const onSigterm = () => interruptOnce("SIGTERM");
  const listeners = [
    ["SIGINT", onSigint],
    ["SIGTERM", onSigterm],
  ] as const;

  for (const [signal, listener] of listeners) signalTarget.on(signal, listener);

  return {
    finish: () => {
      finishPromise ??= (async () => {
        try {
          await finishRuntimeWithinDeadline(finishRuntime);
        } finally {
          if (interruptedBy !== undefined) {
            replaySignal(interruptedBy);
          } else {
            removeListeners();
          }
        }
      })();
      return finishPromise;
    },
  };
}

function finishRuntimeWithinDeadline(finishRuntime: () => Promise<void>): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = setTimeout(
      () => reject(new Error("Habitat runtime disposal exceeded its cleanup deadline.")),
      habitatRuntimeFinishDeadlineMs
    );
    Promise.resolve()
      .then(finishRuntime)
      .then(
        () => {
          clearTimeout(deadline);
          resolve();
        },
        (cause: unknown) => {
          clearTimeout(deadline);
          reject(cause);
        }
      );
  });
}
