const canonicalArtifacts = new WeakSet<object>();
const validatorBindings = new WeakMap<object, object>();

/** Records one factory-created artifact identity in this package evaluator. */
export function registerCanonicalArtifact(artifact: object): void {
  canonicalArtifacts.add(artifact);
}

/** Reports whether an artifact identity came from this package evaluator's `defineArtifact`. */
export function isCanonicalArtifact(artifact: object): boolean {
  return canonicalArtifacts.has(artifact);
}

/** Binds one complete validator to the exact canonical artifact object it admits. */
export function bindArtifactValidator(validator: object, artifact: object): void {
  const existing = validatorBindings.get(validator);
  if (existing !== undefined && existing !== artifact) {
    throw new Error("artifact validator authority cannot be rebound");
  }
  validatorBindings.set(validator, artifact);
}

/** Reports whether a validator was factory-bound to the exact supplied artifact identity. */
export function isArtifactValidatorBoundTo(validator: object, artifact: object): boolean {
  return validatorBindings.get(validator) === artifact;
}
