import { type TSchema, Type } from "typebox";

import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const input = Type.Object(
  {
    node: Type.Integer({
      description: "Runtime progression node selected for the ambient local player.",
    }),
  },
  { additionalProperties: false }
);

const checkResult = Type.Object(
  {
    node: Type.Integer({
      description: "Progression node evaluated by the native choice admission check.",
    }),
    status: Type.Union(
      [
        Type.Literal("available"),
        Type.Literal("already-selected"),
        Type.Literal("selected-target-pending"),
        Type.Literal("unavailable"),
      ],
      {
        description: "Choice availability for the requested progression node.",
      }
    ),
  },
  { additionalProperties: false }
);

const optionSchema = Type.Object(
  {
    node: Type.Integer({
      description: "Runtime progression node represented by the choice.",
    }),
    name: Type.Union([Type.String(), Type.Null()], {
      description: "Localized choice name, or null when unavailable.",
    }),
    treeType: Type.Union([Type.Integer(), Type.String(), Type.Null()], {
      description: "Runtime progression tree type, or null when unavailable.",
    }),
    treeName: Type.Union([Type.String(), Type.Null()], {
      description: "Localized progression tree name, or null when unavailable.",
    }),
    current: Type.Boolean({
      description: "Whether this node is the player's current progression choice.",
    }),
    cost: Type.Union([Type.Number(), Type.Null()], {
      description: "Progress cost of the choice, or null when unavailable.",
    }),
    turns: Type.Union([Type.Number(), Type.Null()], {
      description: "Estimated turns to complete the choice, or null when unavailable.",
    }),
  },
  {
    additionalProperties: false,
    description: "Useful local-player choice evidence projected from the live chooser.",
  }
);

const nonEmptyOptionsSchema = Type.Array(optionSchema, {
  minItems: 1,
  description: "Available progression choices; always nonempty after a successful read.",
});

const optionsResult = Type.Union([
  Type.Object(
    {
      status: Type.Literal("read", {
        description: "Confirms that the runtime choice list was read.",
      }),
      currentNode: Type.Union([Type.Integer(), Type.Null()], {
        description: "Currently selected progression node, or null when none is selected.",
      }),
      options: nonEmptyOptionsSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      status: Type.Literal("unavailable", {
        description: "Indicates that no readable progression choices are available.",
      }),
      currentNode: Type.Union([Type.Integer(), Type.Null()], {
        description: "Currently selected progression node, or null when unreadable.",
      }),
      options: Type.Array(optionSchema, {
        maxItems: 0,
        description: "Empty choice list returned when options are unavailable.",
      }),
    },
    { additionalProperties: false }
  ),
]);

