import { repoRoot } from "@habitat/cli/resources/paths";
import { runSourceRulesEffect } from "@habitat/cli/service/model/source-check/index";
import { Effect } from "effect";
import { describe, expect, test } from "vitest";

describe("source-check rule execution", () => {
  test("refuses native source rules without exact path coverage", async () => {
    const results = await Effect.runPromise(
      runSourceRulesEffect(
        [
          {
            id: "adapter-base-standard-import",
            lane: "enforced",
            message: "test rule",
            patternName: "adapter_base_standard_import",
            pathCoverage: [{ kind: "project-owner" }],
            scanRoots: ["tools/habitat/src/providers/grit"],
          },
        ],
        { repoRoot }
      )
    );

    expect(results.get("adapter-base-standard-import")).toMatchObject({
      exitCode: 1,
      diagnostics: [
        {
          ruleId: "adapter-base-standard-import",
          path: ".habitat/tooling/components/legacy-source-check/rules/adapter-base-standard-import.rule.mjs",
          message:
            "Source-check rules must declare exact path coverage before native source execution.",
          severity: "error",
          baselined: false,
        },
      ],
    });
  });
});
