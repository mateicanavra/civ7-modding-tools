import * as earthlikeExpectations from "./earthlike-expectations.artifact.js";

export { earthlikeExpectations };

/** Full Resources artifact modules for consumers that need schemas, handles, and validators. */
export const artifactContracts = {
  earthlikeExpectations,
} as const;

/** Registered Resources artifact handles keyed for recipe publication and lookup. */
export const artifacts = {
  earthlikeExpectations: earthlikeExpectations.artifact,
} as const;

/** Resources payload validators keyed identically to the artifact-handle catalog. */
export const validators = {
  earthlikeExpectations: earthlikeExpectations.validate,
} as const;
