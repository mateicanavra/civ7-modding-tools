import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { ArtifactValidationError, implementArtifactModules } from "@swooper/mapgen-core/authoring";
import {
  artifactModules as morphologyArtifactModules,
  artifacts as morphologyArtifacts,
} from "../../../../../src/recipes/standard/stages/morphology/artifacts/index.js";
import { withMapContextExecutionForTest } from "../../../../support/step-deps.js";

function createContext(width = 3, height = 2) {
  return createMapContext({
    setup: admitMapSetup({
      mapSeed: 7,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    }),
    adapter: createMockAdapter({ width, height }),
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
      elevation: new Int16Array(6),
      seaLevel: 0,
      landMask: new Uint8Array(6),
      bathymetry: new Int16Array(6),
    };

    withMapContextExecutionForTest(context, () => {
      expect(runtime.baseTopography.publish(context, validTopography)).toBe(validTopography);
      expect(() =>
        runtime.carvedTopography.publish(context, {
          ...validTopography,
          elevation: new Float32Array(6),
        } as never)
      ).toThrow(ArtifactValidationError);
      expect(() =>
        runtime.erodedTopography.publish(context, {
          ...validTopography,
          landMask: new Uint8Array(5),
        })
      ).toThrow(ArtifactValidationError);
      expect(() =>
        runtime.baseSubstrate.publish(context, {
          erodibilityK: new Float64Array(6),
          sedimentDepth: new Float32Array(6),
        } as never)
      ).toThrow(ArtifactValidationError);
    });
  });
});
