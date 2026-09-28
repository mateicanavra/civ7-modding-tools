import { Type } from "@swooper/mapgen-core/authoring/schema";
import { BasinFluxSchema } from "./basin-water-budget.schema.js";

export const OpenBasinBodySchema = Type.Object(
  {
    nodeId: Type.Integer({
      minimum: 1,
      description: "Positive root node identity; zero is reserved for cells outside any body.",
    }),
    wetCells: Type.Array(Type.Integer({ minimum: 0 }), {
      description: "Complete strict full-sill footprint, sorted by cell identity.",
    }),
    spillElevation: Type.Integer(),
    outletCell: Type.Integer({
      minimum: 0,
      description: "The sole wet source of the outward body connection.",
    }),
    receiverCell: Type.Integer({
      minimum: 0,
      description: "Adjacent receiver outside the strict body.",
    }),
    connectorCells: Type.Array(Type.Integer({ minimum: 0 }), {
      description: "Reversed dry-at-sill path in recorded spill-to-wet order.",
    }),
    flux: BasinFluxSchema,
    outflow: Type.Number({ minimum: 0 }),
  },
  { additionalProperties: false }
);

export const OpenBasinCertificateSchema = Type.Object(
  {
    nodeId: Type.Integer({ minimum: 1 }),
    spillBalance: Type.Number({ exclusiveMinimum: 0 }),
  },
  { additionalProperties: false }
);

export const MarineDischargeExitSchema = Type.Object(
  {
    fromCell: Type.Integer({ minimum: 0 }),
    marineCell: Type.Integer({ minimum: 0 }),
    discharge: Type.Number({ minimum: 0 }),
  },
  { additionalProperties: false }
);

export const WaterConservationSchema = Type.Object(
  {
    dryRunoff: Type.Number({ minimum: 0 }),
    wetPrecipitation: Type.Number({ minimum: 0 }),
    wetDemand: Type.Number({ minimum: 0 }),
    externalDischarge: Type.Number({ minimum: 0 }),
    residual: Type.Number(),
    roundoffBound: Type.Number({ minimum: 0 }),
  },
  { additionalProperties: false }
);
