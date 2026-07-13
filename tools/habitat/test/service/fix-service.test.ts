import type { RuleFixPlanningDemand } from "@habitat/cli/resources/rule-fix-planning/index";
import { fixRouter } from "@habitat/cli/service/modules/fix/router";
import { habitatServiceRouter } from "@habitat/cli/service/router";
import { createRouterClient } from "@orpc/server";
import { Effect } from "effect";
import { withFiberContext } from "effect-orpc/node";
import { describe, expect, test, vi } from "vitest";
import { makeTestHabitatServiceDeps } from "../support/habitat-service-deps";

describe("Habitat fix service", () => {
  test("renders ordered no-write observations from the stable planning capability", async () => {
    const plan = vi.fn((_demand: RuleFixPlanningDemand) =>
      Effect.succeed({
        kind: "completed" as const,
        results: [
          { kind: "observed" as const, ruleId: "second", affectedPaths: ["b.ts"] },
          { kind: "observed" as const, ruleId: "first", affectedPaths: [] },
        ],
      })
    );
    const result = await Effect.runPromise(
      runFixProcedure(
        {
          rules: ["second", "first", "second"],
        },
        plan
      )
    );

    expect(plan).toHaveBeenCalledWith({ ruleIds: ["second", "first", "second"] });
    expect(result).toEqual({
      exitCode: 0,
      stdout: "[second] affected paths\n- b.ts\n[first] no affected paths\n",
      stderr: "",
    });
  });

  test("routes omitted selection through the in-process Habitat service router", async () => {
    const plan = vi.fn((_demand: RuleFixPlanningDemand) =>
      Effect.succeed({ kind: "completed" as const, results: [] })
    );
    const client = createRouterClient(habitatServiceRouter, {
      context: {
        deps: makeTestHabitatServiceDeps({
          ruleFixPlanning: { plan },
        }),
      },
    });

    const result = await client.fix.planPatterns({});

    expect(plan).toHaveBeenCalledWith({});
    expect(result).toEqual({
      exitCode: 0,
      stdout: "No registered rules admit fix planning.\n",
      stderr: "",
    });
  });

  test("renders atomic selection refusal without partial observations", async () => {
    const result = await Effect.runPromise(
      runFixProcedure({ rules: ["known", "missing"] }, () =>
        Effect.succeed({
          kind: "selection-refused" as const,
          unknownRuleIds: ["missing"],
          unadmittedRuleIds: ["known"],
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
    const plan = vi.fn(() => Effect.succeed({ kind: "completed" as const, results: [] }));

    await expect(Effect.runPromise(runFixProcedure({ rules: [] }, plan))).rejects.toThrow();
    expect(plan).not.toHaveBeenCalled();
  });
});

function runFixProcedure(
  input: { readonly rules?: string[] },
  plan: ReturnType<typeof makeTestHabitatServiceDeps>["ruleFixPlanning"]["plan"]
) {
  const planPatterns = fixRouter.planPatterns.callable({
    context: { deps: makeTestHabitatServiceDeps({ ruleFixPlanning: { plan } }) },
  });
  return withFiberContext(() => planPatterns(input));
}
