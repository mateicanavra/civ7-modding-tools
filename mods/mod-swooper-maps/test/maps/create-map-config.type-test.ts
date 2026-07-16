import foundationDomain from "@mapgen/domain/foundation";
import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { Static } from "@swooper/mapgen-core/authoring";
import type { ExtendsStrict, IsEqual, IsStringLiteral } from "type-fest";
import { buildStandardRecipeDefaultConfig } from "../../src/recipes/standard/artifacts.js";
import standardRecipe, { type StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";
import foundationMantleStage from "../../src/recipes/standard/stages/foundation-mantle/index.js";
import { FoundationMantlePublicSchema } from "../../src/recipes/standard/stages/foundation-public-config.js";

type Expect<T extends true> = T;

type FoundationMantleStageId = typeof foundationMantleStage.id;
export type FoundationMantleStageIdIsLiteral = Expect<
  IsEqual<FoundationMantleStageId, "foundation-mantle">
>;

type FoundationMantleStepIds = (typeof foundationMantleStage.steps)[number]["contract"]["id"];
// @ts-expect-error Unknown step ids are not assignable.
const badFoundationStepId: FoundationMantleStepIds = "definitely-not-a-step";

// @ts-expect-error Unknown stage ids are not part of the recipe config.
type NoBogusStage = StandardRecipeConfig["bogus-stage"];

type FoundationMantleConfig = NonNullable<StandardRecipeConfig["foundation-mantle"]>;
// @ts-expect-error Unknown step ids are not part of the stage config.
type NoBogusStep = FoundationMantleConfig["bogus-step"];

type ComputeMeshOp = typeof foundationDomain.ops.computeMesh;
type ComputeMeshStrategyIds = keyof ComputeMeshOp["strategies"] & string;
export type ComputeMeshStrategyIdsAreNarrow = Expect<IsStringLiteral<ComputeMeshStrategyIds>>;

type ComputeMeshEnvelopeFromOp = Static<ComputeMeshOp["config"]>;
type ComputeMeshConfigFromOp = ComputeMeshEnvelopeFromOp["config"];
export type ComputeMeshConfigFromOpIsObject = Expect<
  ExtendsStrict<ComputeMeshConfigFromOp, object, { strictAny: true }>
>;

type MeshStep = Extract<(typeof foundationMantleStage.steps)[number], { contract: { id: "mesh" } }>;
type MeshStepRuntimeConfig = Static<MeshStep["contract"]["schema"]>;
type ComputeMeshEnvelopeFromStepSchema = MeshStepRuntimeConfig["computeMesh"];
type ComputeMeshEnvelopeFromStepSchemaConfig = ComputeMeshEnvelopeFromStepSchema extends {
  config: infer TConfig;
}
  ? TConfig
  : never;
export type ComputeMeshEnvelopeFromStepSchemaConfigIsObject = Expect<
  ExtendsStrict<ComputeMeshEnvelopeFromStepSchemaConfig, object, { strictAny: true }>
>;

type FoundationMantlePublicConfig = Static<typeof FoundationMantlePublicSchema>;
type MeshPlateCount = FoundationMantlePublicConfig["meshResolution"]["plateCount"];
export type MeshPlateCountIsNumber = Expect<IsEqual<MeshPlateCount, number>>;

type FoundationTectonicsConfig = NonNullable<StandardRecipeConfig["foundation-tectonics"]>;
type FoundationTectonicsKnobs = NonNullable<FoundationTectonicsConfig["knobs"]>;
type PlateActivityKnob = FoundationTectonicsKnobs["plateActivity"];
export type PlateActivityKnobIsNumber = Expect<
  IsEqual<Exclude<PlateActivityKnob, undefined>, number>
>;

createMap({
  id: "__type_test__",
  name: "__type_test__",
  recipe: standardRecipe,
  config: buildStandardRecipeDefaultConfig(),
});

void badFoundationStepId;
