import placement from "@mapgen/domain/placement";
import resources from "@mapgen/domain/resources";
import { type TSchema, Type } from "typebox";

function defaultEnvelope(config: unknown): { strategy: "default"; config: unknown } {
  return { strategy: "default", config: config ?? {} };
}

/**
 * Derives a public schema from an op's default strategy config schema instead
 * of hand-shadowing the operation fields.
 */
function defaultStrategyConfigSchema(opConfig: TSchema, description: string): TSchema {
  const variants = (opConfig as { anyOf?: unknown[] }).anyOf ?? [];
  const variant = variants.find((candidate) => {
    const strategy = (candidate as { properties?: { strategy?: { const?: unknown } } }).properties
      ?.strategy;
    return strategy?.const === "default";
  }) as { properties?: { config?: TSchema } } | undefined;
  const config = variant?.properties?.config;
  if (!config) {
    throw new Error("Placement public schema expected a default strategy config schema.");
  }
  return Type.Unsafe({
    ...(config as Record<string, unknown>),
    description,
  });
}

export const PlacementKnobsSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Placement knobs. Late placement currently exposes product controls rather than stage-wide knobs.",
  }
);

export const PlacementNaturalWondersSchema = Type.Object(
  {
    minSpacingTiles: Type.Optional(
      Type.Integer({
        default: 6,
        minimum: 0,
        maximum: 16,
        description:
          "Sets the minimum hex spacing between planned natural wonders; higher values spread wonders farther apart and can reduce placement count on constrained maps.",
      })
    ),
  },
  {
    additionalProperties: false,
    description:
      "Natural wonder placement controls for spacing planned wonder stamps before Civ7 feature materialization.",
  }
);

// Discoveries are placed by Civ7's official discovery generator through the
// adapter; map authors should not tune narrative-system density here.

export const PlacementResourcesSchema = defaultStrategyConfigSchema(
  resources.ops.selectResourceSites.config,
  "Resource site-selection controls: density and sparsity scaling within authored per-type ranges, official-Weight rarity fidelity, blue-noise site spacing, per-type spacing-floor scaling, per-landmass equity ceiling, per-family density overrides, and resource-resource affinity/exclusion rules. Per-type targets come from the resource-domain earthlike expectation corpus, not authored config."
);

export const PlacementStartsSchema = defaultStrategyConfigSchema(
  placement.ops.planStarts.config,
  "Start placement controls: first-age expansion viability and island-start tiers, spacing floor/target (official 6/12 buffers), scoring weights (fertility, freshwater, climate comfort, resource support, roughness with tunable divisor), tier bias, ranking blend, fairness tolerance for the balancing pass, and coastal/river start preference."
);

export const PlacementSupportSchema = defaultStrategyConfigSchema(
  resources.ops.adjustResourceSupport.config,
  "Resource-to-start support pass controls (S5; runs after start assignment and before resource stamping): per-start support floor within a radius, cross-player equity tolerance, enable switch, and adjustment strength. Earth-like defaults reproduce the E3.1/E3.2 gates."
);

export const PlacementPublicSchema = Type.Object(
  {
    naturalWonders: Type.Optional(PlacementNaturalWondersSchema),
    resources: Type.Optional(PlacementResourcesSchema),
    starts: Type.Optional(PlacementStartsSchema),
    support: Type.Optional(PlacementSupportSchema),
  },
  {
    additionalProperties: false,
    description:
      "Placement authoring controls for late gameplay products: natural wonders, resources, first-age viable starts, and the resource-to-start support pass. Discoveries are placed by Civ7's official generator and are not authored here. Runtime map-size start counts and adapter catalogs are supplied by the run environment rather than authored here.",
  }
);

export function compilePlacementPublicConfig(config: Record<string, unknown>) {
  return {
    "derive-placement-inputs": {
      wonders: defaultEnvelope({}),
      naturalWonders: defaultEnvelope(config.naturalWonders),
    },
    "plot-landmass-regions": {},
    "place-natural-wonders": {},
    "prepare-placement-surface": {},
    "plan-resources": {
      selectSites: defaultEnvelope(config.resources),
    },
    "assign-starts": {
      starts: defaultEnvelope(config.starts),
    },
    "adjust-resources": {
      support: defaultEnvelope(config.support),
    },
    "place-resources": {},
    "place-discoveries": {},
    "assign-advanced-starts": {},
    placement: {},
  };
}
