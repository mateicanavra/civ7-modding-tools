/// <reference types="@civ7/types" />

import foundationDomain from "@mapgen/domain/foundation";
import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { Static } from "@swooper/mapgen-core/authoring";
import standardRecipe, { type StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import foundationMantleStage from "../../recipes/standard/stages/foundation-mantle/index.js";

// This file exists purely to lock in authoring DX: the inline config should be
// structurally typed (stage keys + step keys + op config shapes), so TS provides
// completion + hover hints.

// Ensure stage ids and step ids remain literals (not widened to string/unknown).
type _FoundationMantleStageId = typeof foundationMantleStage.id;
const _foundationMantleStageId: _FoundationMantleStageId = "foundation-mantle";

type _FoundationMantleStepIds = (typeof foundationMantleStage.steps)[number]["contract"]["id"];
// @ts-expect-error - a random string should not be assignable to the step id union.
const _badFoundationStepId: _FoundationMantleStepIds = "definitely-not-a-step";

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
type _ComputeMeshStrategyIdsAreNarrow = string extends _ComputeMeshStrategyIds ? false : true;
const _computeMeshStrategyIdsAreNarrow: _ComputeMeshStrategyIdsAreNarrow = true;

type _ComputeMeshEnvelopeFromOp = Static<_ComputeMeshOp["config"]>;
type _ComputeMeshConfigFromOp = _ComputeMeshEnvelopeFromOp["config"];
type _ComputeMeshConfigFromOpIsObject = _ComputeMeshConfigFromOp extends object ? true : false;
const _computeMeshConfigFromOpIsObject: _ComputeMeshConfigFromOpIsObject = true;

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
type _ComputeMeshEnvelopeFromStepSchemaConfigIsObject =
  _ComputeMeshEnvelopeFromStepSchemaConfig extends object ? true : false;
const _computeMeshEnvelopeFromStepSchemaConfigIsObject: _ComputeMeshEnvelopeFromStepSchemaConfigIsObject = true;

// plateCount is authored on the mantle stage (mesh density).
type _FoundationMantleKnobs = NonNullable<_FoundationMantleConfig["knobs"]>;
type _PlateCountKnob = _FoundationMantleKnobs["plateCount"];
type _PlateCountKnobIsNumber = Exclude<_PlateCountKnob, undefined> extends number ? true : false;
const _plateCountKnobIsNumber: _PlateCountKnobIsNumber = true;

// plateActivity is authored on the projection stage (projected kinematics).
type _FoundationProjectionConfig = NonNullable<StandardRecipeConfig["foundation-projection"]>;
type _FoundationProjectionKnobs = NonNullable<_FoundationProjectionConfig["knobs"]>;
type _PlateActivityKnob = _FoundationProjectionKnobs["plateActivity"];
type _PlateActivityKnobIsNumber =
  Exclude<_PlateActivityKnob, undefined> extends number ? true : false;
const _plateActivityKnobIsNumber: _PlateActivityKnobIsNumber = true;

createMap({
  id: "__type_test__",
  name: "__type_test__",
  recipe: standardRecipe,
  config: {
    "foundation-mantle": { knobs: { plateCount: 28 } },
    "foundation-lithosphere": { knobs: { plateCount: 28 } },
    "foundation-projection": { knobs: { plateActivity: 0.5 } },
  },
});

export {};
