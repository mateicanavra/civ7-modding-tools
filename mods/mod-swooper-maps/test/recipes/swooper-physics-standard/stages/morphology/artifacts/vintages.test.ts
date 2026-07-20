import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { ArtifactValidationError, implementArtifactModules } from "@swooper/mapgen-core/authoring";
import { withMapContextExecutionForTest } from "@swooper/mapgen-core/testing";
import {
  artifactModules as morphologyArtifactModules,
  artifacts as morphologyArtifacts,
} from "../../../../../../src/recipes/standard/stages/morphology/artifacts/index.js";

const SYNTHETIC_DIMENSIONS = { width: 3, height: 2 } as const;
const SYNTHETIC_CARDINALITY = SYNTHETIC_DIMENSIONS.width * SYNTHETIC_DIMENSIONS.height;

function createContext() {
  return createMapContext({
    setup: admitMapSetup({
      mapSeed: 7,
      dimensions: SYNTHETIC_DIMENSIONS,
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    }),
    adapter: createMockAdapter(SYNTHETIC_DIMENSIONS),
  });
}

describe("Morphology artifact vintages", () => {
  it("registers distinct ordered topography and substrate identities", () => {
    expect([
      morphologyArtifacts.baseTopography.id,
      morphologyArtifacts.carvedTopography.id,
      morphologyArtifacts.erodedTopography.id,
      morphologyArtifacts.topography.id,
    ]).toEqual([
      "artifact:morphology.topography.base",
      "artifact:morphology.topography.carved",
      "artifact:morphology.topography.eroded",
      "artifact:morphology.topography",
    ]);
    expect([morphologyArtifacts.baseSubstrate.id, morphologyArtifacts.substrate.id]).toEqual([
      "artifact:morphology.substrate.base",
      "artifact:morphology.substrate",
    ]);
  });

  it("admits only exact typed-array constructors and map cardinality", () => {
    const context = createContext();
    const runtime = implementArtifactModules([
      morphologyArtifactModules.baseTopography,
      morphologyArtifactModules.carvedTopography,
      morphologyArtifactModules.erodedTopography,
      morphologyArtifactModules.baseSubstrate,
    ]);
    const validTopography = {
      elevation: new Int16Array(SYNTHETIC_CARDINALITY),
      seaLevel: 0,
      landMask: new Uint8Array(SYNTHETIC_CARDINALITY),
      bathymetry: new Int16Array(SYNTHETIC_CARDINALITY),
    };

    withMapContextExecutionForTest(context, () => {
      expect(runtime.baseTopography.publish(context, validTopography)).toBe(validTopography);
      expect(() =>
        runtime.carvedTopography.publish(context, {
          ...validTopography,
          elevation: new Float32Array(SYNTHETIC_CARDINALITY),
        } as never)
      ).toThrow(ArtifactValidationError);
      expect(() =>
        runtime.erodedTopography.publish(context, {
          ...validTopography,
          landMask: new Uint8Array(SYNTHETIC_CARDINALITY - 1),
        })
      ).toThrow(ArtifactValidationError);
      expect(() =>
        runtime.baseSubstrate.publish(context, {
          erodibilityK: new Float64Array(SYNTHETIC_CARDINALITY),
          sedimentDepth: new Float32Array(SYNTHETIC_CARDINALITY),
        } as never)
      ).toThrow(ArtifactValidationError);
    });
  });
});
