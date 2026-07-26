import { type Static, Type } from "@swooper/mapgen-core/authoring/schema";

import { ResourceFamilySchema, ResourceSymbolSchema } from "./resource-family.schema.js";

/** Medium on which one resource intent may be placed. */
export const ResourceLaneKindSchema = Type.Union([Type.Literal("land"), Type.Literal("water")]);

/** Planner pass that admitted one resource intent. */
export const ResourcePlanPhaseSchema = Type.Union([
  Type.Literal("rotation"),
  Type.Literal("range-floor"),
  Type.Literal("region-minimum"),
]);

/** One symbolic resource placement selected under habitat and policy constraints. */
export const ResourcePlanIntentSchema = Type.Object(
  {
    plotIndex: Type.Integer({ minimum: 0 }),
    x: Type.Integer({ minimum: 0 }),
    y: Type.Integer({ minimum: 0 }),
    resourceType: ResourceSymbolSchema,
    family: ResourceFamilySchema,
    laneId: Type.String(),
    laneKind: ResourceLaneKindSchema,
    phase: ResourcePlanPhaseSchema,
    order: Type.Integer({ minimum: 0 }),
    regionSlot: Type.Integer({ minimum: 0, maximum: 2 }),
    landmassId: Type.Integer({ minimum: -1 }),
    inHabitat: Type.Boolean(),
  },
  {
    additionalProperties: false,
    description:
      "One site-selected symbolic resource intent with placement-pass and geography provenance.",
  }
);

/** Static value admitted by {@link ResourcePlanIntentSchema}. */
export type ResourcePlanIntent = Static<typeof ResourcePlanIntentSchema>;
