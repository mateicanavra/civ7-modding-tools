import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Semantic identity and authored thresholds for viability-ranked, fairness-balanced starts.
 * Map evidence and the complete start-plan result remain owned by the shared operation contract.
 */
export default defineStrategy({
  id: "viability-fairness",
  config: Type.Object(
    {
      minContiguousLandTiles: Type.Integer({
        minimum: 1,
        maximum: 400,
        default: 24,
        description: "Minimum connected landmass size for a normal first-age start candidate.",
      }),
      expansionRadiusTiles: Type.Integer({
        minimum: 1,
        maximum: 8,
        default: 4,
        description: "Radius used to measure immediate land expansion around a candidate.",
      }),
      minExpansionLandTiles: Type.Integer({
        minimum: 1,
        maximum: 120,
        default: 14,
        description: "Minimum same-landmass land tiles inside the expansion radius.",
      }),
      islandClusterRadiusTiles: Type.Integer({
        minimum: 1,
        maximum: 10,
        default: 5,
        description: "Radius used to evaluate nearby expansion land for intentional island starts.",
      }),
      minIslandClusterLandTiles: Type.Integer({
        minimum: 1,
        maximum: 160,
        default: 18,
        description:
          "Minimum nearby land across small islands for an intentional archipelago start.",
      }),
      maxIslandStartCoastDistance: Type.Integer({
        minimum: 0,
        maximum: 8,
        default: 1,
        description:
          "Maximum coast distance for small-island starts; keeps island starts connected to water gameplay.",
      }),
      marginalLandRatio: Type.Number({
        minimum: 0.1,
        maximum: 1,
        default: 0.5,
        description:
          "Fraction of minContiguousLandTiles a marginal-tier candidate must still reach.",
      }),
      marginalExpansionRatio: Type.Number({
        minimum: 0.1,
        maximum: 1,
        default: 0.65,
        description:
          "Fraction of minExpansionLandTiles a marginal-tier candidate must still reach.",
      }),
      spacingFloorTiles: Type.Integer({
        minimum: 0,
        maximum: 12,
        default: 6,
        description:
          "Hard minimum odd-q spacing between starts (official required buffer). Only the spacing-relaxed last-resort rung may go below it, and that is recorded loudly per seat.",
      }),
      desiredSpacingTiles: Type.Integer({
        minimum: 0,
        maximum: 24,
        default: 12,
        description:
          "Desired odd-q spacing between starts (official desired buffer). A score taper, not a floor: selection relaxes from here down to the hard floor, recording every relaxation.",
      }),
      fertilityWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 2.2,
        description: "Weight for local fertility (candidate-rank normalized) in start score.",
      }),
      resourceSupportWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 0.5,
        description: "Weight for nearby planned-resource support in start score.",
      }),
      resourceSupportRadiusTiles: Type.Integer({
        minimum: 0,
        maximum: 8,
        default: 4,
        description: "Radius used to count nearby planned-resource support for starts.",
      }),
      freshwaterWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 1.1,
        description: "Weight for river/lake adjacency support in start score.",
      }),
      largeLandmassWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 1,
        description: "Weight for contiguous-land and nearby expansion-area support.",
      }),
      climateWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 1.6,
        description:
          "Weight for climate comfort (distance from land-decile aridity/temperature extremes) in start score.",
      }),
      climateExtremePenaltyWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 1.5,
        description:
          "Extra subtractive penalty for candidates inside the top land aridity decile or the outer land temperature deciles (E1.8 screen).",
      }),
      roughnessPenaltyWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 0.6,
        description: "Penalty weight for locally rugged starts.",
      }),
      roughnessDivisor: Type.Number({
        minimum: 100,
        maximum: 3000,
        default: 900,
        description: "Elevation range (m) that maps local relief to a full roughness penalty.",
      }),
      tierBias: Type.Object(
        {
          primary: Type.Number({
            minimum: -0.2,
            maximum: 0.2,
            default: 0.08,
            description: "Additive score bias for primary-tier (full land-area) candidates.",
          }),
          islandCluster: Type.Number({
            minimum: -0.2,
            maximum: 0.2,
            default: 0.02,
            description: "Additive score bias for intentional island-cluster candidates.",
          }),
          marginal: Type.Number({
            minimum: -0.2,
            maximum: 0.2,
            default: -0.08,
            description: "Additive score bias for marginal-tier (reduced land-area) candidates.",
          }),
        },
        {
          additionalProperties: false,
          description: "Additive score bias per viability tier.",
        }
      ),
      rankingBlend: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0.86,
        description:
          "Share of the selection ranking taken by the viability score; the remainder rewards spacing up to desiredSpacingTiles.",
      }),
      fairnessTolerance: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0.3,
        description:
          "Maximum allowed worst-pair score gap before the deterministic balancing pass swaps weak seats (E1.6).",
      }),
      coastalPreferenceWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 0,
        description: "Weight preferring coastal-land start tiles (0 = neutral).",
      }),
      riverPreferenceWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 0,
        description:
          "Weight preferring river-adjacent start tiles beyond the freshwater component (0 = neutral).",
      }),
    },
    {
      description:
        "First-age start viability, island admission, hex-tile spacing, score ranking, and cross-seat fairness controls.",
    }
  ),
});
