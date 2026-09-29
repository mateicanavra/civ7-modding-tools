import type { ArtifactReadValueOf } from "@swooper/mapgen-core/authoring";
import { artifacts } from "../../../../../../../domain/hydrology/modules/hydrography/artifacts/index.js";
import { defineStandardVizMeta } from "../../../../../viz.js";

type Observation = {
  hydrography: ArtifactReadValueOf<typeof artifacts.hydrography>;
  lakePlan: ArtifactReadValueOf<typeof artifacts.lakePlan>;
  riverNetwork: ArtifactReadValueOf<typeof artifacts.riverNetwork>;
};

/** Number-to-Float32 conversion is visualization-only and cannot feed physical budgets. */
export function projectNetworkViz(
  observation: Observation,
  dimensions: { width: number; height: number }
) {
  const group = "Hydrology / Hydrography";
  const common = { kind: "grid" as const, spaceId: "tile.hexOddQ" as const, dims: dimensions };
  const certified =
    observation.lakePlan.model === "certified-sill-spill" ? observation.lakePlan : null;
  const basinState = new Uint8Array(certified ? dimensions.width * dimensions.height : 0);
  const unresolvedResidual = new Float32Array(basinState.length);
  const junctionMask = new Uint8Array(basinState.length);
  if (certified) {
    const stateCode = { open: 1, closed: 2, subtile: 3, dry: 4 } as const;
    for (const component of certified.components) {
      for (const cell of component.memberCells) basinState[cell] = stateCode[component.state];
      for (const cell of component.junctionCells) junctionMask[cell] = 1;
      // One anchor observation per component keeps this diagnostic additive, unlike shared member area.
      unresolvedResidual[component.anchorCell] = component.unresolvedResidual;
    }
  }
  return [
    ...(certified
      ? [
          {
            ...common,
            dataTypeKey: "hydrology.hydrography.componentId",
            field: { format: "i32" as const, values: certified.componentId },
            meta: defineStandardVizMeta("hydrology.hydrography.componentId", "category.distinct", {
              label: "Hydraulic Component Id",
              group,
              visibility: "debug",
            }),
          },
          {
            ...common,
            dataTypeKey: "hydrology.hydrography.basinState",
            field: { format: "u8" as const, values: basinState },
            meta: defineStandardVizMeta("hydrology.hydrography.basinState", "category.distinct", {
              label: "Basin State (1 Open, 2 Closed, 3 Subtile, 4 Dry)",
              group,
              visibility: "debug",
            }),
          },
          {
            ...common,
            dataTypeKey: "hydrology.hydrography.unresolvedResidual",
            field: { format: "f32" as const, values: unresolvedResidual },
            meta: defineStandardVizMeta(
              "hydrology.hydrography.unresolvedResidual",
              "field.intensity",
              { label: "Unresolved Supply (Component Anchor)", group, visibility: "debug" }
            ),
          },
          {
            ...common,
            dataTypeKey: "hydrology.hydrography.junctionMask",
            field: { format: "u8" as const, values: junctionMask },
            meta: defineStandardVizMeta("hydrology.hydrography.junctionMask", "category.distinct", {
              label: "Dry Hydraulic Junction",
              group,
              visibility: "debug",
            }),
          },
          {
            ...common,
            dataTypeKey: "hydrology.hydrography.waterSurface",
            field: { format: "f32" as const, values: Float32Array.from(certified.waterSurface) },
            meta: defineStandardVizMeta("hydrology.hydrography.waterSurface", "terrain.elevation", {
              label: "Physical Water Surface (Display Precision)",
              group,
              visibility: "debug",
            }),
          },
        ]
      : []),
    {
      ...common,
      dataTypeKey: "hydrology.hydrography.runoff",
      field: { format: "f32" as const, values: Float32Array.from(observation.hydrography.runoff) },
      meta: defineStandardVizMeta("hydrology.hydrography.runoff", "field.intensity", {
        label: "Runoff",
        group,
        visibility: "debug",
      }),
    },
    {
      ...common,
      dataTypeKey: "hydrology.hydrography.discharge",
      field: {
        format: "f32" as const,
        values: Float32Array.from(observation.hydrography.discharge),
      },
      meta: defineStandardVizMeta("hydrology.hydrography.discharge", "field.intensity", {
        label: "Discharge",
        group,
      }),
    },
    {
      ...common,
      dataTypeKey: "hydrology.hydrography.riverClass",
      field: { format: "u8" as const, values: observation.hydrography.riverClass },
      meta: defineStandardVizMeta("hydrology.hydrography.riverClass", "category.distinct", {
        label: "River Class",
        group,
      }),
    },
    {
      ...common,
      dataTypeKey: "hydrology.lakes.lakePlan",
      field: { format: "u8" as const, values: observation.lakePlan.lakeMask },
      meta: defineStandardVizMeta("hydrology.lakes.lakePlan", "category.distinct", {
        label: "Lake Plan",
        group,
      }),
    },
    {
      ...common,
      dataTypeKey: "hydrology.hydrography.upstreamArea",
      field: { format: "i32" as const, values: observation.riverNetwork.upstreamArea },
      meta: defineStandardVizMeta("hydrology.hydrography.upstreamArea", "field.intensity", {
        label: "Upstream Area",
        group,
        visibility: "debug",
      }),
    },
    {
      ...common,
      dataTypeKey: "hydrology.hydrography.basinId",
      field: { format: "i32" as const, values: observation.hydrography.basinId },
      meta: defineStandardVizMeta("hydrology.hydrography.basinId", "category.distinct", {
        label: "Drainage Basin Id",
        group,
        visibility: "debug",
      }),
    },
    {
      ...common,
      dataTypeKey: "hydrology.hydrography.terminalType",
      field: { format: "u8" as const, values: observation.hydrography.terminalType },
      meta: defineStandardVizMeta("hydrology.hydrography.terminalType", "category.distinct", {
        label: "Drainage Terminal Type",
        group,
        visibility: "debug",
      }),
    },
    {
      ...common,
      dataTypeKey: "hydrology.hydrography.streamOrderProxy",
      field: { format: "u8" as const, values: observation.riverNetwork.streamOrderProxy },
      meta: defineStandardVizMeta("hydrology.hydrography.streamOrderProxy", "category.distinct", {
        label: "Stream Order Proxy",
        group,
        visibility: "debug",
      }),
    },
    {
      ...common,
      dataTypeKey: "hydrology.hydrography.mouthType",
      field: { format: "u8" as const, values: observation.riverNetwork.mouthType },
      meta: defineStandardVizMeta("hydrology.hydrography.mouthType", "category.distinct", {
        label: "River Mouth Type",
        group,
        visibility: "debug",
      }),
    },
    {
      ...common,
      dataTypeKey: "hydrology.hydrography.slopeClass",
      field: { format: "u8" as const, values: observation.riverNetwork.slopeClass },
      meta: defineStandardVizMeta("hydrology.hydrography.slopeClass", "category.distinct", {
        label: "River Slope Class",
        group,
        visibility: "debug",
      }),
    },
    {
      ...common,
      dataTypeKey: "hydrology.hydrography.flowPermanenceProxy",
      field: { format: "u8" as const, values: observation.riverNetwork.flowPermanenceProxy },
      meta: defineStandardVizMeta(
        "hydrology.hydrography.flowPermanenceProxy",
        "category.distinct",
        { label: "River Flow Permanence", group, visibility: "debug" }
      ),
    },
    ...(observation.hydrography.model === "legacy-sink-budget"
      ? [
          {
            ...common,
            dataTypeKey: "hydrology.hydrography.sinkMask",
            field: { format: "u8" as const, values: observation.hydrography.sinkMask },
            meta: defineStandardVizMeta("hydrology.hydrography.sinkMask", "category.distinct", {
              label: "Sink Mask",
              group,
              visibility: "debug",
            }),
          },
          {
            ...common,
            dataTypeKey: "hydrology.hydrography.outletMask",
            field: { format: "u8" as const, values: observation.hydrography.outletMask },
            meta: defineStandardVizMeta("hydrology.hydrography.outletMask", "category.distinct", {
              label: "Outlet Mask",
              group,
              visibility: "debug",
            }),
          },
          {
            ...common,
            dataTypeKey: "hydrology.hydrography.depressionDepth",
            field: { format: "f32" as const, values: observation.hydrography.depressionDepth },
            meta: defineStandardVizMeta(
              "hydrology.hydrography.depressionDepth",
              "field.intensity",
              { label: "Drainage Conditioning Depth", group, visibility: "debug" }
            ),
          },
        ]
      : []),
  ];
}
