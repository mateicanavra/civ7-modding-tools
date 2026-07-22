/**
 * @swooper/mapgen-core - Map generation authoring and execution SDK
 *
 * This package owns the generic MapGen language, runtime, trace, artifact
 * system, and reusable primitives. Product domain algorithms remain in their
 * map mod.
 *
 * Public entrypoints expose authoring, observation, and host-integration
 * contracts. Executor registries and plan-compilation machinery remain package
 * internals behind recipe modules.
 */

// Re-export core types from adapter
export type { EngineAdapter } from "@civ7/adapter";

// Re-export core utilities and types
export * from "@mapgen/core/index.js";
// Re-export the stable host facet contract without exposing executor internals.
export type {
  StepFacetFailure,
  StepFacetInput,
  StepFacetSinkContext,
  StepFacetSinks,
  StepFacets,
} from "@mapgen/engine/step-facets.js";
// Re-export tracing primitives
export * from "@mapgen/trace/index.js";

// Package version
export const VERSION = "0.1.0";
