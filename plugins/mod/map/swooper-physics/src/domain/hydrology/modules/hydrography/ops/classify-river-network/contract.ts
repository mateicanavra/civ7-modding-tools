import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import hydrographicClassificationDefinition from "./strategies/hydrographic-classification/config.js";

/** Classifies an admitted drainage network into causal hierarchy, mouth, slope, and permanence fields. */
const ClassifyRiverNetworkContract = defineOp({
  kind: "compute",
  id: "hydrology/classify-river-network",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Tile grid width (columns)." }),
      height: Type.Integer({ minimum: 1, description: "Tile grid height (rows)." }),
      landMask: TypedArraySchemas.u8({
        description: "Hydrology land mask per tile (1=land, 0=water).",
      }),
      elevation: TypedArraySchemas.i16({
        description: "Morphology-owned terrain elevation per tile.",
      }),
      routingElevation: TypedArraySchemas.f32({
        description:
          "Hydrologically conditioned routing surface used for spill-aware slope classification.",
      }),
      depressionDepth: TypedArraySchemas.f32({
        description: "Depression fill depth per tile from Hydrology drainage conditioning.",
      }),
      discharge: TypedArraySchemas.f32({
        description: "Accumulated discharge proxy per tile.",
      }),
      riverClass: TypedArraySchemas.u8({
        description: "Hydrology river class per tile (0=none, 1=minor, >=2=major).",
      }),
      flowDir: TypedArraySchemas.i32({
        description:
          "Hydrology-conditioned receiver index per tile (land receiver, water receiver, or -1 for typed terminal).",
      }),
      terminalType: TypedArraySchemas.u8({
        description: "Terminal classification per land tile: 0=none, 1=ocean, 2=closed basin.",
      }),
      lakeMask: TypedArraySchemas.u8({
        description: "Hydrology accepted lake mask per tile (1=accepted lake, 0=not lake).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Admitted terrain, flow, river, and lake evidence used to classify the Hydrology river network.",
    }
  ),
  output: Type.Object(
    {
      upstreamArea: TypedArraySchemas.i32({
        description: "Contributing land-tile count draining through each land tile.",
      }),
      streamOrderProxy: TypedArraySchemas.u8({
        description:
          "Strahler-like hierarchy proxy over Hydrology minor/major river truth (0 on non-river tiles).",
      }),
      mouthType: TypedArraySchemas.u8({
        description:
          "Drainage mouth classification per land tile: 0=unresolved, 1=ocean, 2=accepted lake, 3=closed basin, 4=spill-path routed.",
      }),
      slopeClass: TypedArraySchemas.u8({
        description:
          "Slope class per land tile: 0=none/water, 1=flat, 2=low, 3=moderate, 4=steep, 5=mountain-blocked closed basin.",
      }),
      flowPermanenceProxy: TypedArraySchemas.u8({
        description:
          "Flow permanence proxy per land tile: 0=dry/no-signal, 1=ephemeral, 2=intermittent, 3=perennial.",
      }),
    },
    {
      additionalProperties: false,
      description: "Hydrology-owned river-network causal classifications.",
    }
  ),
  strategies: [hydrographicClassificationDefinition],
});

export default ClassifyRiverNetworkContract;
