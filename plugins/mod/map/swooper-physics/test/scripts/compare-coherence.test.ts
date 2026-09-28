import { describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { COHERENCE_VARIANTS, createCoherenceConfiguration, selectCoherenceVariants, verifyCoherenceRecords } from "../../scripts/compare-coherence.js";
import { coherenceSurfaceHeight, renderCoherenceViewer, type CoherenceViewData } from "../../scripts/coherence-viewer.js";
import { canonicalMapConfigDigest } from "../../src/maps/configs/canonical.js";
import { requireShippedStandardConfig } from "../../src/recipes/standard/metrics/studies/define.js";

function changedLeaves(a: unknown, b: unknown, prefix = ""): string[] {
  if (JSON.stringify(a) === JSON.stringify(b)) return [];
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return [prefix];
  const left = a as Record<string, unknown>, right = b as Record<string, unknown>;
  return [...new Set([...Object.keys(left), ...Object.keys(right)])].flatMap((key) => changedLeaves(left[key], right[key], prefix ? `${prefix}.${key}` : key));
}

describe("observational coherence comparison", () => {
  it("admits exactly the declared config differences without changing the shipped source", () => {
    const base = requireShippedStandardConfig("swooper-earthlike");
    const before = canonicalMapConfigDigest(base);
    expect(COHERENCE_VARIANTS).toHaveLength(10);
    for (const variant of COHERENCE_VARIANTS) {
      const candidate = createCoherenceConfiguration(base, variant);
      expect(changedLeaves(base, candidate).sort()).toEqual(variant.changes.map((change) => `config.${change.path.join(".")}`).sort());
      expect(canonicalMapConfigDigest(base)).toBe(before);
    }
  });

  it("refuses unknown, duplicate or empty variant selectors", () => {
    expect(selectCoherenceVariants("baseline,sparse-rivers").map((v) => v.id)).toEqual(["baseline", "sparse-rivers"]);
    for (const value of ["", "unknown", "baseline,baseline", "baseline,"]) expect(() => selectCoherenceVariants(value)).toThrow();
  });

  it("does not silently create misspelled config leaves", () => {
    expect(() => createCoherenceConfiguration(requireShippedStandardConfig("swooper-earthlike"), {
      id: "invalid", label: "Invalid", kind: "single-factor", changes: [{ path: ["morphology-erosion", "knobs", "erosoin"], value: "normal" }],
    })).toThrow("Missing authored config leaf");
  });

  it("emits a self-contained, syntactically valid viewer and safely embeds labels", () => {
    const empty = [0, 0, 0, 0, 0, 0];
    const data: CoherenceViewData = {
      width: 3, height: 2, seaLevel: 0, elevation: [1, 2, 3, 4, 5, 6], land: empty,
      wet: empty, mountain: empty, hill: empty, volcano: empty, river: empty, receiver: empty,
      discharge: empty, bodyId: empty, waterSurface: empty, bodies: [],
    };
    const html = renderCoherenceViewer({ seed: 1018, size: "MAPSIZE_HUGE", records: [], variants: [{ id: "baseline", label: "</script><bad>", kind: "baseline", data }] });
    expect(html).not.toContain("</script><bad>");
    expect(html).toContain("Portable generated evidence, not Civ7 readback");
    expect(html).not.toContain("fetch(");
    expect(html).toContain("ctx.fillText(String(surfaceHeight(d,i))");
    expect(html).toContain('"  surface "+surfaceHeight(d,i)');
    const script = html.split("<script>")[1]?.split("</script>")[0];
    expect(script).toBeDefined();
    expect(() => new Function(script!)).not.toThrow();
  });

  it("distinguishes marine sea level, lake surface, and dry ground in the inspector", () => {
    const data = { land: [0, 1, 1], wet: [0, 1, 0], seaLevel: 4, waterSurface: [0, 15, 0], elevation: [-25, 10, 30] };
    expect([0, 1, 2].map((cell) => coherenceSurfaceHeight(data, cell))).toEqual([4, 15, 30]);
  });

  it("fails unavailable hold evidence without prohibiting observed landform changes", () => {
    const physical = Object.fromEntries(["elevation", "flowDir", "lakeMask", "discharge", "waterSurface", "landMask", "seaLevel"].map((field) => [field, "unchanged"]));
    const baseline = { id: "baseline", status: "complete", hashes: { ...physical, mountainMask: "before" }, integrity: [{ status: "pass" }] };
    const candidate = { id: "sparse-rivers", status: "complete", hashes: { ...physical, mountainMask: "after" }, integrity: [{ status: "pass" }] };
    expect(verifyCoherenceRecords([baseline, candidate])).toBe(true);
    expect(candidate).toMatchObject({ status: "complete", verification: { status: "pass" }, baselineComparison: { unchanged: { mountainMask: false } } });
    expect(verifyCoherenceRecords([candidate])).toBe(false);
    expect(candidate).toMatchObject({ verification: { status: "unavailable", holds: "unavailable" } });
  });

  it("returns nonzero for failed integrity or physical holds while retaining generated records", () => {
    const packageRoot = resolve(import.meta.dir, "../..");
    for (const failure of ["integrity", "discharge", "waterSurface"]) {
      const output = mkdtempSync(join(tmpdir(), "civ7-coherence-verification-"));
      try {
        const source = `import { mock } from "bun:test";
          const engine = await import("@swooper/mapgen-metrics");
          mock.module("@swooper/mapgen-metrics", () => ({ ...engine, evaluateMetricTargets: () => [{ status: ${JSON.stringify(failure === "integrity" ? "fail" : "pass")} }] }));
          let call = 0;
          mock.module(${JSON.stringify(resolve(packageRoot, "src/recipes/standard/metrics/capture.ts"))}, () => ({
            captureStandardMapScenario() {
              const changed = call++ > 0;
              return { provenance: { width: 2, height: 1 }, model: {
                seaLevel: 0, elevation: new Int16Array([10, -10]), flowDir: new Int32Array([1, -1]),
                landMask: new Uint8Array([1, 0]), plannedLakeMask: new Uint8Array(2), riverClass: new Uint8Array([2, 0]),
                mountainMask: new Uint8Array(2), hillMask: new Uint8Array(2), foothillMask: new Uint8Array(2), roughLandMask: new Uint8Array(2), volcanoMask: new Uint8Array(2),
                physicalHydrology: { model: "certified-sill-spill", discharge: [changed && ${JSON.stringify(failure)} === "discharge" ? 2 : 1, 0],
                  bodyId: new Int32Array(2), waterSurface: new Int16Array([changed && ${JSON.stringify(failure)} === "waterSurface" ? 11 : 10, 0]), bodies: [] }
              } };
            }
          }));
          mock.module(${JSON.stringify(resolve(packageRoot, "src/recipes/standard/metrics/sample.ts"))}, () => ({ measureStandardMapCapture: () => ({ metrics: { hydrology: { networkCoherence: null } } }) }));
          const { runCoherenceComparison } = await import(${JSON.stringify(resolve(packageRoot, "scripts/compare-coherence.ts"))});
          process.exitCode = await runCoherenceComparison(["--variants", "baseline,sparse-rivers", "--output", ${JSON.stringify(output)}]);`;
        const result = spawnSync(process.execPath, ["-e", source], { cwd: packageRoot, encoding: "utf8" });
        expect(result.status, result.stderr).toBe(1);
        const report = JSON.parse(readFileSync(join(output, "comparison.json"), "utf8"));
        expect(report.verification).toBe("fail");
        expect(report.variants.map((record: { status: string }) => record.status)).toEqual(["complete", "complete"]);
        expect(report.variants[1].verification.status).toBe("fail");
        expect(report.variants[1].verification[failure === "integrity" ? "integrity" : "holds"]).toBe("fail");
        expect(Object.keys(report.variants[1].hashes)).toEqual(expect.arrayContaining(["discharge", "waterSurface", "mountainMask", "hillMask", "foothillMask", "roughLandMask", "volcanoMask"]));
        const html = readFileSync(join(output, "index.html"), "utf8");
        expect(html).toContain('"Generation","Verification"');
        expect(html).toContain('verification!=="pass"');
      } finally {
        rmSync(output, { recursive: true, force: true });
      }
    }
  });

  it("retains each failed candidate and its capture log, restores console, and exits nonzero", () => {
    const output = mkdtempSync(join(tmpdir(), "civ7-coherence-failure-"));
    const packageRoot = resolve(import.meta.dir, "../..");
    try {
      const source = `import { mock } from "bun:test";
        mock.module(${JSON.stringify(resolve(packageRoot, "src/recipes/standard/metrics/capture.ts"))}, () => ({
          captureStandardMapScenario() {
            console.log("capture stdout"); console.warn("capture warning");
            throw new Error("fixture generation refused", { cause: { witness: "fixture" } });
          }
        }));
        const { runCoherenceComparison } = await import(${JSON.stringify(resolve(packageRoot, "scripts/compare-coherence.ts"))});
        process.exitCode = await runCoherenceComparison(["--variants", "baseline,sparse-rivers", "--output", ${JSON.stringify(output)}]);
        console.log("console restored");`;
      const result = spawnSync(process.execPath, ["-e", source], { cwd: packageRoot, encoding: "utf8" });
      expect(result.status).toBe(1);
      expect(result.stdout).toContain("console restored");
      expect(result.stdout).not.toContain("capture stdout");
      const report = JSON.parse(readFileSync(join(output, "comparison.json"), "utf8"));
      expect(report.variants.map((record: { status: string }) => record.status)).toEqual(["failed", "failed"]);
      expect(report.variants[0].error.cause).toEqual({ witness: "fixture" });
      for (const id of ["baseline", "sparse-rivers"]) {
        const log = readFileSync(join(output, `${id}.log`), "utf8");
        expect(log).toContain("[log] capture stdout");
        expect(log).toContain("[warn] capture warning");
      }
      expect(readFileSync(join(output, "index.html"), "utf8")).toContain("No variant completed");
    } finally {
      rmSync(output, { recursive: true, force: true });
    }
  });
});
