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
import { artifacts as shelfArtifacts } from "../../../../../../src/domain/morphology/modules/shelf/artifacts/index.js";
import { artifacts as terrainArtifacts } from "../../../../../../src/domain/morphology/modules/terrain/artifacts/index.js";
import morphology from "../../../../../../src/domain/morphology/router.js";
import { MountainsStep } from "../../../../../../src/recipes/standard/stages/morphology/features/steps/mountains/step.js";
import { VolcanoesStep } from "../../../../../../src/recipes/standard/stages/morphology/features/steps/volcanoes/step.js";
import { TEST_MAP_SEED } from "../../../../../setup.js";
import { createEmptyWaterFixture, createSurfaceWaterFixture } from "./fixtures/surface-water.js";

const { planRidges, planFoothills, planRoughLands, planVolcanoes } = morphology.landforms.ops;

describe("post-water surface landform eligibility", () => {
  it("forwards final exposure and channel reservations while retaining the pre-lake rough-land coast reference", () => {
    const width = 8;
    const height = 1;
    const size = width * height;
    const fixture = createSurfaceWaterFixture(width, height);
    const before = structuredClone(fixture);
    const { topography, wetCell, minorChannel, majorChannel } = fixture;
    const exposed = topography.landMask.slice();
    exposed[wetCell] = 0;
    const candidates = exposed.slice();
    candidates[minorChannel] = 0;
    candidates[majorChannel] = 0;
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
    const resolvedDistanceToCoast = new Uint16Array(size);
    const calls: string[] = [];
    const upstreamArea = new Int32Array([0, 4, 4, 3, 1, 1, 1, 1]);
    const riverNetwork = { ...createEmptyWaterFixture(width, height).riverNetwork, upstreamArea };

    withMapContextExecutionForTest(context, (stepContext) => {
      publishTestArtifact(stepContext, erosionArtifacts.topography, topography);
      publishTestArtifact(stepContext, hydrographyArtifacts.hydrography, fixture.hydrography);
      publishTestArtifact(stepContext, hydrographyArtifacts.lakePlan, fixture.lakePlan);
      publishTestArtifact(stepContext, hydrographyArtifacts.riverNetwork, riverNetwork);
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
        flowDir: new Int32Array(size).fill(-1), flowAccum: new Float32Array(size).fill(999), basinId: new Int32Array(size).fill(-1),
      });
      publishTestArtifact(stepContext, coastsArtifacts.resolvedCoastline, {
        coastalLand: new Uint8Array(size), coastalWater: new Uint8Array(size), distanceToCoast: resolvedDistanceToCoast,
      });
      publishTestArtifact(stepContext, shelfArtifacts.shelf, {
        shelfMask: new Uint8Array(size), coastalLand: new Uint8Array(size), coastalWater: new Uint8Array(size), distanceToCoast,
      });
      publishTestArtifact(stepContext, foundationArtifacts.plates, {
        id: new Int16Array(size), boundaryCloseness: strong(), boundaryType,
        tectonicStress: strong(), upliftPotential: strong(), riftPotential: strong(),
        shieldStability: new Uint8Array(size), volcanism: strong(),
        movementU: new Int8Array(size), movementV: new Int8Array(size), rotation: new Int8Array(size),
      });

      const runMountains = () => MountainsStep.run(stepContext, {
        ridges: planRidges.defaultConfig,
        foothills: planFoothills.defaultConfig,
        roughLands: planRoughLands.defaultConfig,
      }, {
        ridges: (...[input, config]: Parameters<typeof planRidges.run>) => {
          calls.push("ridges");
          expect(input.landMask).toEqual(exposed);
          expect(input.candidateMask).toEqual(candidates);
          expect(input.elevation).toBe(elevation);
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
          expect(input.distanceToCoast).not.toBe(resolvedDistanceToCoast);
          expect(input.seaLevel).toBe(topography.seaLevel);
          expect(input.flowAccum).toEqual(Float32Array.from(upstreamArea));
          expect(input.flowAccum).not.toEqual(Float32Array.from(fixture.hydrography.discharge));
          return planRoughLands.run(input, config);
        },
      }, buildStepTestDependencies(MountainsStep, stepContext));
      for (const invalidArea of [-1, 2 ** 24 + 1]) {
        upstreamArea[0] = invalidArea;
        expect(runMountains).toThrow(/nonnegative integer exactly representable in Float32/);
        expect(calls).toEqual([]);
      }
      upstreamArea[0] = 0;
      runMountains();

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
          return planVolcanoes.run(input, config);
        },
      }, buildStepTestDependencies(VolcanoesStep, stepContext));
    });

    expect(calls).toEqual(["ridges", "foothills", "rough-lands", "volcanoes"]);
    expect(readArtifact(context, landformsArtifacts.volcanoes).volcanoMask).toEqual(candidates);
    const mountains = readArtifact(context, landformsArtifacts.mountains);
    expect(mountains.mountainMask[wetCell]).toBe(0);
    expect(mountains.hillMask[wetCell]).toBe(0);
    expect(mountains.mountainMask[minorChannel]).toBe(0);
    expect(mountains.mountainMask[majorChannel]).toBe(0);
    expect(fixture).toEqual(before);
    expect(MountainsStep.contract.requires).toContain(shelfArtifacts.shelf);
    expect(MountainsStep.contract.requires).toContain(hydrographyArtifacts.riverNetwork);
    expect(MountainsStep.contract.requires).not.toContain(routingArtifacts.routing);
    expect(MountainsStep.contract.requires).not.toContain(coastsArtifacts.resolvedCoastline);
  });
});
