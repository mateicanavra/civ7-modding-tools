import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { runInjectedGritProbe, type InjectedProbeScope } from "../../src/lib/grit-injected-probe.js";
import { injectedProbeRoot, runGritRules } from "../../src/lib/grit.js";
import {
  makeFakeHabitatProcessLayer,
  makeHabitatCommandResult,
  type HabitatProcessRequest,
  type OutputCapture,
} from "../../src/lib/habitat-process.js";
import { repoRoot } from "../../src/lib/paths.js";
import type { HarnessRule } from "../../src/rules/architecture.js";

const rule = fakeGritRule("grit-adapter-base-standard-import", "adapter_base_standard_import");
const probePath = "packages/config/src/__habitat_probe__/matching.ts";
const controlPath = "packages/config/src/__habitat_probe__/control.ts";

describe("injected Grit probe harness", () => {
  test("creates scoped probe files, runs the adapter, asserts exact projection, and cleans up", async () => {
    let observedRequest: HabitatProcessRequest | undefined;
    const fakeLayer = makeFakeHabitatProcessLayer((request) => {
      observedRequest = request;
      return makeHabitatCommandResult(request, {
        stderr: output(
          JSON.stringify({
            paths: [probePath],
            results: [
              {
                local_name: "adapter_base_standard_import",
                path: probePath,
                start: { line: 1 },
                extra: { message: "base-standard probe" },
              },
            ],
          })
        ),
      });
    });

    const result = await runInjectedGritProbe({
      ruleId: rule.id,
      patternIdentity: "adapter_base_standard_import",
      probePath,
      probeBody: 'import "@civ7/adapter/base-standard/probe";\n',
      controlPath,
      controlBody: "export const control = true;\n",
      expectedDiagnostic: "base-standard probe",
      scope: scope(),
      registry: [rule],
      processLayer: fakeLayer,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(observedRequest?.scanRoots).toEqual(["packages/config/src"]);
    expect(result.diagnostics[0]).toMatchObject({
      ruleId: rule.id,
      path: probePath,
      baselined: false,
    });
    expect(result.cleanupRestoredStatus).toBe(true);
    expect(existsSync(path.join(repoRoot, probePath))).toBe(false);
    expect(existsSync(path.join(repoRoot, controlPath))).toBe(false);
  });

  test("refuses protected or non-approved probe paths before file creation", async () => {
    const generatedProbe = "mods/mod-swooper-maps/src/maps/generated/__habitat_probe.ts";
    const result = await runInjectedGritProbe({
      ruleId: rule.id,
      patternIdentity: "adapter_base_standard_import",
      probePath: generatedProbe,
      probeBody: "import '@civ7/adapter/base-standard/probe';\n",
      controlPath,
      controlBody: "export const control = true;\n",
      scope: { ...scope(), scanRoots: ["mods/mod-swooper-maps/src/maps"], matchingProbePath: generatedProbe },
      registry: [rule],
      processLayer: makeFakeHabitatProcessLayer((request) => makeHabitatCommandResult(request)),
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.failureTag).toBe("GritAdapterInternalContractViolation");
    expect(existsSync(path.join(repoRoot, generatedProbe))).toBe(false);
  });

  test("refuses source-shaped probe paths without a probe-owned segment", async () => {
    const sourceShapedProbe = "packages/config/src/source-shaped-probe.ts";
    const result = await runInjectedGritProbe({
      ruleId: rule.id,
      patternIdentity: "adapter_base_standard_import",
      probePath: sourceShapedProbe,
      probeBody: "import '@civ7/adapter/base-standard/probe';\n",
      controlPath,
      controlBody: "export const control = true;\n",
      scope: { ...scope(), matchingProbePath: sourceShapedProbe },
      registry: [rule],
      processLayer: makeFakeHabitatProcessLayer((request) => makeHabitatCommandResult(request)),
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.message).toContain("__habitat");
    expect(existsSync(path.join(repoRoot, sourceShapedProbe))).toBe(false);
  });

  test("creates and removes probe-owned nested parent directories", async () => {
    const nestedProbe = "packages/config/src/__habitat_probe_nested__/matching/probe.ts";
    const nestedControl = "packages/config/src/__habitat_probe_nested__/control/probe.ts";
    const fakeLayer = makeFakeHabitatProcessLayer((request) =>
      makeHabitatCommandResult(request, {
        stderr: output(
          JSON.stringify({
            paths: [nestedProbe],
            results: [
              {
                local_name: "adapter_base_standard_import",
                path: nestedProbe,
                start: { line: 1 },
                extra: { message: "base-standard probe" },
              },
            ],
          })
        ),
      })
    );

    const result = await runInjectedGritProbe({
      ruleId: rule.id,
      patternIdentity: "adapter_base_standard_import",
      probePath: nestedProbe,
      probeBody: 'import "@civ7/adapter/base-standard/probe";\n',
      controlPath: nestedControl,
      controlBody: "export const control = true;\n",
      expectedDiagnostic: "base-standard probe",
      scope: {
        ...scope(),
        matchingProbePath: nestedProbe,
        outsideScopeControlPath: nestedControl,
      },
      registry: [rule],
      processLayer: fakeLayer,
    });

    expect(result.ok).toBe(true);
    expect(existsSync(path.join(repoRoot, nestedProbe))).toBe(false);
    expect(existsSync(path.join(repoRoot, nestedControl))).toBe(false);
    expect(existsSync(path.join(repoRoot, "packages/config/src/__habitat_probe_nested__"))).toBe(
      false
    );
  });

  test("preserves pre-existing probe directories and sibling files during cleanup", async () => {
    const existingRoot = "packages/config/src/__habitat_probe_existing__";
    const sibling = `${existingRoot}/sibling.ts`;
    const nestedProbe = `${existingRoot}/matching/probe.ts`;
    const nestedControl = `${existingRoot}/control/probe.ts`;
    const absoluteRoot = path.join(repoRoot, existingRoot);
    rmSync(absoluteRoot, { recursive: true, force: true });
    mkdirSync(absoluteRoot, { recursive: true });
    writeFileSync(path.join(repoRoot, sibling), "export const sibling = true;\n");
    const fakeLayer = makeFakeHabitatProcessLayer((request) =>
      makeHabitatCommandResult(request, {
        stderr: output(
          JSON.stringify({
            paths: [nestedProbe],
            results: [
              {
                local_name: "adapter_base_standard_import",
                path: nestedProbe,
                start: { line: 1 },
                extra: { message: "base-standard probe" },
              },
            ],
          })
        ),
      })
    );

    try {
      const result = await runInjectedGritProbe({
        ruleId: rule.id,
        patternIdentity: "adapter_base_standard_import",
        probePath: nestedProbe,
        probeBody: 'import "@civ7/adapter/base-standard/probe";\n',
        controlPath: nestedControl,
        controlBody: "export const control = true;\n",
        expectedDiagnostic: "base-standard probe",
        scope: {
          ...scope(),
          matchingProbePath: nestedProbe,
          outsideScopeControlPath: nestedControl,
        },
        registry: [rule],
        processLayer: fakeLayer,
      });

      expect(result.ok).toBe(true);
      expect(existsSync(path.join(repoRoot, nestedProbe))).toBe(false);
      expect(existsSync(path.join(repoRoot, nestedControl))).toBe(false);
      expect(existsSync(path.join(repoRoot, sibling))).toBe(true);
      expect(existsSync(absoluteRoot)).toBe(true);
    } finally {
      rmSync(absoluteRoot, { recursive: true, force: true });
    }
  });

  test("supports probe-owned mirror roots for exact-path injected rows", async () => {
    const mirrorRoot = `${injectedProbeRoot}/__habitat_probe_exact_path__`;
    const matchingPath = `${mirrorRoot}/packages/sdk/src/index.ts`;
    const controlPath = `${mirrorRoot}/packages/sdk/src/mapgen/index.ts`;
    const absoluteRoot = path.join(repoRoot, mirrorRoot);
    rmSync(absoluteRoot, { recursive: true, force: true });
    mkdirSync(absoluteRoot, { recursive: true });
    const exactRule = fakeGritRule("grit-sdk-mapgen-entrypoint", "sdk_mapgen_entrypoint");
    const fakeLayer = makeFakeHabitatProcessLayer((request) =>
      makeHabitatCommandResult(request, {
        stderr: output(
          JSON.stringify({
            paths: [matchingPath],
            results: [
              {
                local_name: "sdk_mapgen_entrypoint",
                path: matchingPath,
                start: { line: 1 },
                extra: { message: "sdk mapgen entrypoint probe" },
              },
            ],
          })
        ),
      })
    );

    try {
      const result = await runInjectedGritProbe({
        ruleId: exactRule.id,
        patternIdentity: "sdk_mapgen_entrypoint",
        probePath: matchingPath,
        probeBody: 'export * from "./mapgen";\n',
        controlPath,
        controlBody:
          'import { createCiv7Adapter } from "@civ7/adapter/civ7";\nexport const adapter = createCiv7Adapter;\n',
        expectedDiagnostic: "sdk mapgen entrypoint probe",
        scope: {
          adapterRoot: mirrorRoot,
          rulesJsonScope: "packages/sdk/src/**/*.ts and packages/mapgen-core/src/**/*.ts",
          sourcePredicate: "SDK root mapgen export outside mapgen subpath",
          scanRoots: [mirrorRoot],
          exclusions: [],
          matchingProbePath: matchingPath,
          outsideScopeControlPath: controlPath,
        },
        registry: [exactRule],
        processLayer: fakeLayer,
      });

      expect(result.ok).toBe(true);
      expect(existsSync(path.join(repoRoot, matchingPath))).toBe(false);
      expect(existsSync(path.join(repoRoot, controlPath))).toBe(false);
      expect(existsSync(absoluteRoot)).toBe(true);
    } finally {
      rmSync(absoluteRoot, { recursive: true, force: true });
    }
  });

  test("does not approve probe mirror roots for ordinary Grit scans", async () => {
    const mirrorRoot = `${injectedProbeRoot}/__habitat_probe_public_reject__`;
    const absoluteRoot = path.join(repoRoot, mirrorRoot);
    rmSync(absoluteRoot, { recursive: true, force: true });
    mkdirSync(absoluteRoot, { recursive: true });

    try {
      const result = await runGritRules([rule], {
        scanRoots: [mirrorRoot],
        processLayer: makeFakeHabitatProcessLayer((request) => makeHabitatCommandResult(request)),
      });

      expect(result.get(rule.id)?.diagnostics[0]?.message).toContain("not approved");
    } finally {
      rmSync(absoluteRoot, { recursive: true, force: true });
    }
  });

  test("cleans up scoped probes when adapter execution fails", async () => {
    const fakeLayer = makeFakeHabitatProcessLayer((request) =>
      makeHabitatCommandResult(request, {
        stderr: output(`prefix {"paths":[],"results":[]} suffix`),
      })
    );

    const result = await runInjectedGritProbe({
      ruleId: rule.id,
      patternIdentity: "adapter_base_standard_import",
      probePath,
      probeBody: 'import "@civ7/adapter/base-standard/probe";\n',
      controlPath,
      controlBody: "export const control = true;\n",
      scope: scope(),
      registry: [rule],
      processLayer: fakeLayer,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.failureTag).toBe("GritMalformedJson");
    expect(existsSync(path.join(repoRoot, probePath))).toBe(false);
    expect(existsSync(path.join(repoRoot, controlPath))).toBe(false);
  });
});

function scope(): InjectedProbeScope {
  return {
    adapterRoot: "tools/habitat-harness/src/lib/grit.ts",
    rulesJsonScope: "packages/**/*.ts",
    sourcePredicate: "$filename outside packages/civ7-adapter",
    scanRoots: ["packages/config/src"],
    exclusions: ["packages/civ7-adapter/**"],
    matchingProbePath: probePath,
    outsideScopeControlPath: controlPath,
  };
}

function output(text: string): OutputCapture {
  return {
    text,
    truncated: false,
    sha256: "test",
    bytes: Buffer.byteLength(text, "utf8"),
  };
}

function fakeGritRule(id: string, pattern: string): HarnessRule {
  return {
    id,
    gritPattern: pattern,
    ownerTool: "grit-check",
    ownerProject: "@internal/habitat-harness",
    lane: "enforced",
    scope: "test",
    forbids: "test",
    why: "test",
    detect: ["habitat", "check", "--tool", "grit-check"],
    remediate: null,
    message: "test rule",
    exceptionPath: "none",
  };
}
