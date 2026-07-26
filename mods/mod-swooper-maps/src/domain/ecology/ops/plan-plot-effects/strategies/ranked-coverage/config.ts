import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Selects the strongest eligible tiles per family while preserving coverage and hazard thresholds.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "ranked-coverage",
  config: Type.Object({
    snow: Type.Object(
      {
        enabled: Type.Boolean({
          default: true,
          description: "Enable planning of snow plot effects.",
        }),
        coveragePct: Type.Number({
          default: 80,
          minimum: 0,
          maximum: 100,
          description:
            "Percent of eligible snow tiles to place (deterministic top-coverage selection).",
        }),
        lightThreshold: Type.Number({
          default: 0.35,
          minimum: 0,
          maximum: 1,
          description: "Minimum snowScore01 to place at least light snow intent.",
        }),
        mediumThreshold: Type.Number({
          default: 0.6,
          minimum: 0,
          maximum: 1,
          description: "Minimum snowScore01 to place medium snow intent.",
        }),
        heavyThreshold: Type.Number({
          default: 0.8,
          minimum: 0,
          maximum: 1,
          description: "Minimum snowScore01 to place heavy snow intent.",
        }),
        hazardEnabled: Type.Boolean({
          default: false,
          description: "Co-place frostbite intent on the coldest selected snow tiles.",
        }),
        hazardThreshold: Type.Number({
          default: 0.85,
          minimum: 0,
          maximum: 1,
          description:
            "Minimum snowScore01 (deepest cold) for a selected snow tile to also receive the hazard.",
        }),
      },
      { description: "Controls snow plot-effect coverage, thresholds, and optional hazard intent." }
    ),
    sand: Type.Object(
      {
        enabled: Type.Boolean({
          default: false,
          description: "Enable planning of sand plot effects.",
        }),
        hazardEnabled: Type.Boolean({
          default: false,
          description: "Co-place desert-heat intent on selected sand tiles.",
        }),
        coveragePct: Type.Number({
          default: 18,
          minimum: 0,
          maximum: 100,
          description:
            "Percent of eligible sand tiles to place (deterministic top-coverage selection).",
        }),
      },
      { description: "Controls sand plot-effect coverage and optional hazard intent." }
    ),
    burned: Type.Object(
      {
        enabled: Type.Boolean({
          default: false,
          description: "Enable planning of burned plot effects.",
        }),
        coveragePct: Type.Number({
          default: 8,
          minimum: 0,
          maximum: 100,
          description:
            "Percent of eligible burned tiles to place (deterministic top-coverage selection).",
        }),
      },
      { description: "Controls burned plot-effect coverage." }
    ),
    jungle: Type.Object(
      {
        enabled: Type.Boolean({
          default: false,
          description: "Enable planning of jungle plot effects.",
        }),
        coveragePct: Type.Number({
          default: 12,
          minimum: 0,
          maximum: 100,
          description:
            "Percent of eligible jungle tiles to place (deterministic top-coverage selection).",
        }),
      },
      { description: "Controls jungle plot-effect coverage." }
    ),
  }),
});
