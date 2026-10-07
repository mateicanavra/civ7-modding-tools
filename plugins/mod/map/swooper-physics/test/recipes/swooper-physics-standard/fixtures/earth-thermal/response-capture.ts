import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { earthMonthlyThermalReference as reference } from "./monthly-reference.js";
import { monthlySolarForcing, responseCalendar } from "./response-harmonics.js";
import { responsePaperSource, responseStudyProtocol, runResponseStudy } from "./response-study.js";
import { solarGeometrySource } from "./solar-geometry.js";

const fixtureDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(fixtureDirectory, "../../../../..");
const repositoryDirectory = resolve(projectDirectory, "../../../..");
const hash = (bytes: string | Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const json = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);

async function capture(outputRoot: string) {
  const createdAt = new Date().toISOString();
  const fixtureBytes = await readFile(join(fixtureDirectory, "monthly-low-relief-land.json"));
  if (hash(fixtureBytes) !== responseStudyProtocol.fixtureSha256) throw new Error("Frozen monthly cohort changed.");
  const externalSources = [];
  for (const [name, source] of [
    ["mckinnon-stine-huybers-2013.pdf", responsePaperSource],
    ["fao-56-chapter-3.html", solarGeometrySource],
  ] as const) {
    const response = await fetch(source.url);
    if (!response.ok) throw new Error(`Primary source fetch failed: ${response.status} ${source.url}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.length !== source.bytes || hash(bytes) !== source.sha256) throw new Error(`Primary source freeze changed: ${source.url}`);
    externalSources.push({ name, bytes });
  }
  // No production operations are imported. This identity deliberately excludes concurrently changing river code.
  const sourcePaths = [
    ...["response-harmonics.ts", "response-study.ts", "response-capture.ts", "response-study.md", "solar-geometry.ts", "monthly-reference.ts"]
      .map((name) => join(fixtureDirectory, name)),
    join(projectDirectory, "test/recipes/swooper-physics-standard/stages/hydrology/earth-thermal-response.test.ts"),
    join(projectDirectory, "package.json"),
    join(repositoryDirectory, "bun.lock"),
  ].sort();
  const sourceSnapshot = [];
  for (const path of sourcePaths) {
    const bytes = await readFile(path);
    sourceSnapshot.push({ path: relative(repositoryDirectory, path), bytes: bytes.length, sha256: hash(bytes), content: bytes.toString("utf8") });
  }
  const sourceDigests = sourceSnapshot.map(({ content: _content, ...entry }) => entry);
  const study = runResponseStudy();
  const { samples, ...summary } = study;
  const quadrature = [...new Set(reference.samples.map((sample) => sample.latitudeDegrees))].map((latitudeDegrees) => {
    const four = monthlySolarForcing(latitudeDegrees, 4);
    const eight = monthlySolarForcing(latitudeDegrees, 8);
    const sixteen = monthlySolarForcing(latitudeDegrees, 16);
    return { latitudeDegrees,
      max4Versus8Q: Math.max(...four.map((value, month) => Math.abs(value - eight[month]!))),
      max8Versus16Q: Math.max(...eight.map((value, month) => Math.abs(value - sixteen[month]!))),
    };
  });
  const coverage = (["train", "holdout", "all"] as const).map((split) => {
    const selected = samples.filter((sample) => split === "all" || sample.split === split);
    return { split, count: selected.length, northernCount: selected.filter((sample) => sample.latitudeDegrees >= 0).length,
      southernCount: selected.filter((sample) => sample.latitudeDegrees < 0).length,
      latitudeBounds: [Math.min(...selected.map((sample) => sample.latitudeDegrees)), Math.max(...selected.map((sample) => sample.latitudeDegrees))],
      longitudeDegreesEastBounds: [Math.min(...selected.map((sample) => sample.longitudeDegreesEast)), Math.max(...selected.map((sample) => sample.longitudeDegreesEast))] };
  });
  const periodicCoefficients = study.models.periodic.map((coefficient) => ({ ...coefficient,
    magnitudeCPerQ: Math.hypot(coefficient.real, coefficient.imaginary),
    lagDays: -Math.atan2(coefficient.imaginary, coefficient.real) * responseCalendar.meanYearDays / (2 * Math.PI * coefficient.harmonic),
  }));
  const artifacts = [
    ...externalSources,
    { name: "monthly-low-relief-land.json", bytes: fixtureBytes },
    { name: "summary.json", bytes: json({ ...summary, coverage, periodicCoefficients, quadrature }) },
    { name: "samples.json", bytes: json(samples) },
    { name: "source-digests.json", bytes: json(sourceDigests) },
    { name: "source-snapshot.json", bytes: json(sourceSnapshot) },
  ];
  const receipt = {
    schemaVersion: 1, createdAt, repositoryDirectory,
    runtime: { executable: process.execPath, bun: Bun.version, versions: process.versions, platform: process.platform, architecture: process.arch },
    command: "bun plugins/mod/map/swooper-physics/test/recipes/swooper-physics-standard/fixtures/earth-thermal/response-capture.ts <output-root>",
    primarySources: [responsePaperSource, solarGeometrySource],
    protocol: responseStudyProtocol,
    sourceIdentityScope: "Exact test-owned response imports, study note/test, package and lockfile. No production dependency or whole-worktree stability claim.",
    sourceDigestManifestSha256: hash(json(sourceDigests)),
    files: artifacts.map(({ name, bytes }) => ({ name, bytes: bytes.length, sha256: hash(bytes) })),
    verification: "Numerical evidence capture, not a substitute for focused tests or type checking. Monthly predictions are unclipped; bounds do not qualify continuous phase extrema.",
  };
  await mkdir(outputRoot, { recursive: true });
  const outputDirectory = join(outputRoot, `run-${createdAt.replaceAll(":", "-")}`);
  await mkdir(outputDirectory);
  for (const { name, bytes } of artifacts) await writeFile(join(outputDirectory, name), bytes, { flag: "wx" });
  const receiptBytes = json(receipt);
  await writeFile(join(outputDirectory, "receipt.json"), receiptBytes, { flag: "wx" });
  console.log(JSON.stringify({ outputDirectory, receiptSha256: hash(receiptBytes), samples: samples.length }, null, 2));
}

if (import.meta.main) {
  const outputRoot = process.argv[2];
  if (!outputRoot) throw new Error("Usage: bun response-capture.ts <output-root>");
  await capture(resolve(outputRoot));
}
