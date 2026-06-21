import type { RuleSelection } from "@internal/habitat-harness/core/domains/rule-selection/index";
import { makeFakeStructuralCheckLayer } from "@internal/habitat-harness/core/domains/structural-check/index";
import type { CheckOptions } from "@internal/habitat-harness/core/domains/structural-check/request";
import {
  expandCheckBaselinesService,
  runCheckService,
} from "@internal/habitat-harness/service/modules/check/router";
import { Effect } from "effect";
import { describe, expect, test } from "vitest";

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
    const result = await Effect.runPromise(
      runCheckService({
        selectors: { rule: "format-ci", tool: "biome" },
        baselineIntegrity: true,
        base: "origin/main",
        commandArgs: ["--json"],
        staged: true,
        stagedPaths: ["tools/habitat-harness/src/host/commands/check.ts"],
      }).pipe(
        Effect.provide(
          makeFakeStructuralCheckLayer({
            createReport: (options) =>
              Effect.sync(() => {
                observed.push(options ?? {});
                return mockReport;
              }),
            expandBaselines: () => Effect.succeed({ ok: true, messages: [] }),
          })
        )
      )
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
          argv: ["--json"],
          serialized: "habitat check --json",
        },
        staged: true,
        stagedPaths: ["tools/habitat-harness/src/host/commands/check.ts"],
      },
    ]);
  });

  test("projects baseline expansion into service output states", async () => {
    const observed: Array<{ selection: RuleSelection; options: { base?: string } }> = [];
    let expansion = { ok: true as const, messages: ["baseline written: rule-a (1 entries)"] };
    const layer = makeFakeStructuralCheckLayer({
      createReport: () => Effect.succeed(mockReport),
      expandBaselines: (selection = {}, options = {}) =>
        Effect.sync(() => {
          observed.push({ selection, options });
          return expansion;
        }),
    });

    const expanded = await Effect.runPromise(
      expandCheckBaselinesService({
        selectors: { owner: "tools-habitat-harness" },
        base: "main",
      }).pipe(Effect.provide(layer))
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
      expandCheckBaselinesService({
        selectors: { rule: "missing-rule" },
      }).pipe(Effect.provide(layer))
    );

    expect(refused).toEqual({
      kind: "refused",
      message: 'Unknown Habitat rule id: "missing-rule".',
    });
  });
});
