import type { CheckOptions } from "@internal/habitat-harness/service/model/check/index";
import type { StructuralCheckService } from "@internal/habitat-harness/service/model/check/policy/structural/index";
import type { RuleSelection } from "@internal/habitat-harness/service/model/rules/policy/selection.policy";
import { checkRouter } from "@internal/habitat-harness/service/modules/check/router";
import { Effect } from "effect";
import { withFiberContext } from "effect-orpc/node";
import { describe, expect, test } from "vitest";
import { makeTestHabitatServiceDeps } from "../support/habitat-service-deps";

const mockReport = {
  schemaVersion: 1,
  command: "habitat check --json",
  startedAt: "2026-06-20T00:00:00.000Z",
  ok: true,
  rules: [],
} as const;

describe("Habitat check service", () => {
  test("runs owned check orchestration from service input", async () => {
    const observed: CheckOptions[] = [];
    const structuralCheck: StructuralCheckService = {
      createReport: (options) =>
        Effect.sync(() => {
          observed.push(options ?? {});
          return mockReport;
        }),
      expandBaselines: () => Effect.succeed({ ok: true, messages: [] }),
    };
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const runCheck = checkRouter.run.callable({
          context: { deps: makeTestHabitatServiceDeps({ structuralCheck }) },
        });
        return yield* withFiberContext(() =>
          runCheck({
            selectors: { rule: "format-ci", tool: "biome" },
            baselineIntegrity: true,
            base: "origin/main",
            staged: true,
            stagedPaths: ["tools/habitat-harness/src/cli/commands/check.ts"],
          })
        );
      })
    );

    expect(result).toBe(mockReport);
    expect(observed).toEqual([
      {
        rule: "format-ci",
        tool: "biome",
        base: "origin/main",
        baselineIntegrity: true,
        command: {
          bin: "habitat",
          id: "check",
          argv: [],
          serialized: "habitat check",
        },
        staged: true,
        stagedPaths: ["tools/habitat-harness/src/cli/commands/check.ts"],
      },
    ]);
  });

  test("projects baseline expansion into service output states", async () => {
    const observed: Array<{ selection: RuleSelection; options: { base?: string } }> = [];
    let expansion = { ok: true as const, messages: ["baseline written: rule-a (1 entries)"] };
    const structuralCheck: StructuralCheckService = {
      createReport: () => Effect.succeed(mockReport),
      expandBaselines: (selection = {}, options = {}) =>
        Effect.sync(() => {
          observed.push({ selection, options });
          return expansion;
        }),
    };

    const expanded = await Effect.runPromise(
      Effect.gen(function* () {
        const expandBaseline = checkRouter.expandBaseline.callable({
          context: { deps: makeTestHabitatServiceDeps({ structuralCheck }) },
        });
        return yield* withFiberContext(() =>
          expandBaseline({
            selectors: { owner: "tools-habitat-harness" },
            base: "main",
          })
        );
      })
    );

    expect(expanded).toEqual({
      kind: "expanded",
      messages: ["baseline written: rule-a (1 entries)"],
    });
    expect(observed).toEqual([
      { selection: { owner: "tools-habitat-harness" }, options: { base: "main" } },
    ]);

    expansion = {
      ok: false,
      requested: { rule: "missing-rule" },
      reason: "unknown-selector",
      selectorFacts: [],
      message: 'Unknown Habitat rule id: "missing-rule".',
    };

    const refused = await Effect.runPromise(
      Effect.gen(function* () {
        const expandBaseline = checkRouter.expandBaseline.callable({
          context: { deps: makeTestHabitatServiceDeps({ structuralCheck }) },
        });
        return yield* withFiberContext(() =>
          expandBaseline({
            selectors: { rule: "missing-rule" },
          })
        );
      })
    );

    expect(refused).toEqual({
      kind: "refused",
      message: 'Unknown Habitat rule id: "missing-rule".',
    });
  });
});
