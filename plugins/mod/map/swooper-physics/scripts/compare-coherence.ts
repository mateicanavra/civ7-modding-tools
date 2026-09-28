import { createHash } from "node:crypto";
import { closeSync, openSync, writeSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { format, parseArgs } from "node:util";
import { evaluateMetricTargets } from "@swooper/mapgen-metrics";
import { admitStandardMapConfig, canonicalMapConfigDigest, type StandardMapConfigEnvelope } from "../src/maps/configs/canonical.js";
import { captureStandardMapScenario, type StandardMapCapture } from "../src/recipes/standard/metrics/capture.js";
import { measureStandardMapCapture } from "../src/recipes/standard/metrics/sample.js";
import { STANDARD_INTEGRITY_TARGET } from "../src/recipes/standard/metrics/targets/integrity.js";
import { requireShippedStandardConfig } from "../src/recipes/standard/metrics/studies/define.js";
import { STANDARD_METRIC_PRESETS, standardMetricScenarioIdentity, standardProductMetricScenario } from "../src/recipes/standard/metrics/studies/scenarios.js";
import { renderCoherenceViewer, type CoherenceViewData } from "./coherence-viewer.js";

type Mutation = Readonly<{ path: readonly string[]; value: string | number }>;
type Variant = Readonly<{ id: string; label: string; kind: "baseline" | "single-factor" | "interaction"; changes: readonly Mutation[] }>;
const erosion = ["morphology-erosion", "geomorphology", "geomorphology", "config"];
const age: Mutation = { path: [...erosion, "worldAge"], value: "mature" };
const intensity: Mutation = { path: ["morphology-erosion", "knobs", "erosion"], value: "normal" };
const eras: Mutation = { path: [...erosion, "geomorphology", "eras"], value: 3 };

/** Fixed one-factor probes plus one explicitly labeled interaction, never tuned passing targets. */
export const COHERENCE_VARIANTS: readonly Variant[] = [
  { id: "baseline", label: "Shipped Earthlike", kind: "baseline", changes: [] },
  { id: "mature-age", label: "Mature age only", kind: "single-factor", changes: [age] },
  { id: "normal-erosion", label: "Normal erosion only", kind: "single-factor", changes: [intensity] },
  { id: "three-eras", label: "Three eras only", kind: "single-factor", changes: [eras] },
  { id: "sparse-rivers", label: "Sparse rivers only", kind: "single-factor", changes: [{ path: ["hydrology-hydrography", "knobs", "riverDensity"], value: "sparse" }] },
  { id: "major-percentile", label: "Major percentile 0.96", kind: "single-factor", changes: [{ path: ["hydrology-hydrography", "projectRiverNetwork", "config", "majorPercentile"], value: 0.96 }] },
  { id: "fluvial-zero", label: "Fluvial rate zero", kind: "single-factor", changes: [{ path: [...erosion, "geomorphology", "fluvial", "rate"], value: 0 }] },
  { id: "diffusion-zero", label: "Diffusion rate zero", kind: "single-factor", changes: [{ path: [...erosion, "geomorphology", "diffusion", "rate"], value: 0 }] },
  { id: "crust-texture-half", label: "Half crust texture", kind: "single-factor", changes: [{ path: ["morphology-coasts", "landmass-plates", "baseTopography", "config", "crustNoiseAmplitude"], value: 0.18 }] },
  { id: "combined", label: "Mature + normal + three eras", kind: "interaction", changes: [age, intensity, eras] },
];

/** Applies only declared existing config leaves, then re-admits the complete public envelope. */
export function createCoherenceConfiguration(base: StandardMapConfigEnvelope, variant: Variant): StandardMapConfigEnvelope {
  const candidate = structuredClone(base);
  for (const change of variant.changes) {
    let value: unknown = candidate.config;
    for (const part of change.path.slice(0, -1)) {
      if (!value || typeof value !== "object" || !(part in value)) throw new Error(`Missing authored config path: ${change.path.join(".")}`);
      value = (value as Record<string, unknown>)[part];
    }
    const key = change.path.at(-1);
    if (!key || !value || typeof value !== "object" || !(key in value)) throw new Error(`Missing authored config leaf: ${change.path.join(".")}`);
    (value as Record<string, unknown>)[key] = change.value;
  }
  return admitStandardMapConfig(candidate);
}

/** Validates explicit experiment selection while retaining its requested ordering. */
export function selectCoherenceVariants(raw: string | undefined): readonly Variant[] {
  if (raw === undefined) return COHERENCE_VARIANTS;
  const ids = raw.split(",").map((id) => id.trim());
  if (new Set(ids).size !== ids.length) throw new Error("--variants contains duplicate IDs");
  return ids.map((id) => {
    const variant = COHERENCE_VARIANTS.find((entry) => entry.id === id);
    if (!variant) throw new Error(`Unknown variant ${JSON.stringify(id)}; choose ${COHERENCE_VARIANTS.map((v) => v.id).join(",")}`);
    return variant;
  });
}

function json(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) => ArrayBuffer.isView(item) && !(item instanceof DataView) ? Array.from(item as unknown as ArrayLike<number>) : item, 2);
}

