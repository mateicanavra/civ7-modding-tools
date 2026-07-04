import { defineArtifact, type Static, Type } from "@swooper/mapgen-core/authoring/contracts";
import { validateArtifactSchema } from "@swooper/mapgen-core/authoring/contracts";
import type { OfficialResourceCorpusArtifact } from "../lib/corpus/types.js";

/**
 * Artifact contract for the official resource corpus
 * (`artifact:resources.corpus`). One artifact per file by repo convention.
 */
const SourceRefSchema = Type.Object(
  {
    file: Type.String(),
    table: Type.String(),
  },
  { additionalProperties: false }
);

const RuntimeIdSchema = Type.Object(
  {
    status: Type.Literal("unverified"),
    value: Type.Null(),
    evidence: Type.Array(Type.Never(), { maxItems: 0 }),
    rationale: Type.String(),
  },
  { additionalProperties: false }
);

const ResourceClassOverrideSchema = Type.Object(
  {
    age: Type.String({ pattern: "^AGE_" }),
    resourceClass: Type.String({ pattern: "^RESOURCECLASS_" }),
    sourceFile: Type.String(),
  },
  { additionalProperties: false }
);

const ResourceDistributionFactsSchema = Type.Object(
  {
    adjacentToLand: Type.Optional(Type.Boolean()),
    lakeEligible: Type.Optional(Type.Boolean()),
    staple: Type.Optional(Type.Boolean()),
    minimumPerHemisphere: Type.Optional(Type.Integer({ minimum: 0 })),
    hemisphereUnique: Type.Optional(Type.Boolean()),
    bonusResourceSlots: Type.Optional(Type.Integer({ minimum: 0 })),
    unlocksCiv: Type.Optional(Type.Boolean()),
    tradeable: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false }
);

export const PlacementConstraintsSchema = Type.Object(
  {
    hasOfficialBiomeConstraints: Type.Boolean(),
    validBiomeConstraintCount: Type.Integer({ minimum: 0 }),
    sourceTables: Type.Array(SourceRefSchema),
    placementFlags: ResourceDistributionFactsSchema,
  },
  { additionalProperties: false }
);

const YieldChangeSchema = Type.Object(
  {
    YieldType: Type.String({ pattern: "^YIELD_" }),
    YieldChange: Type.String(),
  },
  { additionalProperties: false }
);

const ResourceDispositionSchema = <TStatus extends string>(statuses: readonly TStatus[]) =>
  Type.Object(
    {
      status: Type.Union(statuses.map((status) => Type.Literal(status))),
      rationale: Type.String(),
    },
    { additionalProperties: false }
  );

const ResourceCorpusEntrySchema = Type.Object(
  {
    resourceType: Type.String({ pattern: "^RESOURCE_" }),
    staticResourceRowSlot: Type.Integer({ minimum: 0 }),
    staticSource: SourceRefSchema,
    name: Type.String(),
    tooltip: Type.String(),
    baseClass: Type.String({ pattern: "^RESOURCECLASS_" }),
    weight: Type.Integer({ minimum: 0 }),
    runtimeId: RuntimeIdSchema,
    validAges: Type.Array(Type.String({ pattern: "^AGE_" })),
    ageClassOverrides: Type.Array(ResourceClassOverrideSchema),
    officialPlacementConstraints: PlacementConstraintsSchema,
    yieldChanges: Type.Array(YieldChangeSchema),
    typeTags: Type.Array(Type.String()),
    placeability: ResourceDispositionSchema([
      "placeable",
      "conditional",
      "not-map-placed",
      "unknown",
    ]),
    strategyRequired: ResourceDispositionSchema(["required", "not-required", "blocked"]),
  },
  { additionalProperties: false }
);

export const Schema = Type.Unsafe<OfficialResourceCorpusArtifact>(
  Type.Object(
    {
      source: Type.Object(
        {
          authority: Type.Literal("civ7-official-resources"),
          module: Type.Literal("base-standard"),
          order: Type.Literal("base-standard.modinfo Resources row order"),
          runtimeIdStatus: Type.Literal("unverified"),
          sourceFiles: Type.Array(Type.String()),
        },
        { additionalProperties: false }
      ),
      resources: Type.Array(ResourceCorpusEntrySchema),
    },
    {
      additionalProperties: false,
      description:
        "Official base-standard resource corpus. Static resource row slots are source evidence only; runtime numeric ids remain unverified until in-game GameInfo.Resources proof is attached.",
    }
  )
);

export type Artifact = Static<typeof Schema>;

export const artifact = defineArtifact({
  name: "resourceCorpus",
  id: "artifact:resources.corpus",
  schema: Schema,
});

export function validate(value: unknown): readonly { message: string }[] {
  return validateArtifactSchema(Schema, value);
}
