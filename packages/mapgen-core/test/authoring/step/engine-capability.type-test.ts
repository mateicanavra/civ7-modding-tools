import { createStep, defineStep, type StepEngineDecl, Type } from "@mapgen/authoring/index.js";
import type { MapContext } from "@mapgen/core/map-context.js";
import { buildStepTestDependencies } from "@mapgen/testing/index.js";
import type { IsEqual } from "type-fest";

type Expect<T extends true> = T;

const SurfaceStep = createStep(
  defineStep({
    id: "surface-observer",
    requires: [],
    provides: [],
    engine: ["readCurrentMapSurface", "getTerrainType"],
    schema: Type.Object({}, { additionalProperties: false }),
  }),
  {
    run: (context, _config, _ops, dependencies) => {
      const surface = dependencies.engine.readCurrentMapSurface(context);
      const terrain = dependencies.engine.getTerrainType(context, 0, 0);
      type SurfaceWidthIsNumber = Expect<IsEqual<typeof surface.width, number>>;
      type TerrainIsNumber = Expect<IsEqual<typeof terrain, number>>;
      void (undefined as unknown as SurfaceWidthIsNumber);
      void (undefined as unknown as TerrainIsNumber);

      // @ts-expect-error Undeclared engine methods are absent from this step's dependency surface.
      dependencies.engine.getBiomeType(context, 0, 0);
      // @ts-expect-error Engine methods are context-first occurrence capabilities.
      dependencies.engine.readCurrentMapSurface();
      // @ts-expect-error Raw adapter identity is never part of authored dependencies.
      dependencies.engine.adapter;
    },
  }
);

declare const context: MapContext;
buildStepTestDependencies(SurfaceStep, context);
// @ts-expect-error Engine-declaring step test dependencies require their exact active context.
buildStepTestDependencies(SurfaceStep);

const widenedEngineMethods: StepEngineDecl = ["getTerrainType"];
defineStep({
  id: "widened-engine-declaration",
  requires: [],
  provides: [],
  // @ts-expect-error Engine declarations must retain a literal tuple so the dependency surface is exact.
  engine: widenedEngineMethods,
  schema: Type.Object({}, { additionalProperties: false }),
});

defineStep({
  id: "private-effect-method",
  requires: [],
  provides: [],
  // @ts-expect-error Effect verification is executor-private.
  engine: ["verifyEffect"],
  schema: Type.Object({}, { additionalProperties: false }),
});

defineStep({
  id: "private-random-method",
  requires: [],
  provides: [],
  // @ts-expect-error Adapter RNG is not authored MapGen randomness.
  engine: ["getRandomNumber"],
  schema: Type.Object({}, { additionalProperties: false }),
});

defineStep({
  id: "unknown-engine-method",
  requires: [],
  provides: [],
  // @ts-expect-error Unknown adapter methods cannot enter a step contract.
  engine: ["notAnEngineMethod"],
  schema: Type.Object({}, { additionalProperties: false }),
});

defineStep({
  id: "concrete-adapter-helper",
  requires: [],
  provides: [],
  // @ts-expect-error Concrete adapter helpers are not authored engine capabilities.
  engine: ["reset"],
  schema: Type.Object({}, { additionalProperties: false }),
});

void SurfaceStep;
