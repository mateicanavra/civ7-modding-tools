/// <reference types="@civ7/types" />

import { createMap } from "@swooper/mapgen-core/authoring/maps";
import type { Static } from "@swooper/mapgen-core/authoring";
import foundationDomain from "@mapgen/domain/foundation";
import standardRecipe, { type StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import foundationStage from "../../recipes/standard/stages/foundation/index.js";

// This file exists purely to lock in authoring DX: the inline config should be
// structurally typed (stage keys + step keys + op config shapes), so TS provides
// completion + hover hints.

// Ensure stage ids and step ids remain literals (not widened to string/unknown).
type _FoundationStageId = typeof foundationStage.id;
const _foundationStageId: _FoundationStageId = "foundation";

type _FoundationStepIds = (typeof foundationStage.steps)[number]["contract"]["id"];
// @ts-expect-error - a random string should not be assignable to the step id union.
const _badFoundationStepId: _FoundationStepIds = "definitely-not-a-step";

// If the config surface degenerates to Record<string, ...> / an index signature,
// these should STOP erroring.
// @ts-expect-error - unknown stage id should not be indexable.
type _NoBogusStage = StandardRecipeConfig["bogus-stage"];

type _FoundationConfig = NonNullable<StandardRecipeConfig["foundation"]>;
// @ts-expect-error - unknown step id should not be indexable.
type _NoBogusStep = _FoundationConfig["bogus-step"];

// Sanity check: op contract envelope types must be structurally typed (not `unknown`).
type _ComputeMeshOp = typeof foundationDomain.ops.computeMesh;
type _ComputeMeshStrategyIds = keyof _ComputeMeshOp["strategies"] & string;
type _ComputeMeshStrategyIdsAreNarrow = string extends _ComputeMeshStrategyIds ? false : true;
const _computeMeshStrategyIdsAreNarrow: _ComputeMeshStrategyIdsAreNarrow = true;

type _ComputeMeshEnvelopeFromOp = Static<_ComputeMeshOp["config"]>;
type _ComputeMeshConfigFromOp = _ComputeMeshEnvelopeFromOp["config"];
type _ComputeMeshConfigFromOpIsObject = _ComputeMeshConfigFromOp extends object ? true : false;
const _computeMeshConfigFromOpIsObject: _ComputeMeshConfigFromOpIsObject = true;

// Ensure stage step schemas still carry op-enriched typing.
type _MeshStep = Extract<(typeof foundationStage.steps)[number], { contract: { id: "mesh" } }>;
type _MeshStepRuntimeConfig = Static<_MeshStep["contract"]["schema"]>;
type _ComputeMeshEnvelopeFromStepSchema = _MeshStepRuntimeConfig["computeMesh"];
type _ComputeMeshEnvelopeFromStepSchemaConfig =
  _ComputeMeshEnvelopeFromStepSchema extends { config: infer C } ? C : never;
type _ComputeMeshEnvelopeFromStepSchemaConfigIsObject =
  _ComputeMeshEnvelopeFromStepSchemaConfig extends object ? true : false;
const _computeMeshEnvelopeFromStepSchemaConfigIsObject: _ComputeMeshEnvelopeFromStepSchemaConfigIsObject = true;

type _FoundationKnobs = NonNullable<_FoundationConfig["knobs"]>;
type _PlateCountKnob = _FoundationKnobs["plateCount"];
type _PlateCountKnobIsNumber = Exclude<_PlateCountKnob, undefined> extends number ? true : false;
const _plateCountKnobIsNumber: _PlateCountKnobIsNumber = true;

type _PlateActivityKnob = _FoundationKnobs["plateActivity"];
type _PlateActivityKnobIsNumber = Exclude<_PlateActivityKnob, undefined> extends number ? true : false;
const _plateActivityKnobIsNumber: _PlateActivityKnobIsNumber = true;

createMap({
  id: "__type_test__",
  name: "__type_test__",
  recipe: standardRecipe,
  config: {
    foundation: {
      knobs: { plateCount: 28, plateActivity: 0.5 },
    },
  },
});

export {};
