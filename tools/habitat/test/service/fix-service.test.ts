import type { RuleFixPreviewDemand } from "@habitat/cli/resources/rule-fix-preview/index";
import { fixRouter } from "@habitat/cli/service/modules/fix/router";
import { habitatServiceRouter } from "@habitat/cli/service/router";
import { createRouterClient } from "@orpc/server";
import { Effect } from "effect";
import { withFiberContext } from "effect-orpc/node";
import { describe, expect, test, vi } from "vitest";
import { makeTestHabitatServiceDeps } from "../support/habitat-service-deps";

describe("Habitat fix service", () => {
  test("renders ordered no-write observations from the stable preview capability", async () => {
    const preview = vi.fn((_demand: RuleFixPreviewDemand) =>
      Effect.succeed({
        kind: "completed" as const,
        results: [
          {
            kind: "previewed" as const,
            ruleId: "second",
            impacts: [{ kind: "modify" as const, path: "b.ts" }],
          },
          { kind: "previewed" as const, ruleId: "first", impacts: [] },
        ],
      })
    );
    const result = await Effect.runPromise(
      runFixProcedure(
        {
          rules: ["second", "first", "second"],
        },
        preview
      )
    );

    expect(preview).toHaveBeenCalledWith({ ruleIds: ["second", "first", "second"] });
    expect(result).toEqual({
      exitCode: 0,
      stdout: "[second] file impacts\n- modify b.ts\n[first] no file impacts\n",
      stderr: "",
    });
  });

  test("routes omitted selection through the in-process Habitat service router", async () => {
    const preview = vi.fn((_demand: RuleFixPreviewDemand) =>
      Effect.succeed({ kind: "completed" as const, results: [] })
    );
    const client = createRouterClient(habitatServiceRouter, {
      context: {
        deps: makeTestHabitatServiceDeps({
          ruleFixPreview: { preview },
        }),
      },
    });

    const result = await client.fix.previewPatterns({});

    expect(preview).toHaveBeenCalledWith({});
    expect(result).toEqual({
      exitCode: 0,
      stdout: "No registered rules admit fix preview.\n",
      stderr: "",
    });
  });

  test("renders atomic selection refusal without partial observations", async () => {
    const result = await Effect.runPromise(
      runFixProcedure({ rules: ["known", "missing"] }, () =>
        Effect.succeed({
          kind: "selection-refused" as const,
          refusals: [
            { ruleId: "missing", reason: "unknown" as const },
            { ruleId: "known", reason: "fix-not-admitted" as const },
          ],
        })
      )
    );

    expect(result).toEqual({
      exitCode: 1,
      stdout: "",
      stderr:
        "habitat fix refused: invalid-rule-selection\nunknown rule ids: missing\nrules without fix admission: known\n",
    });
  });

  test("rejects an explicitly empty rule selection at the service boundary", async () => {
    const preview = vi.fn(() => Effect.succeed({ kind: "completed" as const, results: [] }));

    await expect(Effect.runPromise(runFixProcedure({ rules: [] }, preview))).rejects.toThrow();
    expect(preview).not.toHaveBeenCalled();
  });
});

function runFixProcedure(
  input: { readonly rules?: string[] },
  preview: ReturnType<typeof makeTestHabitatServiceDeps>["ruleFixPreview"]["preview"]
) {
  const previewPatterns = fixRouter.previewPatterns.callable({
    context: { deps: makeTestHabitatServiceDeps({ ruleFixPreview: { preview } }) },
  });
  return withFiberContext(() => previewPatterns(input));
}
