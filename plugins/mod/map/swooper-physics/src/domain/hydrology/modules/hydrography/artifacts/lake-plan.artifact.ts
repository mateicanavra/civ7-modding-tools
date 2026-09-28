import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import {
  OpenBasinBodySchema,
  OpenBasinCertificateSchema,
  MarineDischargeExitSchema,
  WaterConservationSchema,
} from "../model/atoms/index.js";

const common = {
  width: Type.Integer({ minimum: 1 }),
  height: Type.Integer({ minimum: 1 }),
  lakeMask: TypedArraySchemas.u8({
    cardinality: "map-grid",
    description: "Physical lake footprint; the sole lake-mask authority before projection.",
  }),
  plannedLakeTileCount: Type.Integer({
    minimum: 0,
    description: "Footprint diagnostic, never a certified selection cap.",
  }),
};

/** Complete physical water intent, not a native readback or clipped projection. */
export const artifact = defineArtifact({
  name: "lakePlan",
  id: "artifact:hydrology.lakePlan",
  schema: Type.Union([
    Type.Object(
      {
        model: Type.Literal("legacy-sink-budget"),
        ...common,
        sinkLakeCount: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        model: Type.Literal("certified-sill-spill"),
        ...common,
        bodyId: TypedArraySchemas.i32({
          cardinality: "map-grid",
          description: "Positive containing root ID on wet cells; 0 outside strict bodies.",
        }),
        waterSurface: TypedArraySchemas.i16({
          cardinality: "map-grid",
          description:
            "Physical root sill height on wet cells, unchanged ground elsewhere; not native lake elevation.",
        }),
        bodies: Type.Array(
          Type.Object(
            {
              ...OpenBasinBodySchema.properties,
              floorCell: Type.Integer({ minimum: 0 }),
              floorElevation: Type.Integer(),
            },
            { additionalProperties: false }
          )
        ),
        certificates: Type.Array(OpenBasinCertificateSchema),
        marineExits: Type.Array(MarineDischargeExitSchema),
        conservation: WaterConservationSchema,
      },
      { additionalProperties: false }
    ),
  ]),
  refine: (value, { issues }) => {
    let count = 0;
    for (const cell of value.lakeMask) {
      if (cell === 1) count++;
      else if (cell !== 0) issues.add("Expected binary lakeMask.");
    }
    if (value.plannedLakeTileCount !== count)
      issues.add(
        `plannedLakeTileCount ${value.plannedLakeTileCount} does not match the ${count} planned tiles in lakeMask.`
      );
    if (value.model !== "certified-sill-spill") return;
    const represented = new Uint8Array(value.lakeMask.length);
    const ids = new Set<number>();
    const certifiedIds = new Set(value.certificates.map((certificate) => certificate.nodeId));
    for (const body of value.bodies) {
      if (ids.has(body.nodeId)) issues.add("Duplicate certified body identity.");
      ids.add(body.nodeId);
      if (!certifiedIds.has(body.nodeId)) issues.add("Certified body has no node certificate.");
      if (
        !body.wetCells.includes(body.floorCell) ||
        !body.wetCells.includes(body.outletCell) ||
        body.wetCells.includes(body.receiverCell) ||
        body.floorElevation >= body.spillElevation
      ) issues.add("Certified floor or outward connection contradicts its strict body.");
      if (body.flux.dryRunoff !== 0 || body.flux.balance !== body.outflow) {
        issues.add("Certified body outflow must equal its mixed wet-body ledger.");
      }
      if (body.connectorCells.some((cell) => cell >= represented.length || value.lakeMask[cell] !== 0)) {
        issues.add("Certified sill connectors must remain outside wet footprints.");
      }
      for (const cell of body.wetCells) {
        if (
          cell >= represented.length ||
          represented[cell] ||
          value.lakeMask[cell] !== 1 ||
          value.bodyId[cell] !== body.nodeId
        )
          issues.add("Certified body footprint does not partition lakeMask.");
        represented[cell] = 1;
        if (value.waterSurface[cell] !== body.spillElevation)
          issues.add("Certified body surface differs from its sill.");
      }
    }
    for (let cell = 0; cell < represented.length; cell++) {
      if (
        represented[cell] !== value.lakeMask[cell] ||
        (value.lakeMask[cell] === 0 && value.bodyId[cell] !== 0)
      ) {
        issues.add("Certified body membership does not match lakeMask.");
        break;
      }
    }
    if (Math.abs(value.conservation.residual) > value.conservation.roundoffBound) {
      issues.add("Certified conservation residual exceeds its declared summation bound.");
    }
  },
});
