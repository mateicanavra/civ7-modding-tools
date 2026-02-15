import { Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring";
import type { Static } from "@swooper/mapgen-core/authoring";

export const TectonicEventSchema = Type.Object(
  {
    eventType: Type.Integer({ minimum: 0, maximum: 255 }),
    plateA: Type.Integer({ minimum: -1, maximum: 32767 }),
    plateB: Type.Integer({ minimum: -1, maximum: 32767 }),
    polarity: Type.Integer({ minimum: -127, maximum: 127 }),
    intensityUplift: Type.Integer({ minimum: 0, maximum: 255 }),
    intensityRift: Type.Integer({ minimum: 0, maximum: 255 }),
    intensityShear: Type.Integer({ minimum: 0, maximum: 255 }),
    intensityVolcanism: Type.Integer({ minimum: 0, maximum: 255 }),
    intensityFracture: Type.Integer({ minimum: 0, maximum: 255 }),
    driftU: Type.Integer({ minimum: -127, maximum: 127 }),
    driftV: Type.Integer({ minimum: -127, maximum: 127 }),
    seedCells: Type.Array(Type.Integer({ minimum: 0 })),
    originPlateId: Type.Integer({ minimum: -1, maximum: 32767 }),
  },
  { additionalProperties: false }
);

export const TectonicEventsSchema = Type.Array(TectonicEventSchema);

export const FoundationTectonicEraFieldsInternalSchema = Type.Object(
  {
    boundaryType: TypedArraySchemas.u8({ shape: null }),
    boundaryPolarity: TypedArraySchemas.i8({ shape: null }),
    boundaryIntensity: TypedArraySchemas.u8({ shape: null }),
    upliftPotential: TypedArraySchemas.u8({ shape: null }),
    collisionPotential: TypedArraySchemas.u8({ shape: null }),
    subductionPotential: TypedArraySchemas.u8({ shape: null }),
    riftPotential: TypedArraySchemas.u8({ shape: null }),
    shearStress: TypedArraySchemas.u8({ shape: null }),
    volcanism: TypedArraySchemas.u8({ shape: null }),
    fracture: TypedArraySchemas.u8({ shape: null }),
    riftOriginPlate: TypedArraySchemas.i16({ shape: null }),
    volcanismOriginPlate: TypedArraySchemas.i16({ shape: null }),
    volcanismEventType: TypedArraySchemas.u8({ shape: null }),
    boundaryDriftU: TypedArraySchemas.i8({ shape: null }),
    boundaryDriftV: TypedArraySchemas.i8({ shape: null }),
  },
  { additionalProperties: false }
);

export const FoundationTectonicEraFieldsInternalListSchema = Type.Array(FoundationTectonicEraFieldsInternalSchema);

export const PlateIdByEraSchema = Type.Array(TypedArraySchemas.i16({ shape: null }));

export const TracerIndexByEraSchema = Type.Array(TypedArraySchemas.u32({ shape: null }));

export type TectonicEventRecord = Static<typeof TectonicEventSchema>;
export type FoundationTectonicEraFieldsInternal = Static<typeof FoundationTectonicEraFieldsInternalSchema>;
