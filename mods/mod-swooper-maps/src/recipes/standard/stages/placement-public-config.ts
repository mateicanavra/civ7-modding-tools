import placement from "@mapgen/domain/placement";
import resources from "@mapgen/domain/resources";
import { type TSchema, Type } from "typebox";

function defaultEnvelope(config: unknown): { strategy: "default"; config: unknown } {
  return { strategy: "default", config };
}

function requiredPublicSchema<T extends TSchema>(schema: T, description: string) {
  return Type.With(schema, { description });
}

export const PlacementKnobsSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Placement knobs. Late placement currently exposes product controls rather than stage-wide knobs.",
  }
);

export const PlacementNaturalWondersSchema = requiredPublicSchema(
  placement.ops.planNaturalWonders.strategies.default,
  "Natural wonder placement controls for spacing planned wonder stamps before Civ7 feature materialization."
);

// Discoveries are placed by Civ7's official discovery generator through the
// adapter; map authors should not tune narrative-system density here.

export const PlacementResourcesSchema = requiredPublicSchema(
  resources.ops.selectResourceSites.strategies.default,
  "Resource site-selection controls: density and sparsity scaling within authored per-type ranges, official-Weight rarity fidelity, blue-noise site spacing, per-type spacing-floor scaling, per-landmass equity ceiling, per-family density overrides, and resource-resource affinity/exclusion rules. Per-type targets come from the resource-domain earthlike expectation corpus, not authored config."
);

export const PlacementStartsSchema = requiredPublicSchema(
  placement.ops.planStarts.strategies.default,
  "Start placement controls: first-age expansion viability and island-start tiers, spacing floor/target (official 6/12 buffers), scoring weights (fertility, freshwater, climate comfort, resource support, roughness with tunable divisor), tier bias, ranking blend, fairness tolerance for the balancing pass, and coastal/river start preference."
);

export const PlacementSupportSchema = requiredPublicSchema(
  resources.ops.adjustResourceSupport.strategies.default,
  "Resource-to-start support pass controls (S5; runs after start assignment and before resource stamping): per-start support floor within a radius, cross-player equity tolerance, enable switch, and adjustment strength. Earth-like defaults reproduce the E3.1/E3.2 gates."
);

export const PlacementPublicSchema = Type.Object(
  {
    naturalWonders: PlacementNaturalWondersSchema,
    resources: PlacementResourcesSchema,
    starts: PlacementStartsSchema,
    support: PlacementSupportSchema,
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
