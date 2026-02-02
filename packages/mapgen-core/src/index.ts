/**
 * @swooper/mapgen-core - Pure TypeScript domain library for map generation
 *
 * This package contains all map generation algorithms and can be tested
 * via `bun test` without the Civ7 game engine.
 *
 * Architecture:
 * - engine/: Step wiring + execution primitives
 * - authoring/: Recipe/stage/step factories
 * - core/: Shared utilities and types
 * - content package: mod-owned domain libraries + recipes live in mods/mod-swooper-maps
 */

// Re-export core types from adapter
export type { EngineAdapter, MapContext } from "@civ7/adapter";

// Re-export core utilities and types
export * from "@mapgen/core/index.js";

// Re-export dev diagnostics module
export * from "@mapgen/dev/index.js";

// Explicit dev surface exports used by pipeline steps.
// (Some consumers import these from the package root, not `@swooper/mapgen-core/dev`.)
export { snapshotEngineHeightfield, type EngineHeightfieldSnapshot } from "@mapgen/dev/engine-heightfield.js";

// Re-export tracing primitives
export * from "@mapgen/trace/index.js";

// Re-export engine primitives (runtime SDK)
export * from "@mapgen/engine/index.js";

// Package version
export const VERSION = "0.1.0";