function digest(value: ArrayBufferView): string {
  return createHash("sha256").update(new Uint8Array(value.buffer, value.byteOffset, value.byteLength)).digest("hex");
}

function errorRecord(error: unknown): unknown {
  return error instanceof Error ? { name: error.name, message: error.message, cause: error.cause === undefined ? null : errorRecord(error.cause) } : error;
}

function captureWithLog(scenario: Parameters<typeof captureStandardMapScenario>[0], path: string): StandardMapCapture {
  const fd = openSync(path, "w");
  const originals = { log: console.log, info: console.info, warn: console.warn, error: console.error, debug: console.debug };
  try {
    for (const method of Object.keys(originals) as Array<keyof typeof originals>) {
      console[method] = (...args: unknown[]) => { writeSync(fd, `[${method}] ${format(...args)}\n`); };
    }
    return captureStandardMapScenario(scenario);
  } finally {
    Object.assign(console, originals);
    closeSync(fd);
  }
}

/** Separates completed generation from integrity and required physical-hold verification. */
export function verifyCoherenceRecords(records: Array<Record<string, unknown>>): boolean {
  const baseline = records.find((record) => record.id === "baseline" && record.status === "complete");
  const hashes = baseline?.hashes as Record<string, string> | undefined;
  for (const record of records) {
    if (record.status !== "complete") {
      record.verification = { status: "fail", reasons: ["Generation failed"] };
      continue;
    }
    const actual = record.hashes as Record<string, string>;
    const expectedHeldFields = record.id === "sparse-rivers" || record.id === "major-percentile"
      ? ["elevation", "flowDir", "lakeMask", "discharge", "waterSurface", "landMask", "seaLevel"] : [];
    const heldFieldsMatch = hashes !== undefined && expectedHeldFields.every((field) => typeof actual[field] === "string" && actual[field] === hashes[field]);
    record.baselineComparison = hashes === undefined
      ? { status: "unavailable", reason: "No completed baseline was selected", expectedHeldFields }
      : { status: "compared", unchanged: Object.fromEntries(Object.keys(actual).map((field) => [field, actual[field] === hashes[field]])), expectedHeldFields, heldFieldsMatch };
    const targets = record.integrity as Array<{ status: string }> | undefined;
    const integrity = !targets?.length ? "unavailable" : targets.every((target) => target.status === "pass") ? "pass" : "fail";
    const holds = expectedHeldFields.length === 0 ? "not-required" : hashes === undefined ? "unavailable" : heldFieldsMatch ? "pass" : "fail";
    const reasons = [
      ...(integrity === "pass" ? [] : [`Integrity ${integrity}`]),
      ...(holds === "fail" ? [`Required physical fields changed or missing: ${expectedHeldFields.filter((field) => typeof actual[field] !== "string" || actual[field] !== hashes?.[field]).join(", ")}`] : []),
      ...(holds === "unavailable" ? ["Required baseline hold comparison unavailable"] : []),
    ];
    record.verification = { status: integrity === "fail" || holds === "fail" ? "fail" : reasons.length ? "unavailable" : "pass", integrity, holds, reasons };
  }
  return records.length > 0 && records.every((record) => (record.verification as { status: string }).status === "pass");
}

function viewData(capture: StandardMapCapture): CoherenceViewData {
  const { model, provenance } = capture;
  const hydro = model.physicalHydrology;
  if (hydro.model !== "certified-sill-spill") throw new Error("Coherence comparison requires certified-sill-spill evidence");
  return {
    width: provenance.width, height: provenance.height, seaLevel: model.seaLevel,
    elevation: Array.from(model.elevation), land: Array.from(model.landMask), wet: Array.from(model.plannedLakeMask),
    mountain: Array.from(model.mountainMask), hill: Array.from(model.hillMask), volcano: Array.from(model.volcanoMask),
    river: Array.from(model.riverClass), receiver: Array.from(model.flowDir), discharge: Array.from(hydro.discharge),
    bodyId: Array.from(hydro.bodyId), waterSurface: Array.from(hydro.waterSurface),
    bodies: hydro.bodies.map((body) => ({ id: body.nodeId, outlet: body.outletCell, receiver: body.receiverCell, surface: body.spillElevation, outflow: body.outflow, wetTiles: body.wetCells.length })),
  };
}

