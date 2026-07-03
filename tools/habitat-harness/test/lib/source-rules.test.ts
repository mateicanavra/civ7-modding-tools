import { Effect } from "effect";
import { describe, expect, test } from "vitest";
import { runSourceRulesEffect } from "../../src/domains/source-check/index.js";

describe("source-check rule execution", () => {
  test("refuses native source rules without exact path coverage", async () => {
    const results = await Effect.runPromise(
      runSourceRulesEffect([
        {
          id: "adapter-base-standard-import",
          lane: "enforced",
          message: "test rule",
          patternName: "adapter_base_standard_import",
          pathCoverage: [{ kind: "project-owner" }],
          scanRoots: ["tools/habitat-harness/src/adapters/grit"],
        },
      ])
    );

    expect(results.get("adapter-base-standard-import")).toMatchObject({
      exitCode: 1,
      diagnostics: [
        {
          ruleId: "adapter-base-standard-import",
          path: "tools/habitat-harness/src/domains/source-check/rules/adapter-base-standard-import.mjs",
          message:
            "Source-check rules must declare exact path coverage before native source execution.",
          severity: "error",
          baselined: false,
        },
      ],
    });
  });
});
