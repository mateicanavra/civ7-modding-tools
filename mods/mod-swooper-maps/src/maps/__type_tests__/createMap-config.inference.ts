/// <reference types="@civ7/types" />

import foundationDomain from "@mapgen/domain/foundation";
import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { Static } from "@swooper/mapgen-core/authoring";
import type { ExtendsStrict, IsEqual, IsStringLiteral } from "type-fest";
import standardRecipe, { type StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import foundationMantleStage from "../../recipes/standard/stages/foundation-mantle/index.js";

// This file exists purely to lock in authoring DX: the inline config should be
// structurally typed (stage keys + step keys + op config shapes), so TS provides
// completion + hover hints.

type Expect<T extends true> = T;

// Ensure stage ids and step ids remain literals (not widened to string/unknown).
type _FoundationMantleStageId = typeof foundationMantleStage.id;
export type _FoundationMantleStageIdIsLiteral = Expect<
  IsEqual<_FoundationMantleStageId, "foundation-mantle">
>;

type _FoundationMantleStepIds = (typeof foundationMantleStage.steps)[number]["contract"]["id"];
// @ts-expect-error - a random string should not be assignable to the step id union.
const _badFoundationStepId: _FoundationMantleStepIds = "definitely-not-a-step";
void _badFoundationStepId;

// If the config surface degenerates to Record<string, ...> / an index signature,
// these should STOP erroring.
// @ts-expect-error - unknown stage id should not be indexable.
type _NoBogusStage = StandardRecipeConfig["bogus-stage"];

type _FoundationMantleConfig = NonNullable<StandardRecipeConfig["foundation-mantle"]>;
// @ts-expect-error - unknown step id should not be indexable.
type _NoBogusStep = _FoundationMantleConfig["bogus-step"];

// Sanity check: op contract envelope types must be structurally typed (not `unknown`).
type _ComputeMeshOp = typeof foundationDomain.ops.computeMesh;
type _ComputeMeshStrategyIds = keyof _ComputeMeshOp["strategies"] & string;
export type _ComputeMeshStrategyIdsAreNarrow = Expect<IsStringLiteral<_ComputeMeshStrategyIds>>;

type _ComputeMeshEnvelopeFromOp = Static<_ComputeMeshOp["config"]>;
type _ComputeMeshConfigFromOp = _ComputeMeshEnvelopeFromOp["config"];
export type _ComputeMeshConfigFromOpIsObject = Expect<
  ExtendsStrict<_ComputeMeshConfigFromOp, object, { strictAny: true }>
>;

// Ensure stage step schemas still carry op-enriched typing.
type _MeshStep = Extract<
  (typeof foundationMantleStage.steps)[number],
  { contract: { id: "mesh" } }
>;
type _MeshStepRuntimeConfig = Static<_MeshStep["contract"]["schema"]>;
type _ComputeMeshEnvelopeFromStepSchema = _MeshStepRuntimeConfig["computeMesh"];
type _ComputeMeshEnvelopeFromStepSchemaConfig = _ComputeMeshEnvelopeFromStepSchema extends {
  config: infer C;
}
  ? C
  : never;
export type _ComputeMeshEnvelopeFromStepSchemaConfigIsObject = Expect<
  ExtendsStrict<_ComputeMeshEnvelopeFromStepSchemaConfig, object, { strictAny: true }>
>;

// plateCount is authored on the mantle stage (mesh density).
type _FoundationMantleKnobs = NonNullable<_FoundationMantleConfig["knobs"]>;
type _PlateCountKnob = _FoundationMantleKnobs["plateCount"];
export type _PlateCountKnobIsNumber = Expect<IsEqual<Exclude<_PlateCountKnob, undefined>, number>>;

// plateActivity is authored on the tectonics stage (scales the plate motion truth).
type _FoundationTectonicsConfig = NonNullable<StandardRecipeConfig["foundation-tectonics"]>;
type _FoundationTectonicsKnobs = NonNullable<_FoundationTectonicsConfig["knobs"]>;
type _PlateActivityKnob = _FoundationTectonicsKnobs["plateActivity"];
export type _PlateActivityKnobIsNumber = Expect<
  IsEqual<Exclude<_PlateActivityKnob, undefined>, number>
>;

createMap({
  id: "__type_test__",
  name: "__type_test__",
  recipe: standardRecipe,
  config: {
    "foundation-mantle": { knobs: { plateCount: 28 } },
    "foundation-lithosphere": { knobs: { plateCount: 28 } },
    "foundation-tectonics": { knobs: { plateActivity: 0.5 } },
  },
});

export {};
