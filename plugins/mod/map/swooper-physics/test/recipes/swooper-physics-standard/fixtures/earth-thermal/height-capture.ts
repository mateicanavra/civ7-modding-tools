import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import reference from "./noaa-land-thermal.json";
import { heightStudyProtocol, runEarthHeightStudy } from "./height-study.js";

const fixtureDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(fixtureDirectory, "../../../../..");
const repositoryDirectory = resolve(projectDirectory, "../../../..");
const hash = (bytes: string | Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const json = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
const typedHash = (value: ArrayBufferView) => hash(new Uint8Array(value.buffer, value.byteOffset, value.byteLength));

async function sourceManifest() {
  const paths = new Set([
    ...["height-study.ts", "height-capture.ts", "production-harmonics.ts", "response-harmonics.ts", "solar-geometry.ts"].map((name) => join(fixtureDirectory, name)),
    join(projectDirectory, "test/recipes/swooper-physics-standard/stages/hydrology/earth-height-reference.test.ts"),
    join(projectDirectory, "src/domain/hydrology/modules/climate/model/policy/earth-periodic-response.ts"),
    join(projectDirectory, "src/domain/hydrology/modules/climate/model/atoms/solar-harmonics.schema.ts"),
    join(projectDirectory, "package.json"), join(repositoryDirectory, "bun.lock"),
  ]);
  for (const pattern of [
    "plugins/mod/map/swooper-physics/src/domain/hydrology/modules/climate/ops/compute-{thermal-state,radiative-forcing}/**/*.ts",
    "packages/mapgen-core/src/**/*.ts", "packages/mapgen-core/dist/**/*.js",
  ]) {
    for await (const path of new Bun.Glob(pattern).scan(repositoryDirectory)) paths.add(join(repositoryDirectory, path));
  }
  const result = [];
  for (const path of [...paths].sort()) {
    const bytes = await readFile(path);
    result.push({ path: relative(repositoryDirectory, path), bytes: bytes.length, sha256: hash(bytes) });
  }
  return result;
}

/** Explicit external destination only; each rerun gets a new directory and never overwrites evidence. */
export async function captureEarthHeightStudy(outputRoot: string) {
  const root = resolve(outputRoot);
  const relativeRoot = relative(repositoryDirectory, root);
  if (!relativeRoot || (!isAbsolute(relativeRoot) && relativeRoot !== ".." && !relativeRoot.startsWith(`..${sep}`))) {
    throw new Error("Height evidence must be written outside the repository.");
  }
  const fixtureBytes = await readFile(join(fixtureDirectory, "noaa-land-thermal.json"));
  if (hash(fixtureBytes) !== heightStudyProtocol.referenceSha256) throw new Error("Frozen full-land fixture changed.");
  const before = await sourceManifest();
  const study = runEarthHeightStudy(reference.samples);
  const { numericalEvidence, covariance } = study.summary;
  const tolerance = heightStudyProtocol.float32BudgetC;
  if (numericalEvidence.some((arm) => arm.maxAnnualClippingDeltaC !== 0 || !arm.seaLevelPressureInputsExact ||
    arm.conservativeMinC <= -120 + tolerance || arm.conservativeMaxC >= 120 - tolerance || arm.maxAnnualCalendarDifferenceC > tolerance) ||
    [covariance.maxAnnualDeltaC, covariance.maxMonthlyDeltaC, covariance.maxSampleDeltaC].some((value) => !Number.isFinite(value) || value > covariance.roundingBoundC + tolerance)) {
    throw new Error("Height diagnostic numerical controls failed; do not publish an accuracy report.");
  }
  const configs = { solar: study.solarConfig, thermal: study.arms.map((arm) => ({ arm: arm.id, config: arm.config })) };
  const inputs = {
    width: 1, height: reference.samples.length, seaLevel: heightStudyProtocol.seaLevel,
    axialTiltDeg: study.solarInput.axialTiltDeg,
    latitudeByRowSha256: typedHash(study.solarInput.latitudeByRow),
    solarByRowSha256: hash(json(study.solar.solarByRow)),
    phases: study.arms[0]!.input.phases, weights: study.arms[0]!.input.weights,
    fields: study.arms.map((arm) => ({ arm: arm.id, elevationSha256: typedHash(arm.input.elevation), landMaskSha256: typedHash(arm.input.landMask), sstSha256: typedHash(arm.input.sstC) })),
  };
  const after = await sourceManifest();
  if (hash(json(before)) !== hash(json(after))) throw new Error("Numerical source changed during the capture.");
  const report = json(study.summary);
  const createdAt = new Date().toISOString();
  const receipt = {
    schemaVersion: 1, createdAt,
    command: "bun test/recipes/swooper-physics-standard/fixtures/earth-thermal/height-capture.ts <external-output-root>",
    runtime: { bun: Bun.version, platform: process.platform, architecture: process.arch },
    reference: { file: "noaa-land-thermal.json", bytes: fixtureBytes.length, sha256: hash(fixtureBytes), sources: reference.sources, cohorts: reference.cohorts },
    sourceIdentityScope: "The two executed numerical operations, their solar atom/thermal policy, test diagnostic/calendar helpers and test, full Core source/public JS runtime, package and lockfile. No whole-worktree or climate/native pipeline claim.",
    sourceStable: true, sourceManifestSha256: hash(json(before)), sourceDigests: before,
    configs, configsSha256: hash(json(configs)), inputs, inputsSha256: hash(json(inputs)),
    report: { file: "report.json", bytes: report.length, sha256: hash(report) },
    verification: "Numerical encoding, clipping, annual reconstruction and sea-level pressure-input controls passed. Error summaries are diagnostic, not climate-accuracy acceptance gates or independent validation.",
  };
  await mkdir(root, { recursive: true });
  const outputDirectory = join(root, `run-${createdAt.replaceAll(":", "-")}`);
  await mkdir(outputDirectory);
  await writeFile(join(outputDirectory, "report.json"), report, { flag: "wx" });
  const receiptBytes = json(receipt);
  await writeFile(join(outputDirectory, "receipt.json"), receiptBytes, { flag: "wx" });
  return { outputDirectory, receiptSha256: hash(receiptBytes), summary: study.summary };
}

if (import.meta.main) {
  const destination = process.argv[2];
  if (!destination) throw new Error("Provide an explicit external output directory.");
  const { summary, ...receipt } = await captureEarthHeightStudy(destination);
  console.log(JSON.stringify({ ...receipt, numericalEvidence: summary.numericalEvidence, covariance: summary.covariance,
    allLandErrors: summary.cohorts.filter((cohort) => cohort.group === "all") }, null, 2));
}
