import * as earthlikeExpectations from "./earthlike-expectations.artifact.js";

export { earthlikeExpectations };

export const artifactContracts = {
  earthlikeExpectations,
} as const;

export const artifacts = {
  earthlikeExpectations: earthlikeExpectations.artifact,
} as const;

export const validators = {
  earthlikeExpectations: earthlikeExpectations.validate,
} as const;
