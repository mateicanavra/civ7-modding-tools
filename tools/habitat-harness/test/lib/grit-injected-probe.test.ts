import { existsSync, mkdirSync, rmdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterAll, afterEach, describe, expect, test } from "vitest";
import { injectedProbeRoot, runGritRules } from "../../src/lib/grit.js";
import {
  type InjectedProbeScope,
  runInjectedGritProbe,
} from "../../src/lib/grit-injected-probe.js";
import {
  type HabitatProcessRequest,
  makeFakeHabitatProcessLayer,
  makeHabitatCommandResult,
  type OutputCapture,
} from "../../src/lib/habitat-process.js";
import { repoRoot } from "../../src/lib/paths.js";
import type { RuleGritFacts } from "../../src/rules/registry/index.js";

const rule = fakeGritRule("grit-adapter-base-standard-import", "adapter_base_standard_import");
const probePath = "packages/config/src/__habitat_probe__/matching.ts";
const controlPath = "packages/config/src/__habitat_probe__/control.ts";

afterEach(removeEmptyInjectedProbeRoot);
afterAll(removeEmptyInjectedProbeRoot);

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
      scope: {
        ...scope(),
        scanRoots: ["mods/mod-swooper-maps/src/maps"],
        matchingProbePath: generatedProbe,
      },
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
      removeEmptyInjectedProbeRoot();
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
      removeEmptyInjectedProbeRoot();
    }
  });

  test("expands test-scoped mirror probes to exact files without dropping the mirror root", async () => {
    const mirrorRoot = `${injectedProbeRoot}/__habitat_probe_test_scope__`;
    const matchingPath = `${mirrorRoot}/mods/mod-swooper-maps/test/domain/public-surface.test.ts`;
    const controlPath = `${mirrorRoot}/mods/mod-swooper-maps/test/domain/public-surface-control.test.ts`;
    const absoluteRoot = path.join(repoRoot, mirrorRoot);
    const testRule = fakeGritRule("grit-domain-deep-import-tests", "domain_deep_import_tests", {
      message: "test files must use public domain surfaces",
      scanRoots: [mirrorRoot],
      expandIgnoredTestDirectories: true,
    });
    let observedRequest: HabitatProcessRequest | undefined;
    const fakeLayer = makeFakeHabitatProcessLayer((request) => {
      observedRequest = request;
      return makeHabitatCommandResult(request, {
        stderr: output(
          JSON.stringify({
            paths: [matchingPath],
            results: [
              {
                local_name: "domain_deep_import_tests",
                path: matchingPath,
                start: { line: 1 },
                extra: { message: "test deep import" },
              },
            ],
          })
        ),
      });
    });

    rmSync(absoluteRoot, { recursive: true, force: true });
    mkdirSync(absoluteRoot, { recursive: true });

    try {
      const result = await runInjectedGritProbe({
        ruleId: testRule.id,
        patternIdentity: "domain_deep_import_tests",
        probePath: matchingPath,
        probeBody:
          'import { privateRule } from "@mapgen/domain/ecology/rules/private.js";\n\nexport const value = privateRule;\n',
        controlPath,
        controlBody:
          'import ecology from "@mapgen/domain/ecology/ops";\n\nexport const value = ecology;\n',
        expectedDiagnostic: "test deep import",
        scope: {
          adapterRoot: mirrorRoot,
          rulesJsonScope: "mods/mod-swooper-maps/test/**/*.{ts,tsx}, packages/*/test/**/*.{ts,tsx}",
          sourcePredicate: "test imports or re-exports domain deep internals",
          scanRoots: [mirrorRoot],
          exclusions: [],
          matchingProbePath: matchingPath,
          outsideScopeControlPath: controlPath,
        },
        registry: [testRule],
        processLayer: fakeLayer,
      });

      expect(result.ok).toBe(true);
      expect(observedRequest?.scanRoots).toContain(mirrorRoot);
      expect(observedRequest?.scanRoots).toContain(matchingPath);
      expect(observedRequest?.scanRoots).toContain(controlPath);
      expect(result.ok && result.diagnostics[0]?.path).toBe(matchingPath);
    } finally {
      rmSync(absoluteRoot, { recursive: true, force: true });
      removeEmptyInjectedProbeRoot();
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

function fakeGritRule(
  id: string,
  pattern: string,
  overrides: Partial<RuleGritFacts> = {}
): RuleGritFacts {
  return {
    id,
    gritPattern: pattern,
    lane: "enforced",
    message: "test rule",
    scanRoots: ["packages/config/src"],
    ...overrides,
  };
}

function removeEmptyInjectedProbeRoot(): void {
  try {
    rmdirSync(path.join(repoRoot, injectedProbeRoot));
  } catch (error) {
    if (
      typeof error !== "object" ||
      error === null ||
      !("code" in error) ||
      (error.code !== "ENOENT" && error.code !== "ENOTEMPTY")
    ) {
      throw error;
    }
  }
}
