const canonicalStepContracts = new WeakSet<object>();
const canonicalSteps = new WeakSet<object>();

/** @internal Records one immutable contract admitted by `defineStep`. */
export function registerCanonicalStepContractInternal(contract: object): void {
  canonicalStepContracts.add(contract);
}

/** @internal Reports whether the exact contract identity was admitted by `defineStep`. */
export function isCanonicalStepContractInternal(contract: object): boolean {
  return canonicalStepContracts.has(contract);
}

/** @internal Refuses structural contracts that did not cross the `defineStep` boundary. */
export function assertCanonicalStepContractInternal(contract: object): void {
  if (!canonicalStepContracts.has(contract)) {
    throw new Error("step contract must be created by defineStep");
  }
}

/** @internal Records one complete step module created through `createStep`. */
export function registerCanonicalStepInternal(step: object): void {
  canonicalSteps.add(step);
}

/** @internal Reports whether the exact step identity was created by `createStep`. */
export function isCanonicalStepInternal(step: object): boolean {
  return canonicalSteps.has(step);
}
