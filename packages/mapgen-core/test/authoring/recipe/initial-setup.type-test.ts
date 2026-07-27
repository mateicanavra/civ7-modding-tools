import {
  createRecipe,
  createStage,
  createStep,
  defineInitialSetup,
  defineStep,
  type RecipeInitialSetupInputOf,
  type RecipeInitialSetupValueOf,
  Type,
} from "@mapgen/authoring/index.js";
import type { IsEqual } from "type-fest";
import type { Static } from "typebox";

type Expect<T extends true> = T;

const ExactInitialSetup = defineInitialSetup({
  id: "test/exact-initial-setup",
  schema: Type.Object(
    {
      physical: Type.Object(
        {
          mapSeed: Type.Integer(),
          dimensions: Type.Object(
            { width: Type.Integer(), height: Type.Integer() },
            { additionalProperties: false }
          ),
          latitudeBounds: Type.Object(
            { topLatitude: Type.Number(), bottomLatitude: Type.Number() },
            { additionalProperties: false }
          ),
        },
        { additionalProperties: false }
      ),
      options: Type.Object({ seaLevel: Type.Integer() }, { additionalProperties: false }),
    },
    { additionalProperties: false }
  ),
  refine: (value, facilities) => {
    type RefinedOptionIsSchemaDerived = Expect<IsEqual<typeof value.options.seaLevel, number>>;
    facilities.issues.add("contextually inferred");
    // @ts-expect-error Semantic refinement receives the admitted readonly value.
    value.options.seaLevel = 3;
    // @ts-expect-error The Core-owned issue sink is immutable.
    facilities.issues.add = () => undefined;
  },
  physical: (value) => {
    type PhysicalSeedIsSchemaDerived = Expect<IsEqual<typeof value.physical.mapSeed, number>>;
    type OptionIsSchemaDerived = Expect<IsEqual<typeof value.options.seaLevel, number>>;
    // @ts-expect-error The physical projector receives the admitted readonly value.
    value.options.seaLevel = 4;
    return value.physical;
  },
});

defineInitialSetup({
  id: "test/async-refinement",
  schema: Type.Object({ mapSeed: Type.Integer() }, { additionalProperties: false }),
  // @ts-expect-error Initial setup refinements must complete synchronously.
  refine: async () => undefined,
  physical: (value) => ({
    mapSeed: value.mapSeed,
    dimensions: { width: 4, height: 3 },
    latitudeBounds: { topLatitude: 70, bottomLatitude: -70 },
  }),
});

const DeclaredStep = createStep(
  defineStep({
    id: "declared-initial-setup",
    requires: [],
    provides: [],
    initialSetup: ExactInitialSetup,
  }),
  {
    run: (_context, _config, _ops, deps) => {
      type ExactOptionAccess = Expect<IsEqual<typeof deps.initialSetup.options.seaLevel, number>>;
      // @ts-expect-error An admitted initial value is deeply readonly.
      deps.initialSetup.options.seaLevel = 2;
      // @ts-expect-error Undeclared extension state does not exist.
      deps.initialSetup.unknown;
    },
  }
);

createStep(
  defineStep({
    id: "undeclared-initial-setup",
    requires: [],
    provides: [],
  }),
  {
    run: (_context, _config, _ops, deps) => {
      // @ts-expect-error A step gets no initialSetup dependency without an exact declaration.
      deps.initialSetup;
    },
  }
);

const stage = createStage({
  id: "foundation",
  knobsSchema: Type.Object({}, { additionalProperties: false }),
  steps: [DeclaredStep],
});

export const ExactInitialSetupRecipe = createRecipe({
  id: "test.exact-initial-setup",
  initialSetup: ExactInitialSetup,
  tagDefinitions: [],
  stages: [stage],
  compileOpsById: {},
});

type ExpectedInput = Static<(typeof ExactInitialSetup)["schema"]>;
export type RecipeInputComesFromSchema = Expect<
  IsEqual<RecipeInitialSetupInputOf<typeof ExactInitialSetupRecipe>, ExpectedInput>
>;
export type RecipeValuePreservesExactSchema = Expect<
  IsEqual<RecipeInitialSetupValueOf<typeof ExactInitialSetupRecipe>["options"]["seaLevel"], number>
>;

const exactInput: RecipeInitialSetupInputOf<typeof ExactInitialSetupRecipe> = {
  physical: {
    mapSeed: 1,
    dimensions: { width: 4, height: 3 },
    latitudeBounds: { topLatitude: 70, bottomLatitude: -70 },
  },
  options: { seaLevel: 2 },
};

ExactInitialSetupRecipe.compile(exactInput, { foundation: { knobs: {} } });
// @ts-expect-error The full schema input requires every declared property.
ExactInitialSetupRecipe.compile({ physical: exactInput.physical }, { foundation: { knobs: {} } });
ExactInitialSetupRecipe.compile(
  {
    ...exactInput,
    // @ts-expect-error Unknown extension state is rejected at the typed boundary.
    unknown: true,
  },
  { foundation: { knobs: {} } }
);
