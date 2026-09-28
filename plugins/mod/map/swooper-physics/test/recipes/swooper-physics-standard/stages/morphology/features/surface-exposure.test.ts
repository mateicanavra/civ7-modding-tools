import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { admitMapSetup, createMapContext, deriveStepSeed } from "@swooper/mapgen-core";
import { readArtifact } from "@swooper/mapgen-core/authoring";
import { BOUNDARY_TYPE } from "@swooper/mapgen-core/lib/plates";
import { buildStepTestDependencies, publishTestArtifact, withMapContextExecutionForTest } from "@swooper/mapgen-core/testing";
import { artifacts as foundationArtifacts } from "../../../../../../src/domain/foundation/modules/projection/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "../../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as coastsArtifacts } from "../../../../../../src/domain/morphology/modules/coasts/artifacts/index.js";
import { artifacts as erosionArtifacts } from "../../../../../../src/domain/morphology/modules/erosion/artifacts/index.js";
import { artifacts as landformsArtifacts } from "../../../../../../src/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as routingArtifacts } from "../../../../../../src/domain/morphology/modules/routing/artifacts/index.js";
import { artifacts as terrainArtifacts } from "../../../../../../src/domain/morphology/modules/terrain/artifacts/index.js";
import morphology from "../../../../../../src/domain/morphology/router.js";
import { MountainsStep } from "../../../../../../src/recipes/standard/stages/morphology/features/steps/mountains/step.js";
import { VolcanoesStep } from "../../../../../../src/recipes/standard/stages/morphology/features/steps/volcanoes/step.js";
import { TEST_MAP_SEED } from "../../../../../setup.js";
import { createSurfaceWaterFixture } from "./fixtures/surface-water.js";

const { planRidges, planFoothills, planRoughLands, planVolcanoes } = morphology.landforms.ops;

