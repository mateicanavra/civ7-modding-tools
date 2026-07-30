import { Type } from "typebox";
import { Civ7ControlOrpcMapLocationSchema } from "#civ7-control-service/model/dto/primitives";
import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const NullableNumberSchema = Type.Union([Type.Number(), Type.Null()]);
const Civ7WorldPlotFieldSchema = Type.Union([
  Type.Literal("terrain"),
  Type.Literal("biome"),
  Type.Literal("feature"),
  Type.Literal("resource"),
  Type.Literal("climate"),
  Type.Literal("hydrology"),
  Type.Literal("yields"),
  Type.Literal("owner"),
  Type.Literal("visibility"),
  Type.Literal("areaRegion"),
  Type.Literal("tags"),
  Type.Literal("city"),
  Type.Literal("units"),
]);
const Civ7WorldHiddenInfoPolicySchema = Type.Union([
  Type.Literal("include-hidden"),
  Type.Literal("visibility-filtered"),
  Type.Literal("not-player-scoped"),
]);
const Civ7WorldProbeSchema = Type.Union([
  Type.Object(
    {
      ok: Type.Literal(true, {
        description: "Ok.",
      }),
      value: Type.Unknown({
        description: "Value.",
      }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ok: Type.Literal(false, {
        description: "Ok.",
      }),
      error: Type.String({
        description: "Error.",
      }),
    },
    { additionalProperties: false }
  ),
]);
const Civ7WorldPlotReadInputSchema = Type.Object(
  {
    location: Civ7ControlOrpcMapLocationSchema,
    playerId: Type.Optional(Type.Integer({ minimum: 0, description: "Player id." })),
    fields: Type.Optional(
      Type.Array(Civ7WorldPlotFieldSchema, {
        description: "Fields.",
      })
    ),
    includeHidden: Type.Optional(
      Type.Boolean({
        description: "Include hidden.",
      })
    ),
  },
  { additionalProperties: false }
);
const Civ7WorldPlotSnapshotSchema = Type.Object(
  {
    location: Type.Object(
      {
        x: Type.Integer({ minimum: 0, maximum: 1000000, description: "X." }),
        y: Type.Integer({ minimum: 0, maximum: 1000000, description: "Y." }),
        index: NullableNumberSchema,
      },
      { additionalProperties: false, description: "Location." }
    ),
    visibility: Type.Object(
      {
        revealedState: Type.Optional(Civ7WorldProbeSchema),
        visible: Type.Optional(Civ7WorldProbeSchema),
      },
      { additionalProperties: false, description: "Visibility." }
    ),
    hiddenInfoPolicy: Civ7WorldHiddenInfoPolicySchema,
    facts: Type.Record(Type.String(), Civ7WorldProbeSchema, {
      description: "Facts.",
    }),
    summary: Type.Object(
      {
        factCount: Type.Integer({ minimum: 0, description: "Fact count." }),
        probeErrorCount: Type.Integer({ minimum: 0, description: "Probe error count." }),
      },
      { additionalProperties: false, description: "Summary." }
    ),
  },
  { additionalProperties: false }
);
const Civ7WorldPlotReadResultSchema = Type.Object(
  {
    sourceStatus: Type.Object(
      {
        plot: Type.Union(
          [
            Type.Literal("read"),
            Type.Literal("read-with-probe-errors"),
            Type.Literal("invalid-location"),
          ],
          {
            description: "Plot.",
          }
        ),
      },
      { additionalProperties: false, description: "Source status." }
    ),
    plot: Civ7WorldPlotSnapshotSchema,
  },
  { additionalProperties: false }
);
const Civ7WorldMapBoundsSchema = Type.Object(
  {
    x: Type.Integer({ minimum: 0, maximum: 1000000, description: "X." }),
    y: Type.Integer({ minimum: 0, maximum: 1000000, description: "Y." }),
    width: Type.Integer({ minimum: 1, maximum: 10000, description: "Width." }),
    height: Type.Integer({ minimum: 1, maximum: 10000, description: "Height." }),
  },
  { additionalProperties: false }
);
const Civ7WorldGridReadInputSchema = Type.Object(
  {
    bounds: Civ7WorldMapBoundsSchema,
    fields: Type.Array(Civ7WorldPlotFieldSchema, {
      description: "Fields values.",
    }),
    playerId: Type.Optional(Type.Integer({ minimum: 0, description: "Player id." })),
    includeHidden: Type.Optional(
      Type.Boolean({
        description: "Include hidden.",
      })
    ),
    maxPlots: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 10000, description: "Max plots." })
    ),
  },
  { additionalProperties: false }
);
const Civ7WorldGridReadResultSchema = Type.Object(
  {
    sourceStatus: Type.Object(
      {
        grid: Type.Union(
          [
            Type.Literal("read"),
            Type.Literal("read-with-omissions"),
            Type.Literal("read-with-probe-errors"),
          ],
          {
            description: "Grid.",
          }
        ),
        map: Type.Union([Type.Literal("read"), Type.Literal("skipped-unavailable")], {
          description: "Map.",
        }),
      },
      { additionalProperties: false, description: "Source status." }
    ),
    bounds: Civ7WorldMapBoundsSchema,
    fields: Type.Array(Civ7WorldPlotFieldSchema, {
      description: "Fields values.",
    }),
    plotCount: Type.Integer({ minimum: 0, description: "Plot count." }),
    omitted: Type.Integer({ minimum: 0, description: "Omitted." }),
    hiddenInfoPolicy: Civ7WorldHiddenInfoPolicySchema,
    map: Type.Object(
      {
        width: NullableNumberSchema,
        height: NullableNumberSchema,
      },
      { additionalProperties: false, description: "Map." }
    ),
    plots: Type.Array(Civ7WorldPlotSnapshotSchema, {
      description: "Plots values.",
    }),
    summary: Type.Object(
      {
        returnedPlotCount: Type.Integer({ minimum: 0, description: "Returned plot count." }),
        probeErrorCount: Type.Integer({ minimum: 0, description: "Probe error count." }),
      },
      { additionalProperties: false, description: "Summary." }
    ),
  },
  { additionalProperties: false }
);
const Civ7WorldPlotReadContract = base
  .input(standard(Civ7WorldPlotReadInputSchema))
  .output(standard(Civ7WorldPlotReadResultSchema))
  .meta({
    family: "world",
    procedureKey: "world.plot.read",
    proofBoundary: "local-package-test",
    risk: "read-only",
  });
const Civ7WorldGridReadContract = base
  .input(standard(Civ7WorldGridReadInputSchema))
  .output(standard(Civ7WorldGridReadResultSchema))
  .meta({
    family: "world",
    procedureKey: "world.grid.read",
    proofBoundary: "local-package-test",
    risk: "read-only",
  });
export const mapReads = {
  plot: Civ7WorldPlotReadContract,
  grid: Civ7WorldGridReadContract,
};
