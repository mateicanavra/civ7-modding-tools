import { type Static, Type } from "@swooper/mapgen-core/authoring/schema";

import {
  ResourceFamilySchema,
  ResourceSymbolSchema,
} from "../../../../model/atoms/resource-family.schema.js";
import { ResourceLaneKindSchema } from "../../../../model/atoms/resource-site-intent.schema.js";

/** Planner phase retained by an adjusted intent or assigned to a support addition. */
export const AdjustedResourcePhaseSchema = Type.Union(
  [
    Type.Literal("rotation"),
    Type.Literal("range-floor"),
    Type.Literal("region-minimum"),
    Type.Literal("support"),
  ],
  {
    description:
      "Moved intents preserve their original planner phase while support additions use support.",
  }
);

/** Product objective that caused one support adjustment. */
export const ResourceSupportReasonSchema = Type.Union(
  [Type.Literal("support-floor"), Type.Literal("support-equity")],
  {
    description:
      "Support-floor fills a seat deficit; support-equity reduces cross-player support disparity.",
  }
);

const ResourceSupportSeatIndexSchema = Type.Integer({
  minimum: 0,
  description: "Seat whose floor or equity objective the adjustment serves.",
});

const ResourceSupportFromPlotIndexSchema = Type.Integer({
  minimum: 0,
  description: "Original plot vacated by a moved resource intent.",
});

/** Provenance attached to an adjusted intent at its terminal plot. */
export const ResourceSupportProvenanceSchema = Type.Union(
  [
    Type.Object(
      {
        action: Type.Literal("move"),
        reason: ResourceSupportReasonSchema,
        seatIndex: ResourceSupportSeatIndexSchema,
        fromPlotIndex: ResourceSupportFromPlotIndexSchema,
      },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        action: Type.Literal("add"),
        reason: ResourceSupportReasonSchema,
        seatIndex: ResourceSupportSeatIndexSchema,
      },
      { additionalProperties: false }
    ),
  ],
  {
    description:
      "Terminal support provenance: moves retain a source plot while additions cannot claim one.",
  }
);

/** One terminal resource intent after the support-equity pass. */
export const AdjustedResourceIntentSchema = Type.Object(
  {
    plotIndex: Type.Integer({ minimum: 0 }),
    x: Type.Integer({ minimum: 0 }),
    y: Type.Integer({ minimum: 0 }),
    resourceType: ResourceSymbolSchema,
    family: ResourceFamilySchema,
    laneId: Type.String(),
    laneKind: ResourceLaneKindSchema,
    phase: AdjustedResourcePhaseSchema,
    order: Type.Integer({ minimum: 0 }),
    regionSlot: Type.Integer({ minimum: 0, maximum: 2 }),
    landmassId: Type.Integer({ minimum: -1 }),
    inHabitat: Type.Boolean(),
    support: Type.Optional(ResourceSupportProvenanceSchema),
  },
  {
    additionalProperties: false,
    description: "One resource intent after bounded support adjustment.",
  }
);

const ResourceSupportAdjustmentProperties = {
  reason: ResourceSupportReasonSchema,
  resourceType: ResourceSymbolSchema,
  toPlotIndex: Type.Integer({
    minimum: 0,
    description: "Final plot occupied by the adjusted resource intent.",
  }),
  seatIndex: ResourceSupportSeatIndexSchema,
} as const;

/** Evidence row paired with one adjusted intent's terminal provenance. */
export const ResourceSupportAdjustmentSchema = Type.Union(
  [
    Type.Object(
      {
        action: Type.Literal("move"),
        ...ResourceSupportAdjustmentProperties,
        fromPlotIndex: ResourceSupportFromPlotIndexSchema,
      },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        action: Type.Literal("add"),
        ...ResourceSupportAdjustmentProperties,
      },
      { additionalProperties: false }
    ),
  ],
  {
    description:
      "Closed adjustment evidence paired bijectively with intent provenance at its destination.",
  }
);

/** Static adjusted resource intent. */
export type AdjustedResourceIntent = Static<typeof AdjustedResourceIntentSchema>;

/** Static support adjustment evidence row. */
export type ResourceSupportAdjustment = Static<typeof ResourceSupportAdjustmentSchema>;