describe("post-water surface landform eligibility", () => {
  for (const model of ["certified-sill-spill", "legacy-sink-budget"] as const) {
    it(`forwards distinct substrate and candidate masks for ${model}`, () => {
      const width = 8;
      const height = 1;
      const size = width * height;
      const fixture = createSurfaceWaterFixture(model, width, height);
      const before = structuredClone(fixture);
      const { topography, wetCell, minorChannel, majorChannel } = fixture;
      const certified = model === "certified-sill-spill";
      const exposed = topography.landMask.slice();
      if (certified) exposed[wetCell] = 0;
      const candidates = exposed.slice();
      if (certified) {
        candidates[minorChannel] = 0;
        candidates[majorChannel] = 0;
      }
      const setup = admitMapSetup({
        mapSeed: TEST_MAP_SEED,
        dimensions: { width, height },
        latitudeBounds: { topLatitude: 1, bottomLatitude: -1 },
      });
      const context = createMapContext({ setup, adapter: createMockAdapter({ width, height }) });
      const strong = () => new Uint8Array(size).fill(255);
      const boundaryType = new Uint8Array(size).fill(BOUNDARY_TYPE.convergent);
      const elevation = topography.elevation;
      const distanceToCoast = new Uint16Array(size).fill(9);
      const calls: string[] = [];

      withMapContextExecutionForTest(context, (stepContext) => {
        publishTestArtifact(stepContext, landformsArtifacts.topography, topography);
        publishTestArtifact(stepContext, hydrographyArtifacts.hydrography, fixture.hydrography);
        publishTestArtifact(stepContext, hydrographyArtifacts.lakePlan, fixture.lakePlan);
        publishTestArtifact(stepContext, terrainArtifacts.beltDrivers, {
          boundaryCloseness: strong(), boundaryType,
          upliftPotential: strong(), collisionPotential: strong(), subductionPotential: strong(),
          riftPotential: strong(), tectonicStress: strong(), beltAge: new Uint8Array(size),
          dominantEra: new Uint8Array(size), beltMask: new Uint8Array(size),
          beltDistance: new Uint8Array(size), beltNearestSeed: new Int32Array(size).fill(-1),
        });
        publishTestArtifact(stepContext, erosionArtifacts.substrate, {
          erodibilityK: new Float32Array(size).fill(0.2), sedimentDepth: new Float32Array(size).fill(0.5),
        });
        publishTestArtifact(stepContext, routingArtifacts.routing, {
          flowDir: new Int32Array(size).fill(-1), flowAccum: new Float32Array(size), basinId: new Int32Array(size).fill(-1),
        });
        publishTestArtifact(stepContext, coastsArtifacts.baseCoastline, {
          coastalLand: new Uint8Array(size), coastalWater: new Uint8Array(size), distanceToCoast,
        });
        publishTestArtifact(stepContext, foundationArtifacts.plates, {
          id: new Int16Array(size), boundaryCloseness: strong(), boundaryType,
          tectonicStress: strong(), upliftPotential: strong(), riftPotential: strong(),
          shieldStability: new Uint8Array(size), volcanism: strong(),
          movementU: new Int8Array(size), movementV: new Int8Array(size), rotation: new Int8Array(size),
        });

        MountainsStep.run(stepContext, {
          ridges: planRidges.defaultConfig,
          foothills: planFoothills.defaultConfig,
          roughLands: planRoughLands.defaultConfig,
        }, {
          ridges: (...[input, config]: Parameters<typeof planRidges.run>) => {
            calls.push("ridges");
            expect(input.landMask).toEqual(exposed);
            expect(input.candidateMask).toEqual(candidates);
            expect(input.elevation).toBe(elevation);
            if (!certified) {
              expect(input.landMask).toBe(topography.landMask);
              expect(input.candidateMask).toBe(topography.landMask);
            }
            return planRidges.run(input, config);
          },
          foothills: (...[input, config]: Parameters<typeof planFoothills.run>) => {
            calls.push("foothills");
            expect(input.landMask).toEqual(exposed);
            expect(input.landMask[minorChannel]).toBe(1);
            expect(input.landMask[majorChannel]).toBe(1);
            expect(input.elevation).toBe(elevation);
            return planFoothills.run(input, config);
          },
          roughLands: (...[input, config]: Parameters<typeof planRoughLands.run>) => {
            calls.push("rough-lands");
            expect(input.landMask).toEqual(exposed);
            expect(input.landMask[minorChannel]).toBe(1);
            expect(input.landMask[majorChannel]).toBe(1);
            expect(input.elevation).toBe(elevation);
            expect(input.distanceToCoast).toBe(distanceToCoast);
            expect(input.seaLevel).toBe(topography.seaLevel);
            return planRoughLands.run(input, config);
          },
        }, buildStepTestDependencies(MountainsStep, stepContext));

        VolcanoesStep.run(stepContext, {
          volcanoes: {
            ...planVolcanoes.defaultConfig,
            config: { ...planVolcanoes.defaultConfig.config, minVolcanoes: size, maxVolcanoes: size, minSpacing: 1 },
          },
        }, {
          volcanoes: (...[input, config]: Parameters<typeof planVolcanoes.run>) => {
            calls.push("volcanoes");
            expect(input.landMask).toEqual(exposed);
            expect(input.candidateMask).toEqual(candidates);
            expect(input.rngSeed).toBe(deriveStepSeed(TEST_MAP_SEED, "morphology:planVolcanoes"));
            if (!certified) {
              expect(input.landMask).toBe(topography.landMask);
              expect(input.candidateMask).toBe(topography.landMask);
            }
            return planVolcanoes.run(input, config);
          },
        }, buildStepTestDependencies(VolcanoesStep, stepContext));
      });

      expect(calls).toEqual(["ridges", "foothills", "rough-lands", "volcanoes"]);
      expect(readArtifact(context, landformsArtifacts.volcanoes).volcanoMask).toEqual(candidates);
      const mountains = readArtifact(context, landformsArtifacts.mountains);
      if (certified) {
        expect(mountains.mountainMask[wetCell]).toBe(0);
        expect(mountains.hillMask[wetCell]).toBe(0);
        expect(mountains.mountainMask[minorChannel]).toBe(0);
        expect(mountains.mountainMask[majorChannel]).toBe(0);
      }
      expect(fixture).toEqual(before);
    });
  }
});
