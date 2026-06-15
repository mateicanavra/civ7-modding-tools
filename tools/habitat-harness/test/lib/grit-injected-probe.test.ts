import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { runInjectedGritProbe, type InjectedProbeScope } from "../../src/lib/grit-injected-probe.js";
import {
  makeFakeHabitatProcessLayer,
  makeHabitatCommandResult,
  type HabitatProcessRequest,
  type OutputCapture,
} from "../../src/lib/habitat-process.js";
import { repoRoot } from "../../src/lib/paths.js";
import type { HarnessRule } from "../../src/rules/architecture.js";

const rule = fakeGritRule("grit-adapter-base-standard-import", "adapter_base_standard_import");
const probePath = "packages/config/src/habitat-injected-probe.ts";
const controlPath = "packages/config/src/habitat-injected-control.ts";

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
    const generatedProbe = "mods/mod-swooper-maps/src/maps/generated/habitat-probe.ts";
    const result = await runInjectedGritProbe({
      ruleId: rule.id,
      patternIdentity: "adapter_base_standard_import",
      probePath: generatedProbe,
      probeBody: "import '@civ7/adapter/base-standard/probe';\n",
      controlPath,
      controlBody: "export const control = true;\n",
      scope: { ...scope(), scanRoots: ["packages/config/src"], matchingProbePath: generatedProbe },
      registry: [rule],
      processLayer: makeFakeHabitatProcessLayer((request) => makeHabitatCommandResult(request)),
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.failureTag).toBe("GritAdapterInternalContractViolation");
    expect(existsSync(path.join(repoRoot, generatedProbe))).toBe(false);
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
