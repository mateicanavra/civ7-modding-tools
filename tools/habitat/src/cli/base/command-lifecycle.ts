import {
  type HabitatSignalTarget,
  installHabitatProcessLifecycle,
} from "@habitat/cli/runtime/process-lifecycle";

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
  const lifecycle = installHabitatProcessLifecycle(
    () => abortController.abort(),
    disposeRuntime,
    signalTarget
  );

  return {
    callerOptions: { signal: abortController.signal },
    finish: lifecycle.finish,
  };
}
