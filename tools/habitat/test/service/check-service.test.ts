import { repoRoot } from "@habitat/cli/resources/paths";
import type { CheckOptions, CheckReport } from "@habitat/cli/service/model/check/index";
import type { createCheckReportEffect } from "@habitat/cli/service/model/check/policy/structural/index";
import type { RuleSelection } from "@habitat/cli/service/model/rules/policy/selection.policy";
import type {
  BaselineExpansionResult,
  expandBaselinesEffect,
} from "@habitat/cli/service/modules/check/model/policy/baseline-expansion.policy";
import { checkRouter } from "@habitat/cli/service/modules/check/router";
import { Effect } from "effect";
import { withFiberContext } from "effect-orpc/node";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { makeTestHabitatServiceDeps } from "../support/habitat-service-deps";

const mockCreateCheckReportEffect = vi.hoisted(() => vi.fn<typeof createCheckReportEffect>());
const mockExpandBaselinesEffect = vi.hoisted(() => vi.fn<typeof expandBaselinesEffect>());

vi.mock(
  "@habitat/cli/service/modules/check/model/policy/baseline-expansion.policy",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("@habitat/cli/service/modules/check/model/policy/baseline-expansion.policy")
      >();
    return {
      ...actual,
      expandBaselinesEffect: mockExpandBaselinesEffect,
    };
  }
);

vi.mock("@habitat/cli/service/model/check/policy/structural/index", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("@habitat/cli/service/model/check/policy/structural/index")
    >();
  return {
    ...actual,
    createCheckReportEffect: mockCreateCheckReportEffect,
  };
});

const mockReport: CheckReport = {
  schemaVersion: 2,
  command: "habitat check --json",
  startedAt: "2026-06-20T00:00:00.000Z",
  ok: true,
  rules: [],
};

describe("Habitat check service", () => {
  beforeEach(() => {
    mockCreateCheckReportEffect.mockReset();
    mockExpandBaselinesEffect.mockReset();
  });

  test("runs owned check orchestration from service input", async () => {
    const observed: CheckOptions[] = [];
    mockCreateCheckReportEffect.mockImplementation((options) =>
      Effect.sync(() => {
        observed.push(options ?? {});
        return mockReport;
      })
    );
    mockExpandBaselinesEffect.mockImplementation(() => Effect.succeed({ ok: true, messages: [] }));
    const program = Effect.gen(function* () {
      const reportCheck = checkRouter.report.callable({
        context: { deps: makeTestHabitatServiceDeps() },
      });
      return yield* withFiberContext(() =>
        reportCheck({
          selectors: { rule: "enforce_formatting_and_import_hygiene", runner: "nx" },
          baselineIntegrity: true,
          base: "origin/main",
          staged: true,
          stagedPaths: ["tools/habitat/src/cli/commands/check.ts"],
        })
      );
    });
    const result = await Effect.runPromise(program);

    expect(result).toBe(mockReport);
    expect(observed).toEqual([
      {
        rule: "enforce_formatting_and_import_hygiene",
        runner: "nx",
        base: "origin/main",
        baselineIntegrity: true,
        command: {
          bin: "habitat",
          id: "check",
          argv: [],
          serialized: "habitat check",
        },
        repoRoot,
        staged: true,
        stagedPaths: ["tools/habitat/src/cli/commands/check.ts"],
      },
    ]);
  });

  test("preserves CLI command context supplied by the caller", async () => {
    const observed: CheckOptions[] = [];
    mockCreateCheckReportEffect.mockImplementation((options) =>
      Effect.sync(() => {
        observed.push(options ?? {});
        return mockReport;
      })
    );
    mockExpandBaselinesEffect.mockImplementation(() => Effect.succeed({ ok: true, messages: [] }));
    const command = {
      bin: "habitat" as const,
      id: "check" as const,
      argv: [
        "--rule",
        "prohibit_cross_op_runtime_calls",
        "--rule",
        "require_recipe_stage_source_topology",
      ],
      serialized:
        "habitat check --rule prohibit_cross_op_runtime_calls --rule require_recipe_stage_source_topology",
    };

    const program = Effect.gen(function* () {
      const reportCheck = checkRouter.report.callable({
        context: { deps: makeTestHabitatServiceDeps() },
      });
      return yield* withFiberContext(() =>
        reportCheck({
          command,
          selectors: {
            rules: ["prohibit_cross_op_runtime_calls", "require_recipe_stage_source_topology"],
          },
        })
      );
    });
    await Effect.runPromise(program);

    expect(observed).toEqual([
      {
        rules: ["prohibit_cross_op_runtime_calls", "require_recipe_stage_source_topology"],
        baselineIntegrity: false,
        command,
        repoRoot,
        staged: false,
      },
    ]);
  });

  test("projects baseline expansion into service output states", async () => {
    const observed: Array<{ selection: RuleSelection; options: { base?: string } }> = [];
    let expansion: BaselineExpansionResult = {
      ok: true,
      messages: ["baseline written: rule-a (1 entries)"],
    };
    mockCreateCheckReportEffect.mockImplementation(() => Effect.succeed(mockReport));
    mockExpandBaselinesEffect.mockImplementation((selection = {}, options) =>
      Effect.sync(() => {
        observed.push({ selection, options });
        return expansion;
      })
    );

    const expandOwnerBaseline = Effect.gen(function* () {
      const expandBaseline = checkRouter.expandBaseline.callable({
        context: { deps: makeTestHabitatServiceDeps() },
      });
      return yield* withFiberContext(() =>
        expandBaseline({
          selectors: { owner: "tools-habitat-harness" },
          base: "main",
        })
      );
    });
    const expanded = await Effect.runPromise(expandOwnerBaseline);

    expect(expanded).toEqual({
      kind: "expanded",
      messages: ["baseline written: rule-a (1 entries)"],
    });
    expect(observed).toEqual([
      { selection: { owner: "tools-habitat-harness" }, options: { base: "main", repoRoot } },
    ]);

    expansion = {
      ok: false,
      requested: { rule: "missing-rule" },
      reason: "unknown-selector",
      selectorFacts: [],
      message: 'Unknown Habitat rule id: "missing-rule".',
    };

    const expandMissingBaseline = Effect.gen(function* () {
      const expandBaseline = checkRouter.expandBaseline.callable({
        context: { deps: makeTestHabitatServiceDeps() },
      });
      return yield* withFiberContext(() =>
        expandBaseline({
          selectors: { rule: "missing-rule" },
        })
      );
    });
    const refused = await Effect.runPromise(expandMissingBaseline);

    expect(refused).toEqual({
      kind: "refused",
      message: 'Unknown Habitat rule id: "missing-rule".',
    });
  });
});