const postconditionVariant = <Properties extends Readonly<Record<string, TSchema>>>(
  properties: Properties
) => {
  const propertiesSchema = Type.Object(properties);

  return Type.Object(
    {
      reason: Type.String({
        description: "Evidence-based explanation for the progression choice outcome.",
      }),
      ...propertiesSchema.properties,
    },
    { additionalProperties: false }
  );
};
const postconditionBy = {
  notSent: postconditionVariant({
    classification: Type.Literal("not-sent", {
      description: "Evidence classification for the progression choice outcome.",
    }),
    outcome: Type.Literal("not-sent", {
      description: "Semantic choice outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("unverified", {
      description: "Strength of the evidence supporting the choice outcome.",
    }),
    confirmed: Type.Literal(false, {
      description: "Whether runtime evidence confirms the choice outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(true, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
  confirmed: postconditionVariant({
    classification: Type.Literal("choice-selected-target-cleared", {
      description: "Evidence classification for the progression choice outcome.",
    }),
    outcome: Type.Literal("selected", {
      description: "Semantic choice outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("confirmed", {
      description: "Strength of the evidence supporting the choice outcome.",
    }),
    confirmed: Type.Literal(true, {
      description: "Whether runtime evidence confirms the choice outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(false, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
  unknown: postconditionVariant({
    classification: Type.Literal("missing-postcondition", {
      description: "Evidence classification for the progression choice outcome.",
    }),
    outcome: Type.Literal("unknown", {
      description: "Semantic choice outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("unverified", {
      description: "Strength of the evidence supporting the choice outcome.",
    }),
    confirmed: Type.Literal(false, {
      description: "Whether runtime evidence confirms the choice outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(true, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
  partial: postconditionVariant({
    classification: Type.Literal("choice-selected-target-clear-unverified", {
      description: "Evidence classification for the progression choice outcome.",
    }),
    outcome: Type.Literal("selected-partial", {
      description: "Semantic choice outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("unverified", {
      description: "Strength of the evidence supporting the choice outcome.",
    }),
    confirmed: Type.Literal(false, {
      description: "Whether runtime evidence confirms the choice outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(true, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
  technologyBlockerStillLive: postconditionVariant({
    classification: Type.Literal("technology-state-changed-blocker-still-live", {
      description: "Evidence classification for the progression choice outcome.",
    }),
    outcome: Type.Literal("still-blocked", {
      description: "Semantic choice outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("unverified", {
      description: "Strength of the evidence supporting the choice outcome.",
    }),
    confirmed: Type.Literal(false, {
      description: "Whether runtime evidence confirms the choice outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(true, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
  cultureBlockerStillLive: postconditionVariant({
    classification: Type.Literal("culture-state-changed-blocker-still-live", {
      description: "Evidence classification for the progression choice outcome.",
    }),
    outcome: Type.Literal("still-blocked", {
      description: "Semantic choice outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("unverified", {
      description: "Strength of the evidence supporting the choice outcome.",
    }),
    confirmed: Type.Literal(false, {
      description: "Whether runtime evidence confirms the choice outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(true, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
  unchanged: postconditionVariant({
    classification: Type.Literal("no-state-change", {
      description: "Evidence classification for the progression choice outcome.",
    }),
    outcome: Type.Literal("no-state-change", {
      description: "Semantic choice outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("unverified", {
      description: "Strength of the evidence supporting the choice outcome.",
    }),
    confirmed: Type.Literal(false, {
      description: "Whether runtime evidence confirms the choice outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(true, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
};

const resultVariant = <
  const Source extends string,
  const Status extends string,
  Postcondition extends TSchema,
  const Kind extends "refresh-attention" | "inspect-progression-choice" | "do-not-repeat",
>(
  source: Source,
  status: Status,
  postconditionSchema: Postcondition,
  kind: Kind
) =>
  Type.Object(
    {
      node: Type.Integer({
        description: "Progression node addressed by the choice operation.",
      }),
      status: Type.Literal(status, {
        description: "Dispatch and verification state of the choice operation.",
      }),
      postcondition: postconditionSchema,
      nextSteps: Type.Array(
        Type.Object(
          {
            kind: Type.Literal(kind, {
              description: "Recommended follow-up category for the choice operation.",
            }),
            source: Type.Literal(source, {
              description: "Choice procedure that produced the recommendation.",
            }),
            label: Type.String({
              description: "Human-readable choice follow-up recommendation.",
            }),
          },
          { additionalProperties: false }
        ),
        {
          minItems: 1,
          maxItems: 1,
          description: "Required follow-up after the choice operation.",
        }
      ),
    },
    { additionalProperties: false }
  );

const result = <const Source extends string, BlockerStillLive extends TSchema>(
  source: Source,
  blockerStillLive: BlockerStillLive
) =>
  Type.Union([
    resultVariant(source, "not-sent", postconditionBy.notSent, "inspect-progression-choice"),
    resultVariant(source, "already-selected", postconditionBy.confirmed, "refresh-attention"),
    resultVariant(
      source,
      "already-selected-unverified",
      Type.Union([postconditionBy.partial, blockerStillLive, postconditionBy.unchanged]),
      "do-not-repeat"
    ),
    resultVariant(source, "dispatch-unknown", postconditionBy.unknown, "do-not-repeat"),
    resultVariant(source, "sent-confirmed", postconditionBy.confirmed, "refresh-attention"),
    resultVariant(
      source,
      "sent-unverified",
      Type.Union([postconditionBy.partial, blockerStillLive, postconditionBy.unchanged]),
      "do-not-repeat"
    ),
  ]);

const leaf = <
  const Kind extends "technology" | "culture",
  const Source extends
    | "progression.technology.choice.request"
    | "progression.culture.choice.request",
  BlockerStillLive extends TSchema,
>(
  kind: Kind,
  source: Source,
  blockerStillLive: BlockerStillLive
) => ({
  options: base
    .input(standard(Type.Object({}, { additionalProperties: false })))
    .output(standard(optionsResult))
    .meta({
      family: "progression",
      procedureKey: `progression.${kind}.choice.options`,
      proofBoundary: "local-package-test",
      risk: "read-only",
    }),
  check: base
    .input(standard(input))
    .output(standard(checkResult))
    .meta({
      family: "progression",
      procedureKey: `progression.${kind}.choice.check`,
      proofBoundary: "local-package-test",
      risk: "read-only",
    }),
  request: base
    .input(standard(input))
    .output(standard(result(source, blockerStillLive)))
    .meta({
      family: "progression",
      procedureKey: source,
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
});

export const choice = {
  technology: leaf(
    "technology",
    "progression.technology.choice.request",
    postconditionBy.technologyBlockerStillLive
  ),
  culture: leaf(
    "culture",
    "progression.culture.choice.request",
    postconditionBy.cultureBlockerStillLive
  ),
};
