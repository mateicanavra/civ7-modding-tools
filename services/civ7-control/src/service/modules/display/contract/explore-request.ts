import { Type } from "typebox";

import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const NullableNumberSchema = Type.Union([Type.Number(), Type.Null()]);

const Civ7DisplayClosedRowSchema = Type.Object(
  {
    category: Type.String({
      description: "Display category that was suppressed during exploration.",
    }),
    closed: Type.Integer({
      minimum: 1,
      description: "Number of displays suppressed in the category.",
    }),
  },
  { additionalProperties: false }
);

const Civ7DisplayExploreRequestInputSchema = Type.Object(
  {
    playerId: Type.Integer({
      minimum: 0,
      maximum: 1024,
      description: "Player whose map visibility should be explored.",
    }),
    settleMs: Type.Optional(
      Type.Integer({
        minimum: 0,
        maximum: 600_000,
        description: "Minimum time to hold the visibility grant before release.",
      })
    ),
    pollMs: Type.Optional(
      Type.Integer({
        minimum: 250,
        maximum: 60_000,
        description: "Interval between display-queue drain polls.",
      })
    ),
    quiescePolls: Type.Optional(
      Type.Integer({
        minimum: 1,
        maximum: 20,
        description: "Consecutive empty drain polls required to declare quiescence.",
      })
    ),
    maxExtraWaitMs: Type.Optional(
      Type.Integer({
        minimum: 0,
        maximum: 600_000,
        description: "Maximum drain time allowed beyond the minimum settle period.",
      })
    ),
    restoreFog: Type.Optional(
      Type.Boolean({
        description: "Whether to release the visibility grant after exploration so fog returns.",
      })
    ),
  },
  { additionalProperties: false }
);

const Civ7DisplayExploreVisibilityProbeSchema = Type.Object(
  {
    revealed: NullableNumberSchema,
    visible: NullableNumberSchema,
  },
  { additionalProperties: false }
);

const Civ7DisplayExploreSkippedResultSchema = Type.Object(
  {
    playerId: Type.Integer({
      minimum: 0,
      maximum: 1024,
      description: "Player whose map visibility was inspected.",
    }),
    skipped: Type.Literal(true, {
      description: "Indicates that no new visibility grant was applied.",
    }),
    before: Civ7DisplayExploreVisibilityProbeSchema,
    after: Civ7DisplayExploreVisibilityProbeSchema,
    mapPlotCount: Type.Number({
      description: "Total plot count reported for the map.",
    }),
    classification: Type.Literal("already-explored", {
      description: "Reason the explore mutation was skipped.",
    }),
  },
  { additionalProperties: false }
);

const Civ7DisplayExploreFullResultSchema = Type.Object(
  {
    playerId: Type.Integer({
      minimum: 0,
      maximum: 1024,
      description: "Player whose map visibility was explored.",
    }),
    skipped: Type.Literal(false, {
      description: "Indicates that the explore state machine ran.",
    }),
    before: Civ7DisplayExploreVisibilityProbeSchema,
    after: Civ7DisplayExploreVisibilityProbeSchema,
    grantId: Type.Number({
      description: "Runtime identifier of the tracked visibility grant.",
    }),
    grantedPlots: Type.Integer({
      minimum: 0,
      description: "Number of plots included in the visibility grant.",
    }),
    grantReleased: Type.Boolean({
      description: "Whether the tracked visibility grant was released after exploration.",
    }),
    settleMs: Type.Integer({
      minimum: 0,
      maximum: 600_000,
      description: "Minimum visibility-grant settle period used by the state machine.",
    }),
    drainPolls: Type.Integer({
      minimum: 0,
      description: "Number of display-queue drain polls performed.",
    }),
    quiesced: Type.Boolean({
      description: "Whether the display queue reached the configured quiescence threshold.",
    }),
    suspendVerified: Type.Boolean({
      description: "Whether display-queue suspension was verified before mutation.",
    }),
    resumeVerified: Type.Boolean({
      description: "Whether display-queue resumption was verified after mutation.",
    }),
    suppressedDisplays: Type.Array(Civ7DisplayClosedRowSchema, {
      description: "Displays suppressed while the visibility grant settled.",
    }),
    mutation: Type.Literal("Visibility.setTrackedVisibilityGrant", {
      description: "Runtime mutation used to grant full-map visibility.",
    }),
    discoveryPosture: Type.Literal("ui-suppressed-gameplay-discovers", {
      description: "Exploration posture used while gameplay reveals the map.",
    }),
    classification: Type.Union(
      [Type.Literal("explored"), Type.Literal("already-explored"), Type.Literal("unverified")],
      {
        description: "Outcome derived from before-and-after visibility evidence.",
      }
    ),
  },
  { additionalProperties: false }
);

const Civ7DisplayExploreRequestResultSchema = Type.Union([
  Civ7DisplayExploreSkippedResultSchema,
  Civ7DisplayExploreFullResultSchema,
]);

export const exploreRequest = base
  .input(standard(Civ7DisplayExploreRequestInputSchema))
  .output(standard(Civ7DisplayExploreRequestResultSchema))
  .meta({
    family: "display",
    procedureKey: "display.explore.request",
    proofBoundary: "local-package-test",
    risk: "mutation",
  });
