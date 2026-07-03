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
  test("reports missing implementations for retired native source rules", async () => {
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
          path: ".habitat/_support/execution/source-check/adapters/enforce_adapter_only_base_standard_imports.rule.mjs",
          message: expect.stringContaining(
            "No repo source-check implementation is registered for enforce_adapter_only_base_standard_imports."
          ),
          severity: "error",
          baselined: false,
        },
      ],
    });
  });
});
