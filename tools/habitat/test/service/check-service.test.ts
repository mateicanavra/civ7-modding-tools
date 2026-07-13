import { repoRoot } from "@habitat/cli/resources/paths";
import { type CheckOptions, type CheckReport } from "@habitat/cli/service/model/check/index";
import type { RuleSelection } from "@habitat/cli/service/model/rules/policy/selection.policy";
import type { BaselineExpansionResult } from "@habitat/cli/service/modules/check/model/policy/baseline-expansion.policy";
import { checkRouter } from "@habitat/cli/service/modules/check/router";
import { Effect } from "effect";
import { withFiberContext } from "effect-orpc/node";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { makeTestHabitatServiceDeps } from "../support/habitat-service-deps";

type CreateCheckReportPolicy = (options?: CheckOptions) => Effect.Effect<CheckReport>;
type ExpandBaselinesPolicy = (
  selection?: RuleSelection,
  options?: { readonly base?: string }
) => Effect.Effect<BaselineExpansionResult>;

const mockCreateCheckReportEffect = vi.hoisted(() => vi.fn<CreateCheckReportPolicy>());
const mockExpandBaselinesEffect = vi.hoisted(() => vi.fn<ExpandBaselinesPolicy>());

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

const mockReport = {
  schemaVersion: 2,
  command: "habitat check --json",
  startedAt: "2026-06-20T00:00:00.000Z",
  ok: true,
  rules: [],
} as const;

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
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const reportCheck = checkRouter.report.callable({
          context: { deps: makeTestHabitatServiceDeps() },
        });
        return yield* withFiberContext(() =>
          reportCheck({
            selectors: { rule: "enforce_formatting_and_import_hygiene", runner: "habitat" },
            baselineIntegrity: true,
            base: "origin/main",
            staged: true,
            stagedPaths: ["tools/habitat/src/cli/commands/check.ts"],
          })
        );
      })
    );

    expect(result).toBe(mockReport);
    expect(observed).toEqual([
      {
        rule: "enforce_formatting_and_import_hygiene",
        runner: "habitat",
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
        "preserve_standard_stage_topology_and_path_invariants",
      ],
      serialized:
        "habitat check --rule prohibit_cross_op_runtime_calls --rule preserve_standard_stage_topology_and_path_invariants",
    };

    await Effect.runPromise(
      Effect.gen(function* () {
        const reportCheck = checkRouter.report.callable({
          context: { deps: makeTestHabitatServiceDeps() },
        });
        return yield* withFiberContext(() =>
          reportCheck({
            command,
            selectors: {
              rules: [
                "prohibit_cross_op_runtime_calls",
                "preserve_standard_stage_topology_and_path_invariants",
              ],
            },
          })
        );
      })
    );

    expect(observed).toEqual([
      {
        rules: [
          "prohibit_cross_op_runtime_calls",
          "preserve_standard_stage_topology_and_path_invariants",
        ],
        baselineIntegrity: false,
        command,
        repoRoot,
        staged: false,
      },
    ]);
  });

  test("projects baseline expansion into service output states", async () => {
    const observed: Array<{ selection: RuleSelection; options: { base?: string } }> = [];
    let expansion = { ok: true as const, messages: ["baseline written: rule-a (1 entries)"] };
    mockCreateCheckReportEffect.mockImplementation(() => Effect.succeed(mockReport));
    mockExpandBaselinesEffect.mockImplementation((selection = {}, options = {}) =>
      Effect.sync(() => {
        observed.push({ selection, options });
        return expansion;
      })
    );

    const expanded = await Effect.runPromise(
      Effect.gen(function* () {
        const expandBaseline = checkRouter.expandBaseline.callable({
          context: { deps: makeTestHabitatServiceDeps() },
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
      { selection: { owner: "tools-habitat-harness" }, options: { base: "main", repoRoot } },
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
          context: { deps: makeTestHabitatServiceDeps() },
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
