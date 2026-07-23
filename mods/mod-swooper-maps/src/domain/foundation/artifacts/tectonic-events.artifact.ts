import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

const EventSchema = Type.Object(
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

/** Closed structural contract for emitted tectonic events. */
const Schema = Type.Array(EventSchema);

/** Tectonic events published by Foundation. */
export type Artifact = Static<typeof Schema>;

/** Registers Foundation's tectonic-events artifact. */
export const artifact = defineArtifact({
  name: "foundationTectonicEvents",
  id: "artifact:foundation.tectonicEvents",
  schema: Schema,
});
