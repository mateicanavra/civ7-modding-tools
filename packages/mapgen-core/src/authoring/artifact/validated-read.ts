import type { MapContext } from "@mapgen/core/map-context.js";
import {
  assertTerminalMapContextObservationInternal,
  readMapContextArtifactInternal,
} from "@mapgen/core/map-context.js";

import { type Artifact, type ArtifactReadValueOf, assertArtifact } from "./contract.js";

/** Artifact-bound observation that keeps absence distinct from any admitted artifact value. */
export type ValidatedArtifactObservation<A extends Artifact> =
  | Readonly<{ found: false }>
  | Readonly<{ found: true; value: ArtifactReadValueOf<A> }>;

function observeArtifact<A extends Artifact>(
  context: MapContext,
  artifact: A
): ValidatedArtifactObservation<A> {
  const observation = readMapContextArtifactInternal(context, artifact);
  if (!observation.found) return Object.freeze({ found: false });
  const issues = artifact.validate(observation.value, { dimensions: context.setup.dimensions });
  if (issues.length > 0) {
    throw new Error(
      `Invalid artifact ${artifact.id}: ${issues.map(({ message }) => message).join("; ")}`
    );
  }
  return Object.freeze({
    found: true,
    value: observation.value as ArtifactReadValueOf<A>,
  });
}

/** @internal Observes artifact-bound evidence while the executor evaluates dependency tags. */
export function observeValidatedArtifactInternal<A extends Artifact>(
  context: MapContext,
  artifact: A
): ValidatedArtifactObservation<A> {
  assertArtifact(artifact);
  return observeArtifact(context, artifact);
}

/**
 * Reads and validates one stored artifact after a MapContext execution attempt has completed.
 * Only the exact executor-owned root is admitted; authored steps must use their declared artifact
 * dependencies. The artifact's complete validator owns structural and semantic admission. This
 * function neither snapshots the value nor invents missing evidence, so callers that cross a
 * mutable boundary must copy what they consume.
 */
export function readValidatedArtifact<A extends Artifact>(
  context: MapContext,
  artifact: A
): ArtifactReadValueOf<A> {
  assertArtifact(artifact);
  assertTerminalMapContextObservationInternal(context);
  const observation = observeArtifact(context, artifact);
  if (observation.found) return observation.value;
  throw new Error(`Missing required artifact ${artifact.id}.`);
}

/**
 * Observes optional evidence after a MapContext execution attempt through its artifact authority.
 * Only the exact completed root is admitted; absence remains distinct from every admitted value,
 * while invalid present evidence fails closed.
 */
export function observeValidatedArtifact<A extends Artifact>(
  context: MapContext,
  artifact: A
): ValidatedArtifactObservation<A> {
  assertArtifact(artifact);
  assertTerminalMapContextObservationInternal(context);
  return observeArtifact(context, artifact);
}
