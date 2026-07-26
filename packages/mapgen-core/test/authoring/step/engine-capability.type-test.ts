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
    engine: ["readCurrentMapWaterMask", "readCurrentMapTerrainTypes"],
  }),
  {
    run: (context, _config, _ops, dependencies) => {
      const waterMask = dependencies.engine.readCurrentMapWaterMask(context);
      const terrainTypes = dependencies.engine.readCurrentMapTerrainTypes(context);
      type WaterMaskIsUint8Array = Expect<IsEqual<typeof waterMask, Uint8Array>>;
      type TerrainTypesIsInt32Array = Expect<IsEqual<typeof terrainTypes, Int32Array>>;
      void (undefined as unknown as WaterMaskIsUint8Array);
      void (undefined as unknown as TerrainTypesIsInt32Array);

      // @ts-expect-error Undeclared engine methods are absent from this step's dependency surface.
      dependencies.engine.getBiomeType(context, 0, 0);
      // @ts-expect-error Engine methods are context-first occurrence capabilities.
      dependencies.engine.readCurrentMapWaterMask();
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
});

defineStep({
  id: "private-effect-method",
  requires: [],
  provides: [],
  // @ts-expect-error Effect verification is executor-private.
  engine: ["verifyEffect"],
});

defineStep({
  id: "private-random-method",
  requires: [],
  provides: [],
  // @ts-expect-error Adapter RNG is not authored MapGen randomness.
  engine: ["getRandomNumber"],
});

defineStep({
  id: "unknown-engine-method",
  requires: [],
  provides: [],
  // @ts-expect-error Unknown adapter methods cannot enter a step contract.
  engine: ["notAnEngineMethod"],
});

defineStep({
  id: "concrete-adapter-helper",
  requires: [],
  provides: [],
  // @ts-expect-error Concrete adapter helpers are not authored engine capabilities.
  engine: ["reset"],
});

void SurfaceStep;