/** Runs complete portable scenarios once each and publishes both successes and failed candidates. */
export async function runCoherenceComparison(argv: string[]): Promise<number> {
  const { values } = parseArgs({ args: argv, options: { seed: { type: "string", default: "1018" }, size: { type: "string", default: "huge" }, output: { type: "string" }, variants: { type: "string" }, help: { type: "boolean" } }, strict: true, allowPositionals: false });
  if (values.help) {
    console.log("bun scripts/compare-coherence.ts --output <directory> [--seed 1018] [--size standard|huge] [--variants baseline,sparse-rivers]\n" + COHERENCE_VARIANTS.map((v) => `${v.id}: ${v.label} (${v.kind})`).join("\n"));
    return 0;
  }
  const seed = Number(values.seed);
  if (!/^-?\d+$/.test(values.seed!) || !Number.isInteger(seed) || seed < -2147483648 || seed > 2147483647) throw new Error("--seed must be a signed 32-bit integer");
  if (values.size !== "standard" && values.size !== "huge") throw new Error("--size must be standard or huge");
  if (!values.output?.trim()) throw new Error("--output is required and names the exact output directory");
  const output = resolve(values.output);
  const variants = selectCoherenceVariants(values.variants);
  const base = requireShippedStandardConfig("swooper-earthlike");
  const preset = STANDARD_METRIC_PRESETS[values.size];
  const records: Array<Record<string, unknown>> = [];
  const views: Array<{ id: string; label: string; kind: string; data: CoherenceViewData }> = [];
  const startedAt = new Date().toISOString();
  await mkdir(output, { recursive: true });
  for (const variant of variants) {
    let config: StandardMapConfigEnvelope | undefined;
    let scenario: ReturnType<typeof standardProductMetricScenario> | undefined;
    try {
      config = createCoherenceConfiguration(base, variant);
      const identity = standardMetricScenarioIdentity(preset, seed, seed);
      scenario = standardProductMetricScenario(config, preset, identity);
      scenario = { ...scenario, id: `${scenario.id}/experiment-${variant.id}` };
      const capture = captureWithLog(scenario, resolve(output, `${variant.id}.log`));
      const sample = measureStandardMapCapture(capture);
      const integrity = evaluateMetricTargets(sample, [STANDARD_INTEGRITY_TARGET]);
      const networkCoherence = sample.metrics.hydrology.networkCoherence;
      const data = viewData(capture);
      await writeFile(resolve(output, `${variant.id}.data.json`), json(data));
      const hashes = {
        elevation: digest(capture.model.elevation), flowDir: digest(capture.model.flowDir), lakeMask: digest(capture.model.plannedLakeMask), riverClass: digest(capture.model.riverClass),
        discharge: digest(Float64Array.from(data.discharge)), waterSurface: digest(Int16Array.from(data.waterSurface)),
        landMask: digest(capture.model.landMask), seaLevel: digest(new Float64Array([capture.model.seaLevel])),
        mountainMask: digest(capture.model.mountainMask), hillMask: digest(capture.model.hillMask), foothillMask: digest(capture.model.foothillMask), roughLandMask: digest(capture.model.roughLandMask), volcanoMask: digest(capture.model.volcanoMask),
      };
      records.push({ ...variant, status: "complete", config, configurationDigest: canonicalMapConfigDigest(config), scenario, provenance: capture.provenance, hashes, integrity, metrics: sample.metrics, networkCoherence, dataFile: `${variant.id}.data.json`, logFile: `${variant.id}.log` });
      views.push({ ...variant, data });
      console.log(JSON.stringify({ variant: variant.id, status: "complete", hashes }));
    } catch (error) {
      records.push({ ...variant, status: "failed", config: config ?? null, scenario: scenario ?? null, logFile: `${variant.id}.log`, error: errorRecord(error) });
      console.error(JSON.stringify({ variant: variant.id, status: "failed", error: errorRecord(error) }));
    }
    // Publish after each variant so interruption cannot erase earlier failures or successes.
    const verified = verifyCoherenceRecords(records);
    await writeFile(resolve(output, "comparison.json"), json({ evidence: "portable-generated-not-native", verification: verified ? "pass" : "fail", startedAt, seed, size: preset.id, requestedVariants: variants.map((v) => v.id), variants: records }));
  }
  await writeFile(resolve(output, "index.html"), renderCoherenceViewer({ seed, size: preset.id, variants: views, records }));
  const verified = verifyCoherenceRecords(records);
  console.log(JSON.stringify({ output, viewer: resolve(output, "index.html"), complete: views.length, failed: records.length - views.length, verification: verified ? "pass" : "fail" }));
  return verified ? 0 : 1;
}

if (import.meta.main) {
  try { process.exitCode = await runCoherenceComparison(process.argv.slice(2)); }
  catch (error) { console.error(json(errorRecord(error))); process.exitCode = 1; }
}
