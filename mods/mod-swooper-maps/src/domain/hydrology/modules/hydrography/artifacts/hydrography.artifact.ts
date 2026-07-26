import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Registers canonical Hydrology routing, runoff, discharge, river class, and
 * drainage-depression model before engine projection. Consumers must use this artifact rather
 * than treating observed Civ7 rivers as the Hydrology model.
 */
export const artifact = defineArtifact({
  name: "hydrography",
  id: "artifact:hydrology.hydrography",
  schema: Type.Object(
    {
      runoff: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description: "Local runoff supplied by precipitation and humidity at each tile.",
      }),
      discharge: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description: "Runoff accumulated through the Hydrology drainage graph at each tile.",
      }),
      riverClass: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "River class: 0=none, 1=minor, and 2 or greater=major/projectable.",
      }),
      flowDir: TypedArraySchemas.i32({
        cardinality: "map-grid",
        description: "Conditioned receiver tile index, or -1 for a typed terminal basin.",
      }),
      sinkMask: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Raw drainage minimum eligible for lake or depression planning (1=yes).",
      }),
      outletMask: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Land tile that drains directly to ocean, water, or the map edge (1=yes).",
      }),
      basinId: TypedArraySchemas.i32({
        cardinality: "map-grid",
        description: "Drainage-basin identifier per tile, or -1 when unassigned.",
      }),
      routingElevation: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description:
          "Hydrologically conditioned routing surface that leaves Morphology elevation unchanged.",
      }),
      depressionDepth: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description: "Depth added while conditioning a depression to its spill surface.",
      }),
      terminalType: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Drainage terminal: 0=none, 1=ocean/water outlet, 2=closed basin.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Hydrology routing, runoff, discharge, river, and drainage-depression state before Civ7 projection.",
    }
  ),
  refine: (value, { issues }) => {
    const invalidSinkIndex = findFirstValueAbove(value.sinkMask, 1);
    if (invalidSinkIndex >= 0) {
      issues.add(
        `Expected hydrography.sinkMask values in 0..1 (first invalid index ${invalidSinkIndex}).`
      );
    }
    const invalidOutletIndex = findFirstValueAbove(value.outletMask, 1);
    if (invalidOutletIndex >= 0) {
      issues.add(
        `Expected hydrography.outletMask values in 0..1 (first invalid index ${invalidOutletIndex}).`
      );
    }
    const invalidTerminalIndex = findFirstValueAbove(value.terminalType, 2);
    if (invalidTerminalIndex >= 0) {
      issues.add(
        `Expected hydrography.terminalType values in 0..2 (first invalid index ${invalidTerminalIndex}).`
      );
    }
  },
});

function findFirstValueAbove(
  value: { readonly [index: number]: number; readonly length: number },
  maximum: number
): number {
  for (let index = 0; index < value.length; index += 1) {
    if (value[index]! > maximum) {
      return index;
    }
  }
  return -1;
}
