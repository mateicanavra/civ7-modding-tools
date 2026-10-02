import { describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { artifacts as climateArtifacts } from "../../../../../src/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../src/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as shelfArtifacts } from "../../../../../src/domain/morphology/modules/shelf/artifacts/index.js";
import { config as baselineConfig } from "../../../../../src/recipes/standard/stages/hydrology/climate/baseline/steps/climate-baseline/config.js";
import {
  type captureEarthCoastBaseline,
  writeEarthCoastBaselineCapture,
} from "../../fixtures/earth/capture.js";

type Capture = ReturnType<typeof captureEarthCoastBaseline>;
const sha256 = (value: string | Uint8Array) => createHash("sha256").update(value).digest("hex");

describe("retained Earth-coast baseline evidence", () => {
  it("needs only admitted topography and shelf, with four distinct baseline artifact authorities", () => {
    const id = (dependency: string | { readonly id: string }) =>
      typeof dependency === "string" ? dependency : dependency.id;
    expect(baselineConfig.requires.map(id)).toEqual([
      morphologyLandformsArtifacts.initialTopography.id,
      shelfArtifacts.shelf.id,
    ]);
    expect(baselineConfig.provides.map(id)).toEqual([
      climateArtifacts.baselineClimateField.id,
      climateArtifacts.thermalField.id,
      climateArtifacts.pressureField.id,
      climateArtifacts.windField.id,
    ]);
  });

  it("retains both arms and repeats with reconstructible arrays, hashes, setup and truthful units", () => {
    const root = mkdtempSync(join(tmpdir(), "earth-climate-capture-"));
    const output = join(root, "new-evidence");
    try {
      const receipt = writeEarthCoastBaselineCapture(output);
      expect(readdirSync(output).sort()).toEqual([
        "aquaplanet-repeat.json",
        "aquaplanet.json",
        "earth-coast-repeat.json",
        "earth-coast.json",
        "receipt.json",
      ]);
      expect(receipt.sourceWaterReference).toEqual({
        largestComponentCells: 3767,
        enclosedCells: 71,
        enclosedComponents: 34,
      });
      const captures: Capture[] = [];
      for (const result of receipt.results) {
        expect(result.exactRepeat).toBe(true);
        expect(result.inputsUnchanged).toBe(true);
        expect(Object.values(result.repeatedFieldHashes).every(Boolean)).toBe(true);
        for (const file of result.files) {
          const bytes = readFileSync(join(output, file.name));
          expect(sha256(bytes)).toBe(file.sha256);
          const capture = JSON.parse(bytes.toString("utf8")) as Capture;
          captures.push(capture);
          expect(capture.sourcePayloadSha256).toBe(
            "1048d5d628efcaca1c2943f246603caacaf2bc2087530538c8d67466149c5485"
          );
          expect(capture.setup.latitudeBounds).toEqual({ topLatitude: 90, bottomLatitude: -90 });
          expect(capture.compiledConfigs.climateBaseline.seasonality.axialTiltDeg).toBe(23.44);
          expect(capture.sampling.model).toBe("periodic-cycle");
          if (capture.sampling.model !== "periodic-cycle") throw new Error("Expected periodic Earth evidence.");
          expect(capture.sampling.phases).toHaveLength(24);
          expect(capture.sampling.observationIndices).toEqual([0, 6, 12, 18]);
          expect(capture.registration.latitude).toContain("retains exact poles");
          expect(capture.semantics.temperature).toContain("dense-integrated");
          expect(capture.semantics.aggregation).toContain("not the observation subset");
          expect(capture.registration.longitude).toContain("unqualified");
          expect(capture.semantics.water).toContain("including enclosed water");
          expect(capture.fields["thermalField.surfaceTemperatureC"]!.authority).toBe(
            `${climateArtifacts.thermalField.id}.surfaceTemperatureC`
          );
          expect(capture.fields["oceanThermal.sstC"]!.authority).toContain("not an artifact");
          expect(capture.fields["baselineClimateField.surfaceTemperatureC"]).toBeUndefined();
          expect(capture.fields["baselineClimateField.potentialDemand"]!.units).toContain(
            "not open-water evaporation"
          );
          expect(capture.fields["topography.elevation"]!.units).toContain("not metres");
          expect(capture.fields["thermalResponse.annualClippingDeltaC"]).toBeDefined();
          for (let phase = 0; phase < 24; phase++) {
            expect(capture.fields[`seasonalIntegration.rainfall.${phase}`]).toBeDefined();
            expect(capture.fields[`seasonalIntegration.potentialDemand.${phase}`]).toBeDefined();
          }
          const constructors = {
            u8: Uint8Array,
            i8: Int8Array,
            u16: Uint16Array,
            i16: Int16Array,
            i32: Int32Array,
            f32: Float32Array,
            f64: Float64Array,
          };
          for (const [key, field] of Object.entries(capture.fields)) {
            expect(field.values).toHaveLength(key === "topography.seaLevel" ? 1 : 6996);
            expect(field.values.every(Number.isFinite)).toBe(true);
            const reconstructed = new constructors[field.storage](field.values);
            expect(sha256(new Uint8Array(reconstructed.buffer))).toBe(field.sha256);
          }
          for (const name of ["elevation", "seaLevel", "bathymetry"]) {
            expect(capture.fields[`topography.${name}`]!.values.every((value) => value === 0)).toBe(
              true
            );
          }
          for (
            let season = 0;
            season < capture.compiledConfigs.climateBaseline.seasonality.modeCount;
            season++
          ) {
            for (const name of [
              "Rainfall",
              "Humidity",
              "SurfaceTemperatureC",
              "Pressure",
              "WindU",
              "WindV",
              "CurrentU",
              "CurrentV",
            ]) {
              expect(capture.fields[`seasonal${name}.${season}`]).toBeDefined();
            }
          }
        }
      }
      const earth = captures[0]!;
      const aquaplanet = captures[2]!;
      expect(earth.summary.landCells).toBe(3158);
      expect(aquaplanet.summary.landCells).toBe(0);
      expect(earth.setup).toEqual(aquaplanet.setup);
      expect(earth.authoredMapConfig).toEqual(aquaplanet.authoredMapConfig);
      expect(earth.compiledConfigs).toEqual(aquaplanet.compiledConfigs);
      expect(earth.fields["baselineClimateField.rainfall"]!.sha256).not.toBe(
        aquaplanet.fields["baselineClimateField.rainfall"]!.sha256
      );
      expect(aquaplanet.fields["shelf.shelfMask"]!.values.every((value) => value === 0)).toBe(true);
      expect(aquaplanet.fields["thermalField.surfaceTemperatureC"]!.values).toEqual(
        aquaplanet.fields["oceanThermal.sstC"]!.values
      );
      expect(
        aquaplanet.fields["baselineClimateField.potentialDemand"]!.values.every(
          (value) => Number.isFinite(value) && value >= 0
        )
      ).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 30_000);

  it("refuses an existing evidence directory before changing its contents", () => {
    const output = mkdtempSync(join(tmpdir(), "earth-climate-retained-"));
    try {
      writeFileSync(join(output, "retained.json"), "original evidence\n");
      expect(() => writeEarthCoastBaselineCapture(output)).toThrow();
      expect(readdirSync(output)).toEqual(["retained.json"]);
      expect(readFileSync(join(output, "retained.json"), "utf8")).toBe("original evidence\n");
    } finally {
      rmSync(output, { recursive: true, force: true });
    }
  });
});
