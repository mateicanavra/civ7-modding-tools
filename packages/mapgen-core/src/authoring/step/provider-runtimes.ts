import type { ArtifactContract } from "../artifact/contract.js";
import type { ImplementedArtifactRuntime } from "../artifact/runtime.js";

type ProviderRuntimeMap = Readonly<Record<string, ImplementedArtifactRuntime<ArtifactContract>>>;

const providerRuntimesByStep = new WeakMap<object, ProviderRuntimeMap>();

/** @internal Retains executor-only artifact publishers against one admitted step identity. */
export function registerStepProviderRuntimesInternal(
  step: object,
  runtimes: ProviderRuntimeMap
): void {
  if (providerRuntimesByStep.has(step)) {
    throw new Error("step provider runtimes are already registered");
  }
  providerRuntimesByStep.set(step, runtimes);
}

/** @internal Carries private provider authority across recipe authorship snapshotting. */
export function copyStepProviderRuntimesInternal(source: object, target: object): void {
  const runtimes = providerRuntimesByStep.get(source);
  if (runtimes !== undefined) registerStepProviderRuntimesInternal(target, runtimes);
}

/** @internal Returns executor-only publishers only to the declared dependency binder. */
export function readStepProviderRuntimesInternal(step: object): ProviderRuntimeMap | undefined {
  return providerRuntimesByStep.get(step);
}
