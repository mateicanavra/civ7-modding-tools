import * as corpus from "./corpus.artifact.js";
import * as earthlikeExpectations from "./earthlike-expectations.artifact.js";

export { corpus, earthlikeExpectations };

export const artifactContracts = {
  corpus,
  earthlikeExpectations,
} as const;

export const validators = {
  corpus: corpus.validate,
  earthlikeExpectations: earthlikeExpectations.validate,
} as const;
