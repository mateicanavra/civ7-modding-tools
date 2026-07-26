import { type Static, Type } from "@swooper/mapgen-core/authoring/schema";

/** Stable numeric identities carried by reconstructed tectonic event records. */
export const EVENT_TYPE = {
  convergenceSubduction: 1,
  convergenceCollision: 2,
  divergenceRift: 3,
  transformShear: 4,
  intraplateHotspot: 5,
} as const;

/** Closed tectonic event identity admitted by Foundation history operations. */
export const TectonicEventTypeSchema = Type.Union(
  [
    Type.Literal(EVENT_TYPE.convergenceSubduction),
    Type.Literal(EVENT_TYPE.convergenceCollision),
    Type.Literal(EVENT_TYPE.divergenceRift),
    Type.Literal(EVENT_TYPE.transformShear),
    Type.Literal(EVENT_TYPE.intraplateHotspot),
  ],
  { description: "Closed tectonic boundary or hotspot event classification." }
);

/** One boundary or hotspot event emitted while reconstructing a tectonic era. */
export const TectonicEventSchema = Type.Object(
  {
    eventType: TectonicEventTypeSchema,
    plateA: Type.Integer({
      minimum: -1,
      maximum: 32767,
      description: "Primary participating plate identifier, or -1 when no plate owns the event.",
    }),
    plateB: Type.Integer({
      minimum: -1,
      maximum: 32767,
      description: "Secondary participating plate identifier, or -1 for a single-plate event.",
    }),
    polarity: Type.Integer({
      minimum: -127,
      maximum: 127,
      description: "Signed convergence polarity identifying the overriding side of the event.",
    }),
    intensityUplift: Type.Integer({
      minimum: 0,
      maximum: 255,
      description: "Quantized uplift contribution emitted by the event.",
    }),
    intensityRift: Type.Integer({
      minimum: 0,
      maximum: 255,
      description: "Quantized extensional-rift contribution emitted by the event.",
    }),
    intensityShear: Type.Integer({
      minimum: 0,
      maximum: 255,
      description: "Quantized transform-shear contribution emitted by the event.",
    }),
    intensityVolcanism: Type.Integer({
      minimum: 0,
      maximum: 255,
      description: "Quantized volcanic contribution emitted by the event.",
    }),
    intensityFracture: Type.Integer({
      minimum: 0,
      maximum: 255,
      description: "Quantized lithospheric-fracture contribution emitted by the event.",
    }),
    driftU: Type.Integer({
      minimum: -127,
      maximum: 127,
      description: "Quantized east-west transport applied while reconstructing the event.",
    }),
    driftV: Type.Integer({
      minimum: -127,
      maximum: 127,
      description: "Quantized north-south transport applied while reconstructing the event.",
    }),
    seedCells: Type.Array(
      Type.Integer({
        minimum: 0,
        description: "Mesh-cell index that seeds the event's spatial influence.",
      }),
      { description: "Mesh cells from which this tectonic event propagates." }
    ),
    originPlateId: Type.Integer({
      minimum: -1,
      maximum: 32767,
      description: "Plate that originated the event's transported signal, or -1 when unowned.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "A reconstructed boundary or hotspot event with plate identity, intensity, drift, and seed cells.",
  }
);

/** One reconstructed tectonic event. */
export type TectonicEvent = Static<typeof TectonicEventSchema>;

/** Stable numeric identity of one reconstructed tectonic event class. */
export type TectonicEventType = Static<typeof TectonicEventTypeSchema>;
