import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { earthThermalReference as reference } from "./reference.js";
import { dailyMeanSolar, integrateDailySolar, integrateGlobalDailySolar, solarGeometrySource } from "./solar-geometry.js";
import { runSolarStudy, solarStudyProtocol } from "./solar-study.js";

const fixtureDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(fixtureDirectory, "../../../../..");
const repositoryDirectory = resolve(projectDirectory, "../../../..");
const defaultOutput = "/Users/mateicanavra/Library/Application Support/Civ7Tools/VisualAtlas/huge-1018/earth-calibration/solar-geometry-20260929";

function sha256(bytes: string | Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function listFiles(directory: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await listFiles(path));
    else if (entry.isFile()) result.push(path);
  }
  return result.sort();
}

async function fileDigest(path: string) {
  const bytes = await readFile(path);
  return { path: relative(repositoryDirectory, path), bytes: bytes.length, sha256: sha256(bytes) };
}

async function capture(outputRoot: string) {
  const createdAt = new Date().toISOString();
  const fixtureBytes = await readFile(join(fixtureDirectory, "noaa-low-relief-land.json"));
  if (sha256(fixtureBytes) !== solarStudyProtocol.referenceFixtureSha256) {
    throw new Error("Frozen NOAA cohort changed; refuse to silently update this study.");
  }
  const response = await fetch(solarGeometrySource.url);
  if (!response.ok) throw new Error(`FAO source fetch failed: ${response.status}`);
  const sourceBytes = new Uint8Array(await response.arrayBuffer());
  if (sourceBytes.length !== solarGeometrySource.bytes || sha256(sourceBytes) !== solarGeometrySource.sha256) {
    throw new Error("FAO source differs from verified freeze; review provenance before recapturing.");
  }
  const sourcePaths = [
    ...await listFiles(join(projectDirectory, "src/domain/hydrology")),
    ...await listFiles(join(repositoryDirectory, "packages/mapgen-core/dist")),
    ...await listFiles(fixtureDirectory),
    join(projectDirectory, "test/recipes/swooper-physics-standard/stages/hydrology/earth-solar-geometry.test.ts"),
    join(projectDirectory, "package.json"),
    join(repositoryDirectory, "packages/mapgen-core/package.json"),
    join(repositoryDirectory, "bun.lock"),
  ];
  const sourceDigests = [];
  for (const path of sourcePaths.sort()) sourceDigests.push(await fileDigest(path));
  const results = runSolarStudy();
  const qualification = {
    equinoxEquator: dailyMeanSolar(0, 0),
    globalMean: [-90, -70, -23.44, 0, 23.44, 70, 90].map((declinationDegrees) => ({
      declinationDegrees, fluxOverSolarConstant: integrateGlobalDailySolar(declinationDegrees), expected: 0.25,
    })),
    independentDailyIntegration: [-90, -66.560001, -66.56, -66.559999, -45, 0, 45, 66.559999, 66.56, 66.560001, 90].flatMap((latitudeDegrees) =>
      [-23.44, 0, 23.44].map((declinationDegrees) => ({
        latitudeDegrees, declinationDegrees,
        analytic: dailyMeanSolar(latitudeDegrees, declinationDegrees).fluxOverSolarConstant,
        integrated: integrateDailySolar(latitudeDegrees, declinationDegrees),
      }))
    ),
  };
  const summary = results.map(({ samples: _samples, ...result }) => result);
  const summaryBytes = `${JSON.stringify({ protocol: solarStudyProtocol, qualification, results: summary }, null, 2)}\n`;
  const samplesBytes = `${JSON.stringify(results.map(({ id, samples }) => ({ id, samples })))}\n`;
  const sourceManifest = `${JSON.stringify(sourceDigests, null, 2)}\n`;
  const artifacts = [
    { name: "fao-56-chapter-3.html", bytes: sourceBytes },
    { name: "noaa-low-relief-land.json", bytes: fixtureBytes },
    { name: "summary.json", bytes: Buffer.from(summaryBytes) },
    { name: "samples.json", bytes: Buffer.from(samplesBytes) },
    { name: "source-digests.json", bytes: Buffer.from(sourceManifest) },
  ];
  const receipt = {
    schemaVersion: 1, createdAt, repositoryDirectory,
    runtime: { executable: process.execPath, bun: Bun.version, versions: process.versions, platform: process.platform, architecture: process.arch },
    command: "bun plugins/mod/map/swooper-physics/test/recipes/swooper-physics-standard/fixtures/earth-thermal/solar-capture.ts [output-root]",
    solarSource: solarGeometrySource,
    noaaSources: reference.sources,
    protocol: solarStudyProtocol,
    sourceDigestManifestSha256: sha256(sourceManifest),
    resolvedRuntime: {
      mapgenTesting: import.meta.resolve("@swooper/mapgen-core/testing"),
      mapgenAuthoring: import.meta.resolve("@swooper/mapgen-core/authoring"),
    },
    files: artifacts.map(({ name, bytes }) => ({ name, bytes: bytes.length, sha256: sha256(bytes) })),
    verification: {
      kind: "numerical evidence capture, not a substitute for the Bun test or TypeScript check",
      testCommand: "bun test plugins/mod/map/swooper-physics/test/recipes/swooper-physics-standard/stages/hydrology/earth-solar-geometry.test.ts",
      sourceManifestScope: "hydrology source, built mapgen-core runtime, all reference fixtures, owning test, manifests and lockfile; no Git state inferred",
    },
  };
  await mkdir(outputRoot, { recursive: true });
  const outputDirectory = join(outputRoot, `run-${createdAt.replaceAll(":", "-")}`);
  // Exclusive directory and files: a capture never replaces a prior receipt, even on timestamp collision.
  await mkdir(outputDirectory);
  for (const { name, bytes } of artifacts) await writeFile(join(outputDirectory, name), bytes, { flag: "wx" });
  await writeFile(join(outputDirectory, "receipt.json"), `${JSON.stringify(receipt, null, 2)}\n`, { flag: "wx" });
  console.log(JSON.stringify({ outputDirectory, receiptSha256: sha256(await readFile(join(outputDirectory, "receipt.json"))), cases: results.length }, null, 2));
}

if (import.meta.main) await capture(resolve(process.argv[2] ?? defaultOutput));
