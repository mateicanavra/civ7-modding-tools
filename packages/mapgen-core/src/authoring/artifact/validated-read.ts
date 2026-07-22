import type { MapContext } from "@mapgen/core/map-context.js";
import {
  assertTerminalMapContextObservationInternal,
  readMapContextArtifactInternal,
} from "@mapgen/core/map-context.js";

import type { ArtifactContract, ArtifactReadValueOf } from "./contract.js";
import { type ArtifactModule, snapshotArtifactModule } from "./module.js";

/** Module-bound observation that keeps absence distinct from any admitted artifact value. */
export type ValidatedArtifactObservation<C extends ArtifactContract> =
  | Readonly<{ found: false }>
  | Readonly<{ found: true; value: ArtifactReadValueOf<C> }>;

function observeSnapshot<C extends ArtifactContract>(
  context: MapContext,
  snapshot: ArtifactModule<C>
): ValidatedArtifactObservation<C> {
  const artifact = snapshot.artifact;
  const observation = readMapContextArtifactInternal(context, artifact);
  if (!observation.found) return Object.freeze({ found: false });
  const issues = snapshot.validate(observation.value, { dimensions: context.setup.dimensions });
  if (issues.length > 0) {
    throw new Error(
      `Invalid artifact ${artifact.id}: ${issues.map(({ message }) => message).join("; ")}`
    );
  }
  return Object.freeze({
    found: true,
    value: observation.value as ArtifactReadValueOf<C>,
  });
}

/** @internal Observes module-bound evidence while the executor evaluates dependency tags. */
export function observeValidatedArtifactInternal<C extends ArtifactContract>(
  context: MapContext,
  module: ArtifactModule<C>
): ValidatedArtifactObservation<C> {
  return observeSnapshot(context, snapshotArtifactModule(module, "artifact module"));
}

/**
 * Reads and validates one stored artifact after a MapContext execution attempt has completed.
 * Only the exact executor-owned root is admitted; authored steps must use their declared artifact
 * dependencies. The module's complete validator owns structural and semantic admission. This
 * function neither snapshots the value nor invents missing evidence, so callers that cross a
 * mutable boundary must copy what they consume.
 */
export function readValidatedArtifact<C extends ArtifactContract>(
  context: MapContext,
  module: ArtifactModule<C>
): ArtifactReadValueOf<C> {
  const snapshot = snapshotArtifactModule(module, "artifact module");
  assertTerminalMapContextObservationInternal(context);
  const observation = observeSnapshot(context, snapshot);
  if (observation.found) return observation.value;
  throw new Error(`Missing required artifact ${snapshot.artifact.id}.`);
}

/**
 * Observes optional evidence after a MapContext execution attempt through its module authority.
 * Only the exact completed root is admitted; absence remains distinct from every admitted value,
 * while invalid present evidence fails closed.
 */
export function observeValidatedArtifact<C extends ArtifactContract>(
  context: MapContext,
  module: ArtifactModule<C>
): ValidatedArtifactObservation<C> {
  const snapshot = snapshotArtifactModule(module, "artifact module");
  assertTerminalMapContextObservationInternal(context);
  return observeSnapshot(context, snapshot);
}
