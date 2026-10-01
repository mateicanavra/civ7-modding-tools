import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { endianness } from "node:os";
import { join, relative, resolve } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { artifacts as climateArtifacts } from "../../../../../src/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as landformArtifacts } from "../../../../../src/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as shelfArtifacts } from "../../../../../src/domain/morphology/modules/shelf/artifacts/index.js";
import { type EarthCoastBaseline, runEarthCoastBaseline } from "./climate.js";
import { earthReference, sourceWaterComponents } from "./reference.js";

const storageTypes = {
  u8: Uint8Array,
  i8: Int8Array,
  u16: Uint16Array,
  i16: Int16Array,
  i32: Int32Array,
  f32: Float32Array,
  f64: Float64Array,
} as const;
type Storage = keyof typeof storageTypes;
const sha256 = (bytes: string | Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

function field(values: ArrayLike<number>, storage: Storage, units: string, authority: string) {
  const numbers = Array.from(values);
  if (numbers.some((value) => !Number.isFinite(value))) {
    throw new Error(`Cannot retain nonfinite ${authority} as numeric JSON arrays.`);
  }
  const typed = new storageTypes[storage](numbers);
  return {
    storage,
    units,
    authority,
    sha256: sha256(new Uint8Array(typed.buffer, typed.byteOffset, typed.byteLength)),
    values: numbers,
  };
}

function summary(values: ArrayLike<number>) {
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  for (let index = 0; index < values.length; index++) {
    const value = values[index]!;
    min = Math.min(min, value);
    max = Math.max(max, value);
    sum += value;
  }
  return { count: values.length, min, max, mean: sum / values.length };
}

/** Copies admitted artifacts and step-local observations without promoting observations to artifacts. */
export function captureEarthCoastBaseline(run: EarthCoastBaseline) {
  const { topography, shelf, baseline, thermal, pressure, wind, observation } = run;
  const artifact = (id: string, member: string) => `${id}.${member}`;
  const observed = (member: string) =>
    `ClimateBaselineStep observation.${member} (not an artifact)`;
  const vectorUnits = "quantized model forcing -127..127; not m/s";
  const rainfallUnits = "Civ7 precipitation intensity index 0..200; not mm/year";
  const humidityUnits = "atmospheric moisture index 0..255; not relative-humidity percent";
  const pressureUnits = "circulation-pressure anomaly proxy in hPa; not absolute surface pressure";
  const integration = observation.seasonalIntegration;
  const fields: Record<string, ReturnType<typeof field>> = {
    "topography.elevation": field(
      topography.elevation,
      "i16",
      "flat model relief units; not metres",
      artifact(landformArtifacts.topography.id, "elevation")
    ),
    "topography.seaLevel": field(
      [topography.seaLevel],
      "f64",
      "flat model relief datum; not metres",
      artifact(landformArtifacts.topography.id, "seaLevel")
    ),
    "topography.bathymetry": field(
      topography.bathymetry,
      "i16",
      "flat model depth units; not metres",
      artifact(landformArtifacts.topography.id, "bathymetry")
    ),
    "topography.landMask": field(
      topography.landMask,
      "u8",
      "0 model water / 1 model land; source geography in earth-coast, all water in aquaplanet",
      artifact(landformArtifacts.topography.id, "landMask")
    ),
    "shelf.shelfMask": field(
      shelf.shelfMask,
      "u8",
      "1 authored TERRAIN_COAST; not a physical shelf estimate",
      artifact(shelfArtifacts.shelf.id, "shelfMask")
    ),
    "shelf.coastalLand": field(
      shelf.coastalLand,
      "u8",
      "binary land-side coastal adjacency",
      artifact(shelfArtifacts.shelf.id, "coastalLand")
    ),
    "shelf.coastalWater": field(
      shelf.coastalWater,
      "u8",
      "binary water-side coastal adjacency",
      artifact(shelfArtifacts.shelf.id, "coastalWater")
    ),
    "shelf.distanceToCoast": field(
      shelf.distanceToCoast,
      "u16",
      "hex graph steps; 65535 unreachable",
      artifact(shelfArtifacts.shelf.id, "distanceToCoast")
    ),
    "thermalField.surfaceTemperatureC": field(
      thermal.surfaceTemperatureC,
      "f32",
      "degrees Celsius, annual mean before albedo feedback",
      artifact(climateArtifacts.thermalField.id, "surfaceTemperatureC")
    ),
    "baselineClimateField.rainfall": field(
      baseline.rainfall,
      "u8",
      rainfallUnits,
      artifact(climateArtifacts.baselineClimateField.id, "rainfall")
    ),
    "baselineClimateField.humidity": field(
      baseline.humidity,
      "u8",
      humidityUnits,
      artifact(climateArtifacts.baselineClimateField.id, "humidity")
    ),
    "baselineClimateField.potentialDemand": field(
      baseline.potentialDemand,
      "f32",
      "mean seasonal empirical PET in rainfall-index units on original land, zero on source water; not open-water evaporation",
      artifact(climateArtifacts.baselineClimateField.id, "potentialDemand")
    ),
    "pressureField.pressure": field(
      pressure.pressure,
      "f32",
      pressureUnits,
      artifact(climateArtifacts.pressureField.id, "pressure")
    ),
    "windField.windU": field(
      wind.windU,
      "i8",
      vectorUnits,
      artifact(climateArtifacts.windField.id, "windU")
    ),
    "windField.windV": field(
      wind.windV,
      "i8",
      vectorUnits,
      artifact(climateArtifacts.windField.id, "windV")
    ),
  };
  for (const member of ["currentU", "currentV"] as const) {
    fields[`currentField.${member}`] = field(
      observation.currentField[member],
      "i8",
      vectorUnits,
      observed(`currentField.${member}`)
    );
  }
  for (const member of ["rainfallAmplitude", "humidityAmplitude"] as const) {
    fields[`seasonalAmplitudes.${member}`] = field(
      observation.seasonalAmplitudes[member],
      "u8",
      "half seasonal range in the corresponding moisture-index units",
      observed(`seasonalAmplitudes.${member}`)
    );
  }
  for (const [member, storage, units] of [
    ["seasonalRainfall", "u8", rainfallUnits],
    ["seasonalHumidity", "u8", humidityUnits],
    ["seasonalSurfaceTemperatureC", "f32", "degrees Celsius, final seasonal ground thermal sample"],
    ["seasonalPressure", "f32", pressureUnits],
    ["seasonalWindU", "i8", vectorUnits],
    ["seasonalWindV", "i8", vectorUnits],
    ["seasonalCurrentU", "i8", vectorUnits],
    ["seasonalCurrentV", "i8", vectorUnits],
  ] as const) {
    observation[member].forEach((values, season) => {
      fields[`${member}.${season}`] = field(
        values,
        storage,
        units,
        observed(`${member}[${season}]`)
      );
    });
  }
  if (observation.oceanGeometry) {
    for (const [member, storage, units] of [
      ["basinId", "i32", "source-water connectivity label; not a marine certificate"],
      ["coastDistance", "u16", "hex graph steps on source water"],
      ["coastNormalU", "i8", "quantized advisory coast-normal component"],
      ["coastNormalV", "i8", "quantized advisory coast-normal component"],
      ["coastTangentU", "i8", "quantized advisory coast-tangent component"],
      ["coastTangentV", "i8", "quantized advisory coast-tangent component"],
    ] as const) {
      fields[`oceanGeometry.${member}`] = field(
        observation.oceanGeometry[member],
        storage,
        units,
        observed(`oceanGeometry.${member}`)
      );
    }
  }
  if (observation.oceanThermal) {
    fields["oceanThermal.sstC"] = field(
      observation.oceanThermal.sstC,
      "f32",
      "degrees Celsius; authoritative over every source-water cell, including enclosed water",
      observed("oceanThermal.sstC")
    );
    fields["oceanThermal.seaIceMask"] = field(
      observation.oceanThermal.seaIceMask,
      "u8",
      "binary model source-water ice mask",
      observed("oceanThermal.seaIceMask")
    );
  }
  {
    for (const [member, storage, units] of [
      ["rainfall", "u8", rainfallUnits], ["humidity", "u8", humidityUnits],
      ["potentialDemand", "f64", "empirical PET in rainfall-index units; not open-water evaporation"],
      ["surfaceTemperatureC", "f32", "degrees Celsius, sampled ground response"],
      ["pressure", "f32", pressureUnits],
      ["windU", "i8", vectorUnits], ["windV", "i8", vectorUnits],
      ["currentU", "i8", vectorUnits], ["currentV", "i8", vectorUnits],
    ] as const) {
      integration[member].forEach((values, phase) => {
        fields[`seasonalIntegration.${member}.${phase}`] = field(
          values, storage, units, observed(`seasonalIntegration.${member}[${phase}]`)
        );
      });
    }
  }
  {
    for (const member of ["annualUnclippedSurfaceTemperatureC", "annualClippingDeltaC"] as const) {
      fields[`thermalResponse.${member}`] = field(
        observation.thermalResponse[member], "f32", "degrees Celsius", observed(`thermalResponse.${member}`)
      );
    }
  }
  return {
    format: "earth-coast-flat-relief-baseline-capture-v2",
    arm: run.arm,
    source: earthReference.provenance,
    sourcePayloadSha256: sha256(JSON.stringify(earthReference)),
    registration: {
      source: earthReference.grid,
      target: {
        width: earthReference.grid.width,
        height: earthReference.grid.height,
        rowZero: "north",
        wrapX: true,
        wrapY: false,
        adjacency: "odd-row-offset",
        indexing: "y * width + x",
      },
      transform: "y' = 65 - y; x' = (x + (y & 1)) % 106",
      longitude: "unqualified; no geographic longitude correspondence claimed",
      latitude: "+90/-90 declared bounds; solar geometry retains exact poles; circulation frames retain their own polar clamp",
    },
    semantics: {
      relief:
        "Elevation, sea level and bathymetry are zero; no native height conversion or metre claim.",
      water:
        "Every source-water cell receives SST, including enclosed water. No marine qualification.",
      shelf:
        "Authored TERRAIN_COAST mask; adjacency and distance derived by actual Morphology operations.",
      aquaplanet:
        "Removes land and authored shelf; holds setup, normalized forcing and flat relief.",
      temperature: "thermalField is the independently dense-integrated clipped annual ground response; no refinement/albedo feedback.",
      aggregation: "Atmosphere/moisture use the recorded integration phases and weights, not the observation subset; thermal has an independent dense integral. Integer domains round after weighted reduction.",
      scope:
        "Baseline-only test composition; no coupled drainage, biomes, empirical Earth accuracy or native parity claim.",
      seasonSamples:
        "Step-returned samples after transient-member aggregation; not every internal solver iterate.",
      unavailable: ["pre-clamp thermal phase samples"],
    },
    sampling: {
      model: integration.model,
      phaseOrigin: integration.phaseOrigin,
      phases: [...integration.phases],
      weights: [...integration.weights],
      observationIndices: [...integration.observationIndices],
    },
    initialSetup: run.initial,
    setup: run.setup,
    authoredMapConfig: run.mapConfig,
    compiledConfigs: { climateBaseline: run.config, coasts: run.coastConfigs },
    demandParameters: baseline.demandParameters,
    hashing: {
      algorithm: "SHA-256",
      encoding:
        "native typed-array bytes reconstructed from numeric JSON values; scalar seaLevel is f64[1]",
      byteOrder: endianness(),
    },
    inputsUnchanged: isDeepStrictEqual({ topography, shelf, config: run.config }, run.heldInputs),
    fields,
    summary: {
      landCells: topography.landMask.reduce((sum, value) => sum + value, 0),
      modelWaterCells: topography.landMask.reduce((sum, value) => sum + (value === 0 ? 1 : 0), 0),
      surfaceTemperatureC: summary(thermal.surfaceTemperatureC),
      rainfall: summary(baseline.rainfall),
      humidity: summary(baseline.humidity),
      potentialDemand: summary(baseline.potentialDemand),
      pressure: summary(pressure.pressure),
    },
  };
}

function sourceIdentity() {
  const pluginRoot = resolve(import.meta.dir, "../../../../..");
  const collect = (directory: string): string[] =>
    readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory()
        ? collect(join(directory, entry.name))
        : /\.(ts|json)$/.test(entry.name)
          ? [join(directory, entry.name)]
          : []
    );
  const files = [
    ...collect(join(pluginRoot, "src")),
    ...collect(import.meta.dir),
    resolve(import.meta.dir, "../standard-recipe.ts"),
    join(pluginRoot, "test/setup.ts"),
  ]
    .sort()
    .map((path) => ({ path: relative(pluginRoot, path), sha256: sha256(readFileSync(path)) }));
  return { files, sha256: sha256(JSON.stringify(files)) };
}

