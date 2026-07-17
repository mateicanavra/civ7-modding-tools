import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Effect, Match } from "effect";
import { describe, it } from "vitest";
import {
  parseStandaloneCheckInvocation,
  StandaloneCheckFailure,
} from "../../src/standalone/check/model.js";
import { runStandaloneCheck } from "../../src/standalone/check/runtime.js";

const repoRoot = path.resolve(fileURLToPath(new URL("../../../..", import.meta.url)));

describe("standalone Habitat check edge", () => {
  it("admits only the read-only check command and supported runners", async () => {
    const invocation = await Effect.runPromise(
      parseStandaloneCheckInvocation([
        "check",
        "--repo-root",
        repoRoot,
        "--runner",
        "grit",
        "--rule",
        "first",
        "--rule",
        "second",
      ])
    );
    assert.strictEqual(invocation.kind, "check");
    const request = Match.value(invocation).pipe(
      Match.when({ kind: "check" }, (check) => check.request),
      Match.orElse(() => assert.fail("expected a check invocation"))
    );
    assert.strictEqual(request.repoRoot, repoRoot);
    assert.strictEqual(request.runner, "grit");
    assert.deepStrictEqual(request.rules, ["first", "second"]);

    const failureEffect = parseStandaloneCheckInvocation(["check", "--runner", "nx"]).pipe(
      Effect.flip
    );
    const failure = await Effect.runPromise(failureEffect);
    assert.ok(failure instanceof StandaloneCheckFailure);
    assert.strictEqual(failure.kind, "unsupported-selection");
  });

  it("refuses mutation commands before runtime construction", async () => {
    const failureEffect = parseStandaloneCheckInvocation(["fix"]).pipe(Effect.flip);
    const failure = await Effect.runPromise(failureEffect);
    assert.strictEqual(failure.kind, "invalid-arguments");
  });

  it("runs a real structure rule without Oclif or Nx", async () => {
    const report = await Effect.runPromise(
      runStandaloneCheck({
        argv: [
          "check",
          "--repo-root",
          repoRoot,
          "--rule",
          "validate_habitat_service_module_root_topology",
          "--json",
        ],
        repoRoot,
        json: true,
        rules: ["validate_habitat_service_module_root_topology"],
        staged: false,
        baselineIntegrity: false,
        base: "main",
      })
    );
    assert.ok(report.ok);
    assert.strictEqual(report.rules.length, 1);
    assert.strictEqual(report.rules[0]?.ruleId, "validate_habitat_service_module_root_topology");
    assert.strictEqual(report.rules[0]?.status, "pass");
  });

  it("refuses an Nx-backed rule before provider execution", async () => {
    const failureEffect = runStandaloneCheck({
      argv: ["check", "--repo-root", repoRoot, "--rule", "enforce_workspace_import_boundaries"],
      repoRoot,
      json: false,
      rules: ["enforce_workspace_import_boundaries"],
      staged: false,
      baselineIntegrity: false,
      base: "main",
    }).pipe(Effect.flip);
    const failure = await Effect.runPromise(failureEffect);
    assert.strictEqual(failure.kind, "unsupported-selection");
  });
});
