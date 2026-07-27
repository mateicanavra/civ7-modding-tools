import type { MapContext } from "@mapgen/core/map-context.js";
import {
  assertTerminalMapContextObservationInternal,
  readMapContextArtifactInternal,
} from "@mapgen/core/map-context.js";

import { type Artifact, type ArtifactReadValueOf, assertArtifact } from "./contract.js";

/** Terminal artifact observation that keeps absence distinct from every admitted value. */
export type ArtifactObservation<A extends Artifact> =
  | Readonly<{ found: false }>
  | Readonly<{ found: true; value: ArtifactReadValueOf<A> }>;

function observeStoredArtifact<A extends Artifact>(
  context: MapContext,
  artifact: A
): ArtifactObservation<A> {
  const observation = readMapContextArtifactInternal(context, artifact);
  if (!observation.found) return Object.freeze({ found: false });
  return Object.freeze({
    found: true,
    value: observation.value as ArtifactReadValueOf<A>,
  });
}

/**
 * Reads one admitted artifact after a MapContext execution attempt has completed.
 * Only the exact executor-owned root is admitted; authored steps must use their declared artifact
 * dependencies. Publication is the artifact's sole admission transition, so terminal access
 * observes the write-once store without rerunning validation or taking a snapshot. Callers that
 * cross a mutable boundary must copy what they consume.
 */
export function readArtifact<A extends Artifact>(
  context: MapContext,
  artifact: A
): ArtifactReadValueOf<A> {
  assertArtifact(artifact);
  assertTerminalMapContextObservationInternal(context);
  const observation = observeStoredArtifact(context, artifact);
  if (observation.found) return observation.value;
  throw new Error(`Missing required artifact ${artifact.id}.`);
}

/**
 * Observes optional evidence after a MapContext execution attempt through its artifact authority.
 * Only the exact completed root is admitted. Exact artifact identity selects the stored value, and
 * absence remains distinct from every value admitted during publication.
 */
export function observeArtifact<A extends Artifact>(
  context: MapContext,
  artifact: A
): ArtifactObservation<A> {
  assertArtifact(artifact);
  assertTerminalMapContextObservationInternal(context);
  return observeStoredArtifact(context, artifact);
}