/** Creates new evidence only. An existing output directory is never reused or overwritten. */
export function writeEarthCoastBaselineCapture(outputDirectory: string) {
  const output = resolve(outputDirectory);
  mkdirSync(output);
  const startedAt = new Date().toISOString();
  const sourceBefore = sourceIdentity();
  const results = [];
  for (const arm of ["earth-coast", "aquaplanet"] as const) {
    const first = captureEarthCoastBaseline(runEarthCoastBaseline(arm));
    const repeat = captureEarthCoastBaseline(runEarthCoastBaseline(arm));
    const files = [first, repeat].map((capture, index) => {
      const name = `${arm}${index === 1 ? "-repeat" : ""}.json`;
      const bytes = json(capture);
      writeFileSync(join(output, name), bytes, { flag: "wx" });
      return { name, sha256: sha256(bytes) };
    });
    const matches = Object.fromEntries(
      Object.keys(first.fields).map((key) => [
        key,
        first.fields[key]!.sha256 === repeat.fields[key]?.sha256,
      ])
    );
    results.push({
      arm,
      files,
      exactRepeat: isDeepStrictEqual(first, repeat),
      repeatedFieldHashes: matches,
      inputsUnchanged: first.inputsUnchanged && repeat.inputsUnchanged,
      summary: first.summary,
    });
  }
  const sourceAfter = sourceIdentity();
  const waterComponents = sourceWaterComponents();
  const receipt = {
    format: "earth-coast-flat-relief-baseline-receipt-v1",
    startedAt,
    completedAt: new Date().toISOString(),
    runtime: { bun: Bun.version, platform: process.platform, architecture: process.arch },
    composition:
      "test-owned actual ClimateBaselineStep + actual domain ops; public compile; validated topography/shelf publication",
    sourceBefore,
    sourceAfterSha256: sourceAfter.sha256,
    sourceStable: sourceBefore.sha256 === sourceAfter.sha256,
    sourceWaterReference: {
      largestComponentCells: waterComponents[0]!.length,
      enclosedCells: waterComponents.slice(1).reduce((sum, cells) => sum + cells.length, 0),
      enclosedComponents: waterComponents.length - 1,
    },
    results,
  };
  writeFileSync(join(output, "receipt.json"), json(receipt), { flag: "wx" });
  return receipt;
}

if (import.meta.main) {
  const output = process.argv[2];
  if (!output || process.argv.length !== 3)
    throw new Error("Usage: bun capture.ts <new-output-directory>");
  const receipt = writeEarthCoastBaselineCapture(output);
  console.log(
    json({
      output: resolve(output),
      sourceStable: receipt.sourceStable,
      results: receipt.results.map(({ arm, exactRepeat, inputsUnchanged, summary }) => ({
        arm,
        exactRepeat,
        inputsUnchanged,
        summary,
      })),
    })
  );
  if (
    !receipt.sourceStable ||
    receipt.results.some((result) => !result.exactRepeat || !result.inputsUnchanged)
  )
    process.exitCode = 1;
}
