/**
 * @swooper/mapgen-core - Map generation authoring and execution SDK
 *
 * This package owns the generic MapGen language, runtime, trace, artifact
 * system, and reusable primitives. Product domain algorithms remain in their
 * map mod.
 *
 * Architecture:
 * - engine/: Step wiring + execution primitives
 * - authoring/: Recipe/stage/step factories
 * - core/: Shared utilities and types
 * - content package: mod-owned domain libraries + recipes live in mods/mod-swooper-maps
 */

// Re-export core types from adapter
export type { EngineAdapter } from "@civ7/adapter";

// Re-export core utilities and types
export * from "@mapgen/core/index.js";
// Re-export dev diagnostics module
export * from "@mapgen/dev/index.js";
// Re-export engine primitives (runtime SDK)
export * from "@mapgen/engine/index.js";
// Re-export tracing primitives
export * from "@mapgen/trace/index.js";

// Package version
export const VERSION = "0.1.0";
