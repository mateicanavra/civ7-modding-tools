import type { ArtifactValueOf } from "@swooper/mapgen-core/authoring/contracts";
import { Value } from "typebox/value";
import { artifactModules as hydrologyArtifactModules } from "../../../../../../../src/recipes/standard/stages/hydrology-hydrography/artifacts/index.js";

type RiverNetworkMetrics = ArtifactValueOf<
  typeof hydrologyArtifactModules.riverNetworkMetrics.artifact
>;
type RiverNetworkBenchmarkSummary = RiverNetworkMetrics["benchmarkSummary"];

const emptySummary = Object.freeze(
  Value.Create(
    hydrologyArtifactModules.riverNetworkMetrics.artifact.schema.properties.benchmarkSummary
  )
);

/**
 * Builds a structurally complete river-network benchmark summary for projection-step fixtures.
 * The artifact schema owns the full field set; callers override only evidence material to their
 * scenario so tests do not duplicate or drift from the production contract.
 */
export function createRiverNetworkBenchmarkSummaryFixture(
  overrides: Partial<RiverNetworkBenchmarkSummary> = {}
): RiverNetworkBenchmarkSummary {
  return Object.freeze({ ...emptySummary, ...overrides });
}
