import { NodeContext } from "@effect/platform-node";
import { repoRoot } from "@habitat/cli/resources/paths";
import {
  isDirectory,
  isFile,
  readDirectory,
  readText,
} from "@habitat/cli/resources/platform/index";
import { runSourceRulesEffect } from "@habitat/cli/service/model/source-check/index";
import { Effect } from "effect";
import { describe, expect, test } from "vitest";

describe("source-check rule execution", () => {
  test("refuses native source rules without exact path coverage", async () => {
    const results = await Effect.runPromise(
      runSourceRulesEffect(
        [
          {
            id: "enforce_adapter_only_base_standard_imports",
            lane: "enforced",
            message: "test rule",
            patternName: "adapter_base_standard_import",
            pathCoverage: [{ kind: "project-owner" }],
            scanRoots: ["tools/habitat/src/providers/grit"],
          },
        ],
        {
          fileSystem: { isDirectory, isFile, readDirectory, readText },
          repoRoot,
        }
      ).pipe(Effect.provide(NodeContext.layer))
    );

    expect(results.get("enforce_adapter_only_base_standard_imports")).toMatchObject({
      exitCode: 1,
      diagnostics: [
        {
          ruleId: "enforce_adapter_only_base_standard_imports",
          path: ".habitat/tooling/components/preserve_legacy_source_check_runtime_during_cutover/rules/enforce_adapter_only_base_standard_imports.rule.mjs",
          message:
            "Source-check rules must declare exact path coverage before native source execution.",
          severity: "error",
          baselined: false,
        },
      ],
    });
  });
});
