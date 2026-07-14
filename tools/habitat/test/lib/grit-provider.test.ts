import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { FileSystem } from "@effect/platform";
import * as PlatformError from "@effect/platform/Error";
import { NodeContext } from "@effect/platform-node";
import { makeFakeGitStateProviderLayer } from "@habitat/cli/providers/git/index";
import {
  CommandInterrupted,
  CommandRunner,
  type CommandRunnerService,
  CommandUnavailable,
  captureOutput,
  type HabitatProcessRequest,
  makeHabitatCommandResult,
} from "@habitat/cli/resources/command/index";
import { makeHabitatConfig, makeHabitatConfigLayer } from "@habitat/cli/resources/config/index";
import { repoRoot } from "@habitat/cli/resources/paths";
import { runGritCheckAcquisitionEffect } from "@habitat/cli/resources/rule-diagnostics/providers/grit/check";
import {
  DiagnosticCommandObservationSchema,
  NativeGritCommandRequestSchema,
  type NativeGritPinnedNativePreflightRequest,
  NativeGritPinnedNativePreflightRequestSchema,
  type NativeGritSelectedRuleApplyDryRunObservationRequest,
  NativeGritSelectedRuleApplyDryRunObservationRequestSchema,
  type NativeGritSelectedRuleJsonCheckRequest,
  NativeGritSelectedRuleJsonCheckRequestSchema,
  nativeGritCommandRequestFromProcessRequest,
} from "@habitat/cli/resources/rule-diagnostics/providers/grit/command.schema";
import { defaultGritCommandTimeoutMs } from "@habitat/cli/resources/rule-diagnostics/providers/grit/constants";
import {
  makeGritRuleFixPreviewRunner,
  makeGritRuleFixPreviewService,
} from "@habitat/cli/resources/rule-diagnostics/providers/grit/fix-preview";
import {
  makeFakeGritCommandService,
  makeGritCommandService,
  ObservedGritDiagnosticIdentitySchema,
  observedGritDiagnosticIdentity,
  pinnedGritNativePath,
  planGritRuleRoots,
  runGritDiagnosticOutcomesEffect,
  runGritRulesEffect,
} from "@habitat/cli/resources/rule-diagnostics/providers/grit/index";
import {
  applyAcquisitionEvidence,
  checkAcquisitionEvidence,
  completeApplyAcquisition,
  completeCheckAcquisition,
  type GritApplyAcquisitionEvidence,
  type GritCheckAcquisitionEvidence,
  type GritCommandFailureCapture,
  type GritDiagnosticAcquisition,
  GritDiagnosticAcquisitionSchema,
  parseGritApplyDryRunCommand,
  parseGritCheckCommand,
  preCommandFailure,
} from "@habitat/cli/resources/rule-diagnostics/providers/grit/output";
import { pathIsWithinRoot } from "@habitat/cli/resources/rule-diagnostics/providers/grit/path";
import {
  captureGritCommandEffect,
  nativeIdentityMismatchBeforeSpawn,
} from "@habitat/cli/resources/rule-diagnostics/providers/grit/request";
import {
  GritCompactEventSchema,
  GritReportSchema,
  type GritResult,
  GritResultSchema,
} from "@habitat/cli/resources/rule-diagnostics/providers/grit/types";
import type { RuleFixFacts, RuleGritFacts } from "@habitat/cli/service/model/rules/index";
import { Effect, Layer, Match, Schema } from "effect";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";
import { makeTestRuleFacts } from "../support/habitat-service-deps";

const gritFixturePaths = {
  providerRoot: "tools/habitat/src/resources/rule-diagnostics/providers/grit",
  providerFile: "tools/habitat/src/resources/rule-diagnostics/providers/grit/types.ts",
  providerPattern:
    ".habitat/habitat/toolkit/_blueprints/grit-provider/prohibit_product_scan_roots_in_grit_provider/pattern.md",
  docsPattern: ".habitat/docs/rules/ensure_docs_checkout_paths_are_portable/pattern.md",
};
const { providerRoot, providerFile, providerPattern, docsPattern } = gritFixturePaths;
const stringifyJsonDocument = Schema.encodeSync(Schema.parseJson());
const withNodeContext = Effect.provide(NodeContext.layer);

describe("Grit closed wire decoders", () => {
  test("accepts only the complete pinned check JSON document on stderr", () => {
    const report = checkReport(path.join(repoRoot, providerFile), "alpha_pattern");
    expect(parseGritCheckCommand(commandResult({ stderr: jsonDocument(report) }))).toEqual({
      kind: "parsed",
      value: report,
    });

    expect(parseGritCheckCommand(commandResult())).toMatchObject({
      kind: "parse-failed",
      failure: "DiagnosticOutputMissing",
    });
    expect(parseGritCheckCommand(commandResult({ stdout: jsonDocument(report) }))).toMatchObject({
      kind: "parse-failed",
      failure: "DiagnosticOutputChannelMismatch",
    });
    expect(
      parseGritCheckCommand(commandResult({ stdout: "wrapper", stderr: jsonDocument(report) }))
    ).toMatchObject({ kind: "parse-failed", failure: "DiagnosticOutputChannelMismatch" });
    expect(parseGritCheckCommand(commandResult({ stderr: "{" }))).toMatchObject({
      kind: "parse-failed",
      failure: "DiagnosticOutputMalformed",
    });
    expect(
      parseGritCheckCommand(commandResult({ stderr: jsonDocument({ paths: [], results: [] }) }))
    ).toMatchObject({ kind: "parsed" });
  });

  test("rejects incomplete check result objects and output truncation", () => {
    const incomplete = {
      paths: [path.join(repoRoot, providerFile)],
      results: [
        {
          check_id: "#alpha_pattern/js",
          local_name: "alpha_pattern",
          path: path.join(repoRoot, providerFile),
        },
      ],
    };
    expect(
      parseGritCheckCommand(commandResult({ stderr: jsonDocument(incomplete) }))
    ).toMatchObject({ kind: "parse-failed", failure: "DiagnosticOutputSchemaDrift" });
    expect(
      parseGritCheckCommand(
        commandResult({
          stderr: jsonDocument({
            ...checkReport(path.join(repoRoot, providerFile), "alpha_pattern"),
            unexpected: true,
          }),
        })
      )
    ).toMatchObject({ kind: "parse-failed", failure: "DiagnosticOutputSchemaDrift" });
    expect(
      parseGritCheckCommand(
        makeHabitatCommandResult(baseRequest(), {
          stderr: { ...captureOutput("{}"), truncated: true },
        })
      )
    ).toMatchObject({ kind: "parse-failed", failure: "DiagnosticOutputTruncated" });
  });

  test.each([
    "#",
    "#/js",
    "#alpha_pattern/js#",
  ])("rejects an empty parsed check identity in %s", (checkId) => {
    const fixture = checkReport(path.join(repoRoot, providerFile), "alpha_pattern").results[0];
    expect(fixture).toBeDefined();
    if (!fixture) throw new Error("expected check result fixture");

    expect(Value.Check(GritResultSchema, gritResultWithCheckId(fixture, checkId))).toBe(false);
    expect(() =>
      observedGritDiagnosticIdentity({ local_name: fixture.local_name, check_id: checkId })
    ).toThrow();
  });

  test("roundtrips accepted check identities through the observed identity projection", () => {
    const fixture = checkReport(path.join(repoRoot, providerFile), "alpha_pattern").results[0];
    expect(fixture).toBeDefined();
    if (!fixture) throw new Error("expected check result fixture");

    const result = Value.Parse(
      GritResultSchema,
      gritResultWithCheckId(fixture, "#alpha_pattern/js")
    );
    const observed = observedGritDiagnosticIdentity(result);
    expect(Value.Parse(ObservedGritDiagnosticIdentitySchema, observed)).toEqual({
      kind: "observed-pattern",
      observedPatternIdentity: "alpha_pattern",
      source: "local-name-and-check-id",
    });

    expect(
      observedGritDiagnosticIdentity(gritResultWithCheckId(result, "#beta_pattern/js"))
    ).toEqual({
      kind: "observed-identity-mismatch",
      localName: "alpha_pattern",
      parsedCheckId: "beta_pattern",
    });
  });

  test("keeps state-specific failure vocabularies disjoint", () => {
    for (const failure of [
      "DiagnosticScopePlanningFailed",
      "DiagnosticRuleMaterializationFailed",
      "DiagnosticProviderSetupFailed",
    ] as const) {
      expect(
        Value.Check(GritDiagnosticAcquisitionSchema, preCommandFailure(failure, failure))
      ).toBe(true);
    }
    expect(
      Value.Check(GritDiagnosticAcquisitionSchema, {
        ...preCommandFailure("DiagnosticRuleMaterializationFailed", "bad asset"),
        failure: "DiagnosticOutputMalformed",
      })
    ).toBe(false);
    expect(
      Value.Check(GritDiagnosticAcquisitionSchema, {
        kind: "pre-command-failed",
        failure: "DiagnosticProviderContractViolation",
        detail: "a completed command cannot be a pre-command failure",
      })
    ).toBe(false);
    expect(
      Value.Check(GritDiagnosticAcquisitionSchema, {
        kind: "parse-failed",
        failure: "DiagnosticProviderUnavailable",
        detail: "wrong state/failure cross-product",
        request: nativeRequestFixture(),
        command: completedCommandFixture(),
      })
    ).toBe(false);
  });

  test("correlates native command families, output contracts, and failed exits", () => {
    const contracts = [
      ["selected-rule-json-check", "json-report-on-stderr"],
      ["selected-rule-apply-dry-run-observation", "compact-jsonl-on-stdout"],
      ["pinned-native-preflight", "version-on-stdout"],
    ] as const;
    const request = nativeRequestFixture();
    for (const [family, outputContract] of contracts) {
      const scanRoots = Match.value(family).pipe(
        Match.when("pinned-native-preflight", () => []),
        Match.orElse(() => request.scanRoots)
      );
      expect(
        Value.Check(NativeGritCommandRequestSchema, {
          ...request,
          commandFamily: family,
          outputContract,
          scanRoots,
        })
      ).toBe(true);
      for (const [, wrongOutputContract] of contracts) {
        if (wrongOutputContract === outputContract) continue;
        expect(
          Value.Check(NativeGritCommandRequestSchema, {
            ...request,
            commandFamily: family,
            outputContract: wrongOutputContract,
            scanRoots,
          })
        ).toBe(false);
      }
    }
    expect(Value.Check(DiagnosticCommandObservationSchema, failedCommandFixture(7))).toBe(true);
    expect(Value.Check(DiagnosticCommandObservationSchema, failedCommandFixture(0))).toBe(false);
    expect(
      Value.Check(NativeGritSelectedRuleJsonCheckRequestSchema, {
        ...request,
        scanRoots: [],
      })
    ).toBe(false);
    expect(
      Value.Check(NativeGritPinnedNativePreflightRequestSchema, {
        ...request,
        commandFamily: "pinned-native-preflight",
        outputContract: "version-on-stdout",
      })
    ).toBe(false);

    const processRequest = baseRequest();
    const checkRequest = nativeGritCommandRequestFromProcessRequest({
      request: processRequest,
      commandFamily: "selected-rule-json-check",
    }) satisfies NativeGritSelectedRuleJsonCheckRequest;
    const applyRequest = nativeGritCommandRequestFromProcessRequest({
      request: processRequest,
      commandFamily: "selected-rule-apply-dry-run-observation",
    }) satisfies NativeGritSelectedRuleApplyDryRunObservationRequest;
    const preflightRequest = nativeGritCommandRequestFromProcessRequest({
      request: processRequest,
      commandFamily: "pinned-native-preflight",
    }) satisfies NativeGritPinnedNativePreflightRequest;
    expect(Value.Check(NativeGritSelectedRuleJsonCheckRequestSchema, checkRequest)).toBe(true);
    expect(
      Value.Check(NativeGritSelectedRuleApplyDryRunObservationRequestSchema, applyRequest)
    ).toBe(true);
    expect(Value.Check(NativeGritPinnedNativePreflightRequestSchema, preflightRequest)).toBe(true);
  });

  test("correlates acquisition states, failures, and command observations", () => {
    const request = nativeRequestFixture();
    const applyRequest = nativeGritCommandRequestFromProcessRequest({
      request: baseRequest(),
      commandFamily: "selected-rule-apply-dry-run-observation",
    });
    const preflightRequest = nativeGritCommandRequestFromProcessRequest({
      request: baseRequest(),
      commandFamily: "pinned-native-preflight",
    });
    const completed = completedCommandFixture();
    const failed = failedCommandFixture(7);
    const interrupted = interruptedCommandFixture();
    const unavailable = toolUnavailableCommandFixture();
    const completedObservation = {
      kind: "observed-complete",
      observation: {
        kind: "check",
        report: checkReport(path.join(repoRoot, providerFile), "alpha_pattern"),
      },
      request,
      command: completed,
    };
    const commandFailures = [
      {
        failure: "DiagnosticProviderUnavailable",
        detail: "unavailable",
        command: unavailable,
      },
      {
        failure: "DiagnosticCommandFailed",
        detail: "failed",
        command: failed,
      },
      {
        failure: "DiagnosticCommandInterrupted",
        detail: "interrupted",
        command: interrupted,
      },
      {
        failure: "DiagnosticProviderIdentityMismatch",
        detail: "completed mismatch",
        command: completed,
      },
      {
        failure: "DiagnosticProviderIdentityMismatch",
        detail: "pre-spawn mismatch",
        command: unavailable,
      },
    ] as const satisfies readonly GritCommandFailureCapture[];

    expect(Value.Check(GritDiagnosticAcquisitionSchema, completedObservation)).toBe(true);
    for (const failure of commandFailures) {
      expect(
        Value.Check(GritDiagnosticAcquisitionSchema, {
          kind: "command-failed",
          request,
          ...failure,
        })
      ).toBe(true);
    }
    for (const invalid of [
      { ...completedObservation, command: unavailable },
      { ...completedObservation, request: preflightRequest },
      {
        kind: "command-failed",
        failure: "DiagnosticProviderUnavailable",
        detail: "preflight is not a target request",
        request: preflightRequest,
        command: unavailable,
      },
      {
        ...completedObservation,
        observation: {
          kind: "apply-dry-run",
          processed: 1,
          found: 0,
          findings: [],
        },
      },
      { ...completedObservation, request: applyRequest },
      {
        kind: "parse-failed",
        failure: "DiagnosticOutputMalformed",
        detail: "parse requires completed target",
        request,
        command: interrupted,
      },
      {
        kind: "parse-failed",
        failure: "DiagnosticOutputMalformed",
        detail: "preflight is not a target request",
        request: preflightRequest,
        command: completed,
      },
      {
        kind: "parsed-incomplete",
        failure: "DiagnosticOutputIncomplete",
        detail: "incomplete requires completed target",
        request,
        command: failed,
      },
      {
        kind: "parsed-incomplete",
        failure: "DiagnosticOutputIncomplete",
        detail: "preflight is not a target request",
        request: preflightRequest,
        command: completed,
      },
      {
        kind: "command-failed",
        failure: "DiagnosticCommandFailed",
        detail: "failed cannot carry completed",
        request,
        command: completed,
      },
      {
        kind: "command-failed",
        failure: "DiagnosticProviderUnavailable",
        detail: "unavailable cannot carry failed",
        request,
        command: failed,
      },
      {
        kind: "command-failed",
        failure: "DiagnosticCommandInterrupted",
        detail: "interrupted cannot carry failed",
        request,
        command: failed,
      },
      {
        kind: "command-failed",
        failure: "DiagnosticProviderIdentityMismatch",
        detail: "identity cannot carry interruption",
        request,
        command: interrupted,
      },
    ]) {
      expect(Value.Check(GritDiagnosticAcquisitionSchema, invalid)).toBe(false);
    }
  });

  test("admits only completed command evidence matching the exact target request", () => {
    const relativeRepoRoot = path.relative(process.cwd(), repoRoot) || ".";
    const processRequest = { ...baseRequest(), cwd: relativeRepoRoot };
    const command = completedCommandFixture();
    const checkRequest = nativeGritCommandRequestFromProcessRequest({
      request: processRequest,
      commandFamily: "selected-rule-json-check",
    });
    const applyRequest = nativeGritCommandRequestFromProcessRequest({
      request: processRequest,
      commandFamily: "selected-rule-apply-dry-run-observation",
    });
    const checkEvidence = checkAcquisitionEvidence(checkRequest, command);
    const applyEvidence = applyAcquisitionEvidence(applyRequest, command);
    const checkComplete = Match.value(checkEvidence).pipe(
      Match.when({ kind: "accepted" }, ({ evidence }) =>
        completeCheckAcquisition(
          checkReport(path.join(repoRoot, providerFile), "alpha_pattern"),
          evidence satisfies GritCheckAcquisitionEvidence
        )
      ),
      Match.when({ kind: "failed" }, ({ acquisition }) => acquisition),
      Match.exhaustive
    );
    const applyComplete = Match.value(applyEvidence).pipe(
      Match.when({ kind: "accepted" }, ({ evidence }) =>
        completeApplyAcquisition(
          { processed: 1, found: 0, findings: [] },
          evidence satisfies GritApplyAcquisitionEvidence
        )
      ),
      Match.when({ kind: "failed" }, ({ acquisition }) => acquisition),
      Match.exhaustive
    );
    expect(checkComplete).toMatchObject({
      kind: "observed-complete",
      request: { commandFamily: "selected-rule-json-check", cwd: repoRoot },
      command: { cwd: repoRoot },
      observation: { kind: "check" },
    });
    expect(applyComplete).toMatchObject({
      kind: "observed-complete",
      request: { commandFamily: "selected-rule-apply-dry-run-observation" },
      observation: { kind: "apply-dry-run" },
    });
    expect(Value.Check(GritDiagnosticAcquisitionSchema, checkComplete)).toBe(true);
    expect(Value.Check(GritDiagnosticAcquisitionSchema, applyComplete)).toBe(true);

    for (const fixture of [
      { command: { ...command, commandId: "other-command" }, field: "commandInvocationId" },
      { command: { ...command, executable: "/other/grit" }, field: "executable" },
      { command: { ...command, argv: ["--other"] }, field: "argv" },
      { command: { ...command, cwd: path.join(repoRoot, "other-cwd") }, field: "cwd" },
      { command: { ...command, scanRoots: ["other-root"] }, field: "scanRoots" },
    ]) {
      const result = checkAcquisitionEvidence(checkRequest, fixture.command);
      expect(result).toMatchObject({
        kind: "failed",
        acquisition: {
          kind: "evidence-mismatch",
          failure: "DiagnosticProviderContractViolation",
          detail: expect.stringContaining(fixture.field),
          request: { commandFamily: "selected-rule-json-check" },
          command: { kind: "completed" },
        },
      });
      const acquisition = Match.value(result).pipe(
        Match.when({ kind: "accepted" }, () => null),
        Match.when({ kind: "failed" }, ({ acquisition: mismatch }) => mismatch),
        Match.exhaustive
      );
      expect(Value.Check(GritDiagnosticAcquisitionSchema, acquisition)).toBe(true);
    }
  });

  test("attributes failed-command roots only to the exact normalized target command", async () => {
    const request = baseRequest();
    const matching = new CommandUnavailable({
      commandId: request.commandId,
      executable: request.executable,
      argv: request.argv,
      cwd: path.join(request.cwd, "."),
      cause: "matching failure",
    });
    const mismatchedCwd = new CommandUnavailable({
      ...matching,
      cwd: path.join(request.cwd, "other"),
      cause: "other cwd failure",
    });
    const matchingCapture = await Effect.runPromise(
      captureGritCommandEffect(request, Effect.fail(matching))
    );
    const mismatchedCapture = await Effect.runPromise(
      captureGritCommandEffect(request, Effect.fail(mismatchedCwd))
    );

    expect(matchingCapture).toMatchObject({ command: { scanRoots: request.scanRoots } });
    expect(mismatchedCapture).toMatchObject({ command: { scanRoots: [] } });
  });

  test("decodes the closed compact event union and rejects DoneFile", () => {
    for (const event of compactEventFixtures()) {
      expect(Value.Check(GritCompactEventSchema, event)).toBe(true);
    }
    expect(
      Value.Check(GritCompactEventSchema, { __typename: "DoneFile", relativeFilePath: "x" })
    ).toBe(false);
    expect(Value.Check(GritCompactEventSchema, { __typename: "Unknown" })).toBe(false);
  });

  test("requires the exact source-derived MatchReason at every embedding", () => {
    const file = path.join(repoRoot, providerFile);
    for (const event of [
      matchEvent(file, 1),
      rewriteEvent(file, 1),
      createFileEvent(file),
      removeFileEvent(file),
    ]) {
      expect(Value.Check(GritCompactEventSchema, event)).toBe(true);
      expect(Value.Check(GritCompactEventSchema, replaceMatchReason(event, null))).toBe(true);
      expect(
        Value.Check(
          GritCompactEventSchema,
          replaceMatchReason(event, { ...compactMatchReason(), source: "INVENTED" })
        )
      ).toBe(false);
      expect(
        Value.Check(
          GritCompactEventSchema,
          replaceMatchReason(event, { ...compactMatchReason(), extra: true })
        )
      ).toBe(false);
    }
  });

  test("reconciles Match, Rewrite, and CreateFile cardinality", () => {
    const root = path.join(repoRoot, providerRoot);
    const output = jsonl(
      matchEvent(path.join(root, "types.ts"), 2),
      rewriteEvent(path.join(root, "output.ts"), 0),
      createFileEvent("generated.ts"),
      allDone(3, 4)
    );
    expect(parseGritApplyDryRunCommand(commandResult({ stdout: output }))).toEqual({
      kind: "parsed",
      value: {
        processed: 3,
        found: 4,
        findings: [
          { kind: "match", path: path.join(root, "types.ts") },
          {
            kind: "rewrite",
            originalPath: path.join(root, "output.ts"),
            rewrittenPath: path.join(root, "output.ts"),
          },
          { kind: "create-file", path: "generated.ts" },
        ],
      },
    });
  });

  test("counts multi-range and zero-range rewrites and accepts a clean terminal", () => {
    const file = path.join(repoRoot, providerFile);
    expect(
      parseGritApplyDryRunCommand(
        commandResult({ stdout: jsonl(rewriteEvent(file, 3), allDone(1, 3)) })
      )
    ).toMatchObject({ kind: "parsed", value: { found: 3 } });
    expect(
      parseGritApplyDryRunCommand(
        commandResult({ stdout: jsonl(rewriteEvent(file, 0), allDone(1, 1)) })
      )
    ).toMatchObject({ kind: "parsed", value: { found: 1 } });
    expect(parseGritApplyDryRunCommand(commandResult({ stdout: jsonl(allDone(1, 0)) }))).toEqual({
      kind: "parsed",
      value: { processed: 1, found: 0, findings: [] },
    });
  });

  test("distinguishes malformed JSONL from valid but incomplete observations", () => {
    expect(parseGritApplyDryRunCommand(commandResult({ stdout: "{\n" }))).toMatchObject({
      kind: "parse-failed",
      failure: "DiagnosticOutputMalformed",
    });
    expect(
      parseGritApplyDryRunCommand(commandResult({ stdout: `${jsonDocument(allDone(1, 0))}\n\n` }))
    ).toMatchObject({ kind: "parse-failed", failure: "DiagnosticOutputMalformed" });
    expect(
      parseGritApplyDryRunCommand(commandResult({ stdout: jsonl({ __typename: "DoneFile" }) }))
    ).toMatchObject({ kind: "parse-failed", failure: "DiagnosticOutputSchemaDrift" });
    expect(
      parseGritApplyDryRunCommand(commandResult({ stdout: jsonl(allDone(0, 0)) }))
    ).toMatchObject({
      kind: "parsed-incomplete",
      detail: expect.stringContaining("processed-zero"),
    });
    expect(
      parseGritApplyDryRunCommand(commandResult({ stdout: jsonl(analysisLog(299), allDone(1, 0)) }))
    ).toMatchObject({
      kind: "parsed-incomplete",
      detail: expect.stringContaining("analysis-failure"),
    });
    expect(
      parseGritApplyDryRunCommand(
        commandResult({ stdout: jsonl(analysisLog(299), allDone(1, 0)) }),
        { analysisPathIsRelevant: () => false }
      )
    ).toEqual({
      kind: "parsed",
      value: { processed: 1, found: 0, findings: [] },
    });
    expect(
      parseGritApplyDryRunCommand(
        commandResult({
          stdout: jsonl(matchEvent(path.join(repoRoot, providerFile), 1), allDone(1, 2)),
        })
      )
    ).toMatchObject({
      kind: "parsed-incomplete",
      detail: expect.stringContaining("count-mismatch"),
    });
    expect(
      parseGritApplyDryRunCommand(
        commandResult({ stdout: jsonl({ ...patternInfoEvent(), valid: false }, allDone(1, 0)) })
      )
    ).toMatchObject({
      kind: "parsed-incomplete",
      detail: expect.stringContaining("invalid-pattern-info"),
    });
  });

  test("selects one deterministic relevant analysis failure", () => {
    const canonical = {
      ...analysisLog(299, "a.ts"),
      message: "canonical analysis",
      position: { line: 1, column: 2 },
    };
    const laterPosition = {
      ...analysisLog(100, "a.ts"),
      message: "later position",
      position: { line: 2, column: 1 },
    };
    const laterFile = {
      ...analysisLog(100, "b.ts"),
      message: "later file",
      position: { line: 1, column: 1 },
    };
    const irrelevant = {
      ...analysisLog(1, "0-irrelevant.ts"),
      message: "irrelevant analysis",
      position: { line: 1, column: 1 },
    };
    const parse = (analysisEvents: readonly object[]) =>
      parseGritApplyDryRunCommand(
        commandResult({ stdout: jsonl(...analysisEvents, allDone(1, 0)) }),
        { analysisPathIsRelevant: (file) => file !== irrelevant.file }
      );

    const forward = parse([canonical, laterPosition, laterFile]);
    const reverse = parse([laterFile, laterPosition, canonical]);
    expect(forward).toEqual(reverse);
    expect(forward).toEqual({
      kind: "parsed-incomplete",
      failure: "DiagnosticOutputIncomplete",
      detail: "analysis-failure: Grit analysis failed at level 299: canonical analysis",
    });
    expect(parse([irrelevant, laterFile, canonical, laterPosition])).toEqual(forward);
    expect(
      parseGritApplyDryRunCommand(
        commandResult({
          stdout: jsonl(canonical, { ...patternInfoEvent(), valid: false }, allDone(1, 0)),
        })
      )
    ).toMatchObject({
      kind: "parsed-incomplete",
      detail: expect.stringContaining("invalid-pattern-info"),
    });
  });

  test("requires one final successful AllDone and counts RemoveFile ranges", () => {
    const file = path.join(repoRoot, providerFile);
    expect(
      parseGritApplyDryRunCommand(commandResult({ stdout: jsonl(matchEvent(file, 1)) }))
    ).toMatchObject({
      kind: "parsed-incomplete",
      detail: expect.stringContaining("terminal-shape"),
    });
    expect(
      parseGritApplyDryRunCommand(
        commandResult({ stdout: jsonl(allDone(1, 0), patternInfoEvent()) })
      )
    ).toMatchObject({
      kind: "parsed-incomplete",
      detail: expect.stringContaining("terminal-shape"),
    });
    expect(
      parseGritApplyDryRunCommand(commandResult({ stdout: jsonl(allDone(1, 0), allDone(1, 0)) }))
    ).toMatchObject({
      kind: "parsed-incomplete",
      detail: expect.stringContaining("terminal-shape"),
    });
    for (const reason of ["noInputPaths", "maxResultsReached", "aborted"] as const) {
      expect(
        parseGritApplyDryRunCommand(commandResult({ stdout: jsonl({ ...allDone(1, 0), reason }) }))
      ).toMatchObject({
        kind: "parsed-incomplete",
        detail: expect.stringContaining("terminal-reason"),
      });
    }
    expect(
      parseGritApplyDryRunCommand(
        commandResult({ stdout: jsonl({ ...allDone(1, 0), unexpected: true }) })
      )
    ).toMatchObject({ kind: "parse-failed", failure: "DiagnosticOutputSchemaDrift" });
    expect(
      parseGritApplyDryRunCommand(
        commandResult({ stdout: jsonl(removeFileEvent(file, 0), allDone(1, 1)) })
      )
    ).toEqual({
      kind: "parsed",
      value: {
        processed: 1,
        found: 1,
        findings: [{ kind: "remove-file", path: file }],
      },
    });
    expect(
      parseGritApplyDryRunCommand(
        commandResult({ stdout: jsonl(removeFileEvent(file, 3), allDone(1, 3)) })
      )
    ).toMatchObject({ kind: "parsed", value: { found: 3 } });
  });
});

describe("Grit fix preview projection", () => {
  test("projects closed impacts, enforces declared effects, and refuses Match-only evidence", async () => {
    const fixture = mkdtempSync(path.join(tmpdir(), "habitat-grit-preview-"));
    try {
      mkdirSync(path.join(fixture, ".habitat"));
      mkdirSync(path.join(fixture, "scan"));
      const source = path.join(fixture, "scan/source.ts");
      const renamed = path.join(fixture, "scan/renamed.ts");
      const alias = path.join(fixture, "scan/source-alias.ts");
      const created = path.join(fixture, "scan/created.ts");
      const probeFailed = path.join(fixture, "scan/probe-failed.ts");
      writeFileSync(source, "const value = 1;\n");
      writeFileSync(
        path.join(fixture, ".habitat/fix.pattern.md"),
        readFileSync(path.join(repoRoot, providerPattern), "utf8")
      );

      expect(await previewEvent(fixture, rewriteEvent(source, 1), ["modify"])).toMatchObject({
        kind: "completed",
        results: [{ kind: "previewed", impacts: [{ kind: "modify", path: "scan/source.ts" }] }],
      });
      const changedRewrite = {
        ...rewriteEvent(source, 1),
        rewritten: { sourceFile: renamed },
      };
      expect(await previewEvent(fixture, changedRewrite, ["rename"])).toMatchObject({
        kind: "completed",
        results: [{ kind: "authority-refused", undeclaredEffects: ["modify"] }],
      });
      expect(await previewEvent(fixture, changedRewrite, ["modify", "rename"])).toMatchObject({
        kind: "completed",
        results: [
          {
            kind: "previewed",
            impacts: [
              { kind: "modify", path: "scan/renamed.ts" },
              { kind: "rename", from: "scan/source.ts", to: "scan/renamed.ts" },
            ],
          },
        ],
      });
      symlinkSync(source, alias);
      expect(
        await previewEvent(
          fixture,
          { ...rewriteEvent(source, 1), rewritten: { sourceFile: alias } },
          ["modify", "rename"]
        )
      ).toMatchObject({
        kind: "completed",
        results: [
          {
            kind: "provider-failed",
            failure: "DiagnosticOutputIncomplete",
            detail: expect.stringContaining("rewrite-destination-collision"),
          },
        ],
      });
      expect(await previewEvent(fixture, createFileEvent(created), ["create"])).toMatchObject({
        kind: "completed",
        results: [{ kind: "previewed", impacts: [{ kind: "create", path: "scan/created.ts" }] }],
      });
      writeFileSync(created, "const existing = true;\n");
      expect(await previewEvent(fixture, createFileEvent(created), ["create"])).toMatchObject({
        kind: "completed",
        results: [
          {
            kind: "provider-failed",
            failure: "DiagnosticOutputIncomplete",
            detail: expect.stringContaining("create-file-collision"),
          },
        ],
      });
      expect(await previewEvent(fixture, removeFileEvent(source), ["delete"])).toMatchObject({
        kind: "completed",
        results: [{ kind: "previewed", impacts: [{ kind: "delete", path: "scan/source.ts" }] }],
      });
      expect(await previewEvent(fixture, matchEvent(source, 1), ["modify"])).toMatchObject({
        kind: "completed",
        results: [
          {
            kind: "provider-failed",
            failure: "DiagnosticOutputIncomplete",
            detail: expect.stringContaining("transformation-evidence-missing"),
          },
        ],
      });
      expect(
        await previewEvent(fixture, createFileEvent(probeFailed), ["create"], (fs) => ({
          ...fs,
          readLink: (target) =>
            Match.value(target === probeFailed).pipe(
              Match.when(true, () =>
                Effect.fail(
                  new PlatformError.SystemError({
                    reason: "PermissionDenied",
                    module: "FileSystem",
                    method: "readLink",
                  })
                )
              ),
              Match.orElse(() => fs.readLink(target))
            ),
        }))
      ).toMatchObject({
        kind: "completed",
        results: [
          {
            kind: "provider-failed",
            failure: "DiagnosticOutputIncomplete",
            detail: expect.stringContaining("symlink-probe-failed"),
          },
        ],
      });
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });

  test("deduplicates deterministic impacts and refuses conflicting transformation endpoints", async () => {
    const fixture = mkdtempSync(path.join(tmpdir(), "habitat-grit-preview-findings-"));
    try {
      mkdirSync(path.join(fixture, ".habitat"));
      mkdirSync(path.join(fixture, "scan"));
      const alpha = path.join(fixture, "scan/alpha.ts");
      const zeta = path.join(fixture, "scan/zeta.ts");
      writeFileSync(alpha, "const alpha = true;\n");
      writeFileSync(zeta, "const zeta = true;\n");
      writeFileSync(
        path.join(fixture, ".habitat/fix.pattern.md"),
        readFileSync(path.join(repoRoot, providerPattern), "utf8")
      );

      const findings = [rewriteEvent(zeta, 1), rewriteEvent(alpha, 1), rewriteEvent(zeta, 1)];
      const forward = await previewEvents(fixture, findings, ["modify"], 3);
      expect(forward).toMatchObject({
        kind: "completed",
        results: [
          {
            kind: "previewed",
            impacts: [
              { kind: "modify", path: "scan/alpha.ts" },
              { kind: "modify", path: "scan/zeta.ts" },
            ],
          },
        ],
      });
      expect(await previewEvents(fixture, [...findings].reverse(), ["modify"], 3)).toEqual(forward);

      expect(
        await previewEvents(
          fixture,
          [rewriteEvent(alpha, 1), removeFileEvent(alpha)],
          ["modify", "delete"],
          2
        )
      ).toMatchObject({
        kind: "completed",
        results: [
          {
            kind: "provider-failed",
            failure: "DiagnosticOutputIncomplete",
            detail: expect.stringContaining("conflicting-transformation-endpoint"),
          },
        ],
      });
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });
});

async function previewEvent(
  fixture: string,
  event: object,
  effects: RuleFixFacts["fix"]["effects"],
  transformFileSystem: (fs: FileSystem.FileSystem) => FileSystem.FileSystem = (fs) => fs
) {
  return previewEvents(fixture, [event], effects, 1, transformFileSystem);
}

async function previewEvents(
  fixture: string,
  events: readonly object[],
  effects: RuleFixFacts["fix"]["effects"],
  terminalFound: number,
  transformFileSystem: (fs: FileSystem.FileSystem) => FileSystem.FileSystem = (fs) => fs
) {
  const fix: RuleFixFacts = {
    id: "preview",
    lane: "enforced",
    message: "preview",
    pathCoverage: [{ kind: "exact-path", patterns: ["scan/**"] }],
    scanRoots: ["scan"],
    patternName: "preview_pattern",
    fix: { kind: "preview-only", pattern: ".habitat/fix.pattern.md", effects: [...effects] },
  };
  const base = makeTestRuleFacts();
  const selector = base.selector[0];
  if (!selector) throw new Error("expected selector fixture");
  const facts = { ...base, fix: [fix], selector: [{ ...selector, id: fix.id }] };
  const grit = makeFakeGritCommandService(
    (request) =>
      makeHabitatCommandResult(request, {
        stdout: captureOutput(jsonl(...events, allDone(1, terminalFound))),
      }),
    { repoRoot: fixture }
  );
  return Effect.runPromise(
    Effect.gen(function* () {
      const fs = transformFileSystem(yield* FileSystem.FileSystem);
      const service = makeGritRuleFixPreviewService(
        facts,
        makeGritRuleFixPreviewRunner({ repoRoot: fixture, grit, fs })
      );
      return yield* service.preview({});
    }).pipe(Effect.provide(NodeContext.layer))
  );
}

describe("Grit immutable root planning", () => {
  test("plans each selected rule once and exposes unmatched rules", async () => {
    const alpha = rule("alpha", "alpha_pattern", providerPattern, [providerRoot]);
    const docs = rule("docs", "docs_pattern", docsPattern, ["docs"], "apply-dry-run");
    const plans = await Effect.runPromise(
      planGritRuleRoots([alpha, docs], { repoRoot, scanRoots: [providerFile] }).pipe(
        withNodeContext
      )
    );
    expect(plans).toHaveLength(2);
    expect(plans[0]).toMatchObject({ kind: "execute", rule: { id: "alpha" } });
    expect(plans[1]).toEqual({
      kind: "not-applicable",
      rule: docs,
      reason: "no-matched-scan-roots",
    });

    const absolutePlans = await Effect.runPromise(
      planGritRuleRoots([alpha], {
        repoRoot,
        scanRoots: [path.join(repoRoot, providerFile)],
      }).pipe(withNodeContext)
    );
    expect(absolutePlans[0]).toMatchObject({
      kind: "execute",
      roots: [path.join(repoRoot, providerFile)],
    });
  });

  test("does not fall back from disjoint or all-unmatched explicit roots", async () => {
    const alpha = rule("alpha", "alpha_pattern", providerPattern, [providerRoot]);
    const disjoint = await Effect.runPromise(
      planGritRuleRoots([alpha], { repoRoot, scanRoots: ["docs"] }).pipe(withNodeContext)
    );
    expect(disjoint[0]).toMatchObject({
      kind: "not-applicable",
      reason: "no-matched-scan-roots",
    });
    const unmatched = await Effect.runPromise(
      planGritRuleRoots([alpha], { repoRoot, scanRoots: [] }).pipe(withNodeContext)
    );
    expect(unmatched[0]).toMatchObject({
      kind: "not-applicable",
      reason: "no-matched-scan-roots",
    });
  });

  test("treats equivalent repository-root declarations as one root authority", async () => {
    for (const declaredRoot of [".", "", "nested/.."] as const) {
      const selected = rule("root", "root_pattern", providerPattern, [declaredRoot]);
      const defaultPlan = await Effect.runPromise(
        planGritRuleRoots([selected], { repoRoot }).pipe(withNodeContext)
      );
      expect(defaultPlan[0]).toMatchObject({ kind: "execute", roots: [repoRoot] });

      const childPlan = await Effect.runPromise(
        planGritRuleRoots([selected], { repoRoot, scanRoots: [providerFile] }).pipe(withNodeContext)
      );
      expect(childPlan[0]).toMatchObject({
        kind: "execute",
        roots: [path.join(repoRoot, providerFile)],
      });
    }

    const rootRule = rule("root", "root_pattern", providerPattern, ["."]);
    const outside = await Effect.runPromise(
      planGritRuleRoots([rootRule], { repoRoot, scanRoots: ["../outside"] }).pipe(withNodeContext)
    );
    expect(outside[0]).toMatchObject({
      kind: "refused",
      decision: { reason: "outside-repo" },
    });
    const absoluteOutside = await Effect.runPromise(
      planGritRuleRoots([rootRule], {
        repoRoot,
        scanRoots: [path.resolve(repoRoot, "../outside")],
      }).pipe(withNodeContext)
    );
    expect(absoluteOutside[0]).toMatchObject({
      kind: "refused",
      decision: { reason: "outside-repo" },
    });
    const protectedRoot = await Effect.runPromise(
      planGritRuleRoots([rootRule], { repoRoot, scanRoots: ["node_modules"] }).pipe(withNodeContext)
    );
    expect(protectedRoot[0]).toMatchObject({
      kind: "refused",
      decision: { reason: "protected-root" },
    });
  });

  test("keeps child and multiple roots immutable and refuses invalid roots", async () => {
    const alpha = rule("alpha", "alpha_pattern", providerPattern, [providerRoot]);
    const plans = await Effect.runPromise(
      planGritRuleRoots([alpha], {
        repoRoot,
        scanRoots: [providerFile, `${providerRoot}/output.ts`, providerFile],
      }).pipe(withNodeContext)
    );
    const plan = plans[0];
    expect(plan).toMatchObject({ kind: "execute" });
    const plannedRoots = Match.value(plan).pipe(
      Match.when({ kind: "execute" }, ({ roots }) => roots),
      Match.orElse(() => [])
    );
    expect(plannedRoots).toHaveLength(2);
    expect(plannedRoots.every(path.isAbsolute)).toBe(true);

    const missing = rule("missing", "missing_pattern", providerPattern, ["missing-root"]);
    const missingPlans = await Effect.runPromise(
      planGritRuleRoots([missing], { repoRoot }).pipe(withNodeContext)
    );
    expect(missingPlans[0]).toMatchObject({
      kind: "refused",
      decision: { reason: "missing" },
    });
    const outside = rule("outside", "outside_pattern", providerPattern, [".."]);
    const outsidePlans = await Effect.runPromise(
      planGritRuleRoots([outside], { repoRoot }).pipe(withNodeContext)
    );
    expect(outsidePlans[0]).toMatchObject({
      kind: "refused",
      decision: { reason: "outside-repo" },
    });
    const protectedRule = rule("protected", "protected_pattern", providerPattern, ["node_modules"]);
    const protectedPlans = await Effect.runPromise(
      planGritRuleRoots([protectedRule], { repoRoot }).pipe(withNodeContext)
    );
    expect(protectedPlans[0]).toMatchObject({
      kind: "refused",
    });
  });

  test("refuses lexical outside roots before probing the candidate or running Grit", async () => {
    const selected = rule("outside", "outside_pattern", providerPattern, ["../outside"]);
    const fileSystemEvents: string[] = [];
    const observedCommands: HabitatProcessRequest[] = [];
    const fileSystem = FileSystem.layerNoop({
      realPath: (target) =>
        Effect.succeed(recordAndReturn(fileSystemEvents, `realPath:${target}`, target)),
      exists: (target) =>
        Effect.succeed(recordAndReturn(fileSystemEvents, `exists:${target}`, true)),
    });
    const grit = makeFakeGritCommandService(
      (request) => recordAndReturn(observedCommands, request, makeHabitatCommandResult(request)),
      { repoRoot }
    );

    const outcomes = await Effect.runPromise(
      runGritDiagnosticOutcomesEffect([selected], { repoRoot, grit }).pipe(
        Effect.provide(fileSystem)
      )
    );

    expect(outcomes.get("outside")).toMatchObject({
      kind: "scan-root-refused",
      decision: { reason: "outside-repo", root: "../outside" },
    });
    expect(fileSystemEvents).toEqual([`realPath:${repoRoot}`]);
    expect(observedCommands).toEqual([]);

    const executions = await Effect.runPromise(
      runGritRulesEffect([selected], { repoRoot, grit }).pipe(Effect.provide(fileSystem))
    );
    const execution = executions.get("outside");
    expect(execution).toMatchObject({
      kind: "refused",
      decision: { reason: "outside-repo", root: "../outside" },
    });
    expect(observedCommands).toEqual([]);
  });

  test.runIf(process.platform === "win32")(
    "refuses cross-volume authority roots before probing the candidate",
    async () => {
      const alternateDrive = Match.value(
        path.parse(repoRoot).root.toLowerCase().startsWith("c:")
      ).pipe(
        Match.when(true, () => "D:"),
        Match.orElse(() => "C:")
      );
      const crossVolumeRoot = path.join(alternateDrive, "outside");
      const selected = rule("outside", "outside_pattern", providerPattern, [crossVolumeRoot]);
      const fileSystemEvents: string[] = [];
      const fileSystem = FileSystem.layerNoop({
        realPath: (target) =>
          Effect.succeed(recordAndReturn(fileSystemEvents, `realPath:${target}`, target)),
        exists: (target) =>
          Effect.succeed(recordAndReturn(fileSystemEvents, `exists:${target}`, true)),
      });

      const plans = await Effect.runPromise(
        planGritRuleRoots([selected], { repoRoot }).pipe(Effect.provide(fileSystem))
      );

      expect(plans[0]).toMatchObject({
        kind: "refused",
        decision: { reason: "outside-repo", root: crossVolumeRoot },
      });
      expect(fileSystemEvents).toEqual([`realPath:${repoRoot}`]);
    }
  );

  test("reapplies authority to canonical symlink roots", async () => {
    const fixture = mkdtempSync(path.join(tmpdir(), "habitat-grit-roots-"));
    const outside = mkdtempSync(path.join(tmpdir(), "habitat-grit-outside-"));
    try {
      mkdirSync(path.join(fixture, "actual"));
      mkdirSync(path.join(fixture, "node_modules"));
      symlinkSync(path.join(fixture, "actual"), path.join(fixture, "alias"));
      symlinkSync(outside, path.join(fixture, "outside-alias"));
      symlinkSync(path.join(fixture, "node_modules"), path.join(fixture, "protected-alias"));

      const notApproved = rule("alias", "alias_pattern", providerPattern, ["alias"]);
      const notApprovedPlans = await Effect.runPromise(
        planGritRuleRoots([notApproved], { repoRoot: fixture }).pipe(withNodeContext)
      );
      expect(notApprovedPlans[0]).toMatchObject({
        kind: "refused",
        decision: { reason: "not-approved", root: "actual" },
      });
      const outsideRule = rule("outside", "outside_pattern", providerPattern, ["outside-alias"]);
      const outsidePlans = await Effect.runPromise(
        planGritRuleRoots([outsideRule], { repoRoot: fixture }).pipe(withNodeContext)
      );
      expect(outsidePlans[0]).toMatchObject({
        kind: "refused",
        decision: { reason: "outside-repo" },
      });
      const protectedRule = rule("protected", "protected_pattern", providerPattern, [
        "protected-alias",
      ]);
      const protectedPlans = await Effect.runPromise(
        planGritRuleRoots([protectedRule], { repoRoot: fixture }).pipe(withNodeContext)
      );
      expect(protectedPlans[0]).toMatchObject({
        kind: "refused",
        decision: { reason: "protected-root", root: "node_modules" },
      });
    } finally {
      rmSync(fixture, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });
});

describe("Grit generic acquisition and public disposition", () => {
  test("builds a direct-native hermetic check request and cleans scoped state", async () => {
    const selected = rule("alpha", "alpha_pattern", providerPattern, [providerRoot]);
    let observedRequest: HabitatProcessRequest | undefined;
    const grit = makeFakeGritCommandService(
      (request) => {
        observedRequest = request;
        return makeHabitatCommandResult(request, {
          stderr: captureOutput(
            jsonDocument(checkReport(path.join(repoRoot, providerFile), "alpha_pattern"))
          ),
        });
      },
      { repoRoot }
    );
    const outcomes = await Effect.runPromise(
      runGritDiagnosticOutcomesEffect([selected], { repoRoot, grit }).pipe(
        Effect.provide(NodeContext.layer)
      )
    );
    expect(outcomes.get("alpha")?.kind).toBe("findings");
    expect(observedRequest?.executable).toBe(pinnedGritNativePath(repoRoot));
    expect(observedRequest?.argv).toContain("--no-cache");
    expect(observedRequest?.argv).toContain("--grit-dir");
    expect(observedRequest?.env).toMatchObject({
      GRIT_DOWNLOADS_DISABLED: "true",
      GRIT_TELEMETRY_DISABLED: "true",
      GRIT_MAX_FILE_SIZE_BYTES: "0",
    });
    expect(observedRequest?.cwd).not.toBe(repoRoot);
    expect(existsSync(observedRequest?.cwd ?? repoRoot)).toBe(false);
  });

  test("preserves typed unavailable, identity, nonzero, and interrupted command evidence", async () => {
    const selected = rule("alpha", "alpha_pattern", providerPattern, [providerRoot]);
    const root = path.join(repoRoot, providerRoot);
    const base = fakeCheckProvider(checkReport(path.join(repoRoot, providerFile), "alpha_pattern"));
    const cases = [
      {
        kind: "typed-unavailable" as const,
        expectedFailure: "DiagnosticProviderUnavailable",
        expectedCommand: { kind: "tool-unavailable" },
      },
      {
        kind: "typed-identity" as const,
        expectedFailure: "DiagnosticProviderIdentityMismatch",
        expectedCommand: { kind: "tool-unavailable" },
      },
      {
        kind: "returned-failed" as const,
        expectedFailure: "DiagnosticCommandFailed",
        expectedCommand: { kind: "failed" },
      },
      {
        kind: "typed-interrupted" as const,
        expectedFailure: "DiagnosticCommandInterrupted",
        expectedCommand: { kind: "interrupted", timeoutMs: 4321 },
      },
    ] as const;
    for (const fixture of cases) {
      const observed: HabitatProcessRequest[] = [];
      const grit = {
        ...base,
        check: (providerRequest: Parameters<typeof base.check>[0]) => {
          const command = base.checkRequest(providerRequest);
          observed.push(command);
          return Match.value(fixture.kind).pipe(
            Match.when("typed-unavailable", () =>
              Effect.fail(
                new CommandUnavailable({
                  commandId: command.commandId,
                  executable: command.executable,
                  argv: command.argv,
                  cwd: command.cwd,
                  cause: "binary absent",
                })
              )
            ),
            Match.when("typed-identity", () =>
              Effect.fail(nativeIdentityMismatchBeforeSpawn(command, "typed native drift"))
            ),
            Match.when("returned-failed", () =>
              Effect.succeed(
                makeHabitatCommandResult(command, {
                  exit: { code: 7, signal: null, interrupted: false },
                  stdout: captureOutput("correct-looking output"),
                })
              )
            ),
            Match.when("typed-interrupted", () =>
              Effect.fail(
                new CommandInterrupted({
                  commandId: command.commandId,
                  executable: command.executable,
                  argv: command.argv,
                  cwd: command.cwd,
                  timeoutMs: 4321,
                  signal: "SIGTERM",
                  cause: "timed out",
                })
              )
            ),
            Match.exhaustive
          );
        },
      };
      const acquisition = await Effect.runPromise(
        runGritCheckAcquisitionEffect(selected, [root], {
          repoRoot,
          grit,
        }).pipe(Effect.scoped, Effect.provide(NodeContext.layer))
      );
      expect(acquisition).toMatchObject({
        kind: "command-failed",
        failure: fixture.expectedFailure,
        command: fixture.expectedCommand,
      });
      expectAcquisitionCwd(acquisition, observed);
    }

    const returnedInterruptedObserved: HabitatProcessRequest[] = [];
    const returnedInterrupted = await Effect.runPromise(
      runGritCheckAcquisitionEffect(selected, [root], {
        repoRoot,
        grit: makeFakeGritCommandService(
          (command) => {
            returnedInterruptedObserved.push(command);
            return makeHabitatCommandResult(command, {
              exit: { code: 37, signal: "SIGTERM", interrupted: true },
              stdout: captureOutput("partial output"),
            });
          },
          { repoRoot }
        ),
      }).pipe(Effect.scoped, Effect.provide(NodeContext.layer))
    );
    expect(returnedInterrupted).toMatchObject({
      kind: "command-failed",
      failure: "DiagnosticCommandInterrupted",
      command: {
        kind: "interrupted",
        exit: { code: 37, signal: "SIGTERM", interrupted: true },
        output: { stdout: { bytes: 14, truncated: false } },
      },
    });
    expect(Value.Check(GritDiagnosticAcquisitionSchema, returnedInterrupted)).toBe(true);
    expectAcquisitionCwd(returnedInterrupted, returnedInterruptedObserved);

    const completed = await Effect.runPromise(
      runGritCheckAcquisitionEffect(selected, [root], { repoRoot, grit: base }).pipe(
        Effect.scoped,
        Effect.provide(NodeContext.layer)
      )
    );
    expect(completed).toMatchObject({ kind: "observed-complete", command: { kind: "completed" } });
  });

  test("classifies preflight states before identity and preserves the target request", async () => {
    const selected = rule("alpha", "alpha_pattern", providerPattern, [providerRoot]);
    const root = path.join(repoRoot, providerRoot);
    const failures = [
      {
        kind: "unavailable" as const,
        expectedFailure: "DiagnosticProviderUnavailable",
        expectedCommand: "tool-unavailable",
      },
      {
        kind: "nonzero" as const,
        expectedFailure: "DiagnosticCommandFailed",
        expectedCommand: "failed",
      },
      {
        kind: "interrupted" as const,
        expectedFailure: "DiagnosticCommandInterrupted",
        expectedCommand: "interrupted",
      },
      {
        kind: "wrong-version" as const,
        expectedFailure: "DiagnosticProviderIdentityMismatch",
        expectedCommand: "completed",
      },
      {
        kind: "wrong-stream" as const,
        expectedFailure: "DiagnosticProviderIdentityMismatch",
        expectedCommand: "completed",
      },
      {
        kind: "truncated" as const,
        expectedFailure: "DiagnosticProviderIdentityMismatch",
        expectedCommand: "completed",
      },
    ];

    for (const fixture of failures) {
      const observed: HabitatProcessRequest[] = [];
      const runner = {
        run: (request: HabitatProcessRequest) =>
          preflightScenarioEffect(fixture.kind, recordAndReturn(observed, request, request)),
        runSync: (request: HabitatProcessRequest) => makeHabitatCommandResult(request),
      };
      const acquisition = await Effect.runPromise(
        makeGritCommandTestService(runner).pipe(
          Effect.flatMap((grit) =>
            Effect.scoped(runGritCheckAcquisitionEffect(selected, [root], { repoRoot, grit }))
          ),
          Effect.provide(NodeContext.layer)
        )
      );

      expect(acquisition).toMatchObject({
        kind: "command-failed",
        failure: fixture.expectedFailure,
        request: { commandInvocationId: "grit-selected-rule-json-check" },
        command: {
          kind: fixture.expectedCommand,
          commandId: "grit-pinned-native-preflight",
          executable: pinnedGritNativePath(repoRoot),
          argv: ["--version"],
          scanRoots: [],
        },
      });
      expect(observed.map(({ commandId }) => commandId)).toEqual(["grit-pinned-native-preflight"]);
      expectAcquisitionCwd(acquisition, observed, 0, false);
    }

    const observed: HabitatProcessRequest[] = [];
    const passingRunner = {
      run: (request: HabitatProcessRequest) =>
        preflightScenarioEffect("exact", recordAndReturn(observed, request, request)),
      runSync: (request: HabitatProcessRequest) => makeHabitatCommandResult(request),
    };
    const completed = await Effect.runPromise(
      makeGritCommandTestService(passingRunner).pipe(
        Effect.flatMap((grit) =>
          Effect.scoped(runGritCheckAcquisitionEffect(selected, [root], { repoRoot, grit }))
        ),
        Effect.provide(NodeContext.layer)
      )
    );
    expect(completed).toMatchObject({
      kind: "observed-complete",
      request: { commandInvocationId: "grit-selected-rule-json-check" },
      command: { kind: "completed", commandId: "grit-selected-rule-json-check" },
    });
    expect(observed.map(({ commandId }) => commandId)).toEqual([
      "grit-pinned-native-preflight",
      "grit-selected-rule-json-check",
    ]);
    expect(observed[0]?.timeoutMs).toEqual(observed[1]?.timeoutMs);
    expect(observed[0]?.timeoutMs).toBeGreaterThan(0);
    expectAcquisitionCwd(completed, observed, 1);
  });

  test("preflights lazily once per realized provider under concurrent target demand", async () => {
    const observed: HabitatProcessRequest[] = [];
    const runner = {
      run: (request: HabitatProcessRequest) =>
        preflightScenarioEffect("exact", recordAndReturn(observed, request, request)),
      runSync: (request: HabitatProcessRequest) => makeHabitatCommandResult(request),
    };
    const request = {
      scanRoots: [providerRoot] as const,
      cwd: repoRoot,
      gritDir: path.join(repoRoot, ".grit"),
      cacheDir: path.join(repoRoot, ".cache"),
      gritUserConfigDir: path.join(repoRoot, ".grit-user"),
      timeoutMs: 123,
    };
    const realization = makeGritCommandTestService(runner).pipe(
      Effect.flatMap((grit) =>
        Effect.all([grit.check(request), grit.check(request)], { concurrency: 2 })
      )
    );

    await Effect.runPromise(realization);
    expect(observed.map(({ commandId }) => commandId)).toEqual([
      "grit-pinned-native-preflight",
      "grit-selected-rule-json-check",
      "grit-selected-rule-json-check",
    ]);
    expect(observed[0]?.timeoutMs).toBe(defaultGritCommandTimeoutMs);
    expect(observed.slice(1).map(({ timeoutMs }) => timeoutMs)).toEqual([123, 123]);

    await Effect.runPromise(realization);
    expect(
      observed.filter(({ commandId }) => commandId === "grit-pinned-native-preflight")
    ).toHaveLength(2);
  });

  test("retries a failed preflight and reuses the first successful observation", async () => {
    const selected = rule("alpha", "alpha_pattern", providerPattern, [providerRoot]);
    const root = path.join(repoRoot, providerRoot);
    const observed: HabitatProcessRequest[] = [];
    const runner = {
      run: (request: HabitatProcessRequest) =>
        preflightScenarioEffect(
          retryPreflightScenario(observed, request),
          recordAndReturn(observed, request, request)
        ),
      runSync: (request: HabitatProcessRequest) => makeHabitatCommandResult(request),
    };
    const [first, second, third] = await Effect.runPromise(
      Effect.gen(function* () {
        const grit = yield* makeGritCommandTestService(runner);
        return yield* Effect.forEach([0, 1, 2], () =>
          Effect.scoped(runGritCheckAcquisitionEffect(selected, [root], { repoRoot, grit }))
        );
      }).pipe(Effect.provide(NodeContext.layer))
    );

    expect(first).toMatchObject({
      kind: "command-failed",
      failure: "DiagnosticProviderUnavailable",
    });
    expect(second).toMatchObject({ kind: "observed-complete" });
    expect(third).toMatchObject({ kind: "observed-complete" });
    expect(
      observed.filter(({ commandId }) => commandId === "grit-pinned-native-preflight")
    ).toHaveLength(2);
    expect(
      observed.filter(({ commandId }) => commandId === "grit-selected-rule-json-check")
    ).toHaveLength(2);
  });

  test("normalizes null and blank native messages to manifest authority", async () => {
    const selected = rule("alpha", "alpha_pattern", providerPattern, [providerRoot]);
    for (const message of [null, "", "   \n"] as const) {
      const report = checkReport(
        path.join(repoRoot, providerFile),
        "alpha_pattern",
        undefined,
        message
      );
      const outcomes = await Effect.runPromise(
        runGritDiagnosticOutcomesEffect([selected], {
          repoRoot,
          grit: fakeCheckProvider(report),
        }).pipe(Effect.provide(NodeContext.layer))
      );
      expect(outcomes.get("alpha")).toMatchObject({
        kind: "findings",
        diagnostics: [{ message: "alpha finding" }],
      });
    }
  });

  test("requires top-level absolute processed paths and exact root coverage", async () => {
    const selected = rule("alpha", "alpha_pattern", providerPattern, [providerRoot]);
    const cases = [
      { paths: [], resultPath: path.join(repoRoot, providerFile), signal: "no-processed-paths" },
      { paths: [providerFile], resultPath: providerFile, signal: "relative-processed-path" },
      {
        paths: [path.join(repoRoot, providerFile)],
        resultPath: providerFile,
        signal: "relative-result-path",
      },
      {
        paths: [path.join(repoRoot, "docs/PRODUCT.md")],
        resultPath: path.join(repoRoot, "docs/PRODUCT.md"),
        signal: "path-escape",
      },
    ];
    for (const fixture of cases) {
      const grit = fakeCheckProvider(
        checkReport(fixture.resultPath, "alpha_pattern", fixture.paths)
      );
      const outcomes = await Effect.runPromise(
        runGritDiagnosticOutcomesEffect([selected], { repoRoot, grit }).pipe(
          Effect.provide(NodeContext.layer)
        )
      );
      expect(outcomes.get("alpha")).toMatchObject({
        kind: "provider-failed",
        failure: "DiagnosticOutputIncomplete",
        detail: expect.stringContaining(fixture.signal),
      });
    }
  });

  test("rejects conflicting and unexpected check identities", async () => {
    const selected = rule("alpha", "alpha_pattern", providerPattern, [providerRoot]);
    for (const report of [
      checkReport(path.join(repoRoot, providerFile), "beta_pattern"),
      {
        ...checkReport(path.join(repoRoot, providerFile), "alpha_pattern"),
        results: [
          {
            ...checkReport(path.join(repoRoot, providerFile), "alpha_pattern").results[0],
            check_id: "#beta_pattern/js",
          },
        ],
      },
    ]) {
      const outcomes = await Effect.runPromise(
        runGritDiagnosticOutcomesEffect([selected], {
          repoRoot,
          grit: fakeCheckProvider(report),
        }).pipe(Effect.provide(NodeContext.layer))
      );
      expect(outcomes.get("alpha")).toMatchObject({
        kind: "provider-failed",
        failure: "DiagnosticUnexpectedIdentity",
      });
    }
  });

  test("carries no-matched-scan-roots as a required provider disposition", async () => {
    const alpha = rule("alpha", "alpha_pattern", providerPattern, [providerRoot]);
    const docs = rule("docs", "docs_pattern", docsPattern, ["docs"], "apply-dry-run");
    const grit = fakeCheckProvider(checkReport(path.join(repoRoot, providerFile), "alpha_pattern"));
    const executions = await Effect.runPromise(
      runGritRulesEffect([alpha, docs], {
        repoRoot,
        grit,
        scanRoots: [providerFile],
      }).pipe(Effect.provide(NodeContext.layer))
    );
    expect(executions.get("alpha")).toMatchObject({ kind: "executed" });
    expect(executions.get("docs")).toMatchObject({
      kind: "not-applicable",
      reason: "no-matched-scan-roots",
    });
  });

  test("exposes acquisition failure as failed rather than executed", async () => {
    const selected = {
      ...rule("advisory", "advisory_pattern", providerPattern, [providerRoot]),
      lane: "advisory" as const,
    };
    const grit = makeFakeGritCommandService(
      (request) =>
        makeHabitatCommandResult(request, {
          exit: { code: 9, signal: null, interrupted: false },
        }),
      { repoRoot }
    );
    const executions = await Effect.runPromise(
      runGritRulesEffect([selected], { repoRoot, grit }).pipe(Effect.provide(NodeContext.layer))
    );
    expect(executions.get(selected.id)).toMatchObject({
      kind: "failed",
      failure: "DiagnosticCommandFailed",
      diagnostics: [{ message: expect.stringContaining("DiagnosticCommandFailed") }],
    });
  });

  test("propagates repository-root canonicalization failure without running a command", async () => {
    const missingRepo = path.join(tmpdir(), `habitat-grit-missing-repo-${process.pid}`);
    rmSync(missingRepo, { recursive: true, force: true });
    let commandCalled = false;
    const selected = rule("root-failure", "root_failure", providerPattern, ["src"]);
    const grit = makeFakeGritCommandService(
      (request) => {
        commandCalled = true;
        return makeHabitatCommandResult(request);
      },
      { repoRoot: missingRepo }
    );
    const executions = await Effect.runPromise(
      runGritRulesEffect([selected], { repoRoot: missingRepo, grit }).pipe(withNodeContext)
    );

    expect(executions.get(selected.id)).toMatchObject({
      kind: "failed",
      failure: "DiagnosticScopePlanningFailed",
      diagnostics: [{ message: expect.stringContaining("DiagnosticScopePlanningFailed") }],
    });
    expect(commandCalled).toBe(false);
  });

  test("executes one immutable catalog per rule without cross-catalog leakage", async () => {
    const alpha = rule("alpha", "alpha_pattern", providerPattern, [providerRoot]);
    const beta = rule("beta", "beta_pattern", providerPattern, [providerRoot]);
    const catalogs: string[] = [];
    const grit = makeFakeGritCommandService(
      (request) => {
        catalogs.push(readFileSync(path.join(request.cwd, ".grit/grit.yaml"), "utf8"));
        return makeHabitatCommandResult(request, {
          stderr: captureOutput(
            jsonDocument({ paths: [path.join(repoRoot, providerFile)], results: [] })
          ),
        });
      },
      { repoRoot }
    );
    const executions = await Effect.runPromise(
      runGritRulesEffect([alpha, beta], { repoRoot, grit }).pipe(Effect.provide(NodeContext.layer))
    );
    expect([...executions.values()].every((execution) => execution.kind === "executed")).toBe(true);
    expect(catalogs).toHaveLength(2);
    const alphaCatalog = catalogs.find((catalog) => catalog.includes("alpha_pattern"));
    const betaCatalog = catalogs.find((catalog) => catalog.includes("beta_pattern"));
    expect(alphaCatalog).toBeDefined();
    expect(alphaCatalog).not.toContain("beta_pattern");
    expect(betaCatalog).toBeDefined();
    expect(betaCatalog).not.toContain("alpha_pattern");
  });

  test("dispatches apply dry-run from manifest policy without rule-id branching", async () => {
    const selected = rule(
      "ordinary-docs-rule",
      "ordinary_docs_pattern",
      docsPattern,
      ["docs"],
      "apply-dry-run"
    );
    let kind: string | undefined;
    const finding = path.join(repoRoot, "docs/PRODUCT.md");
    const grit = makeFakeGritCommandService(
      (request, providerRequest) => {
        kind = providerRequest.kind;
        return makeHabitatCommandResult(request, {
          stdout: captureOutput(jsonl(rewriteEvent(finding, 1), allDone(1, 1))),
        });
      },
      { repoRoot }
    );
    const outcomes = await Effect.runPromise(
      runGritDiagnosticOutcomesEffect([selected], { repoRoot, grit }).pipe(
        Effect.provide(NodeContext.layer)
      )
    );
    expect(kind).toBe("apply-dry-run");
    expect(outcomes.get(selected.id)).toMatchObject({
      kind: "findings",
      diagnostics: [{ path: "docs/PRODUCT.md" }],
    });
  });

  test("blocks only analysis failures inside exact rule coverage", async () => {
    const selected = rule("docs", "docs_pattern", docsPattern, ["docs"], "apply-dry-run");
    const outside = await Effect.runPromise(
      runGritDiagnosticOutcomesEffect([selected], {
        repoRoot,
        grit: fakeApplyProviderWithAnalysisLog(path.join(repoRoot, providerFile)),
      }).pipe(Effect.provide(NodeContext.layer))
    );
    expect(outside.get(selected.id)).toMatchObject({ kind: "clean" });

    const inside = await Effect.runPromise(
      runGritDiagnosticOutcomesEffect([selected], {
        repoRoot,
        grit: fakeApplyProviderWithAnalysisLog(path.join(repoRoot, "docs/PRODUCT.md")),
      }).pipe(Effect.provide(NodeContext.layer))
    );
    expect(inside.get(selected.id)).toMatchObject({
      kind: "provider-failed",
      failure: "DiagnosticOutputIncomplete",
      detail: expect.stringContaining("analysis-failure"),
    });
  });

  test("canonicalizes analysis paths before applying the exact-coverage exception", async () => {
    const fixture = mkdtempSync(path.join(tmpdir(), "habitat-grit-analysis-path-"));
    try {
      mkdirSync(path.join(fixture, ".habitat"));
      mkdirSync(path.join(fixture, "docs"));
      mkdirSync(path.join(fixture, "outside-coverage"));
      writeFileSync(
        path.join(fixture, ".habitat/pattern.md"),
        readFileSync(path.join(repoRoot, providerPattern), "utf8")
      );
      writeFileSync(path.join(fixture, "docs/covered.ts"), "export const covered = true;\n");
      writeFileSync(
        path.join(fixture, "outside-coverage/uncovered.ts"),
        "export const uncovered = true;\n"
      );
      symlinkSync(
        path.join(fixture, "docs/covered.ts"),
        path.join(fixture, "outside-coverage/covered-alias.ts")
      );
      const selected = rule(
        "analysis-path",
        "analysis_path",
        ".habitat/pattern.md",
        ["docs"],
        "apply-dry-run"
      );

      const aliasedCovered = await Effect.runPromise(
        runGritDiagnosticOutcomesEffect([selected], {
          repoRoot: fixture,
          grit: fakeApplyProviderWithAnalysisLog(
            path.join(fixture, "outside-coverage/covered-alias.ts"),
            fixture
          ),
        }).pipe(Effect.provide(NodeContext.layer))
      );
      expect(aliasedCovered.get(selected.id)).toMatchObject({
        kind: "provider-failed",
        detail: expect.stringContaining("analysis-failure"),
      });

      const canonicalOutside = await Effect.runPromise(
        runGritDiagnosticOutcomesEffect([selected], {
          repoRoot: fixture,
          grit: fakeApplyProviderWithAnalysisLog(
            path.join(fixture, "outside-coverage/uncovered.ts"),
            fixture
          ),
        }).pipe(Effect.provide(NodeContext.layer))
      );
      expect(canonicalOutside.get(selected.id)).toMatchObject({ kind: "clean" });
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });

  test("rejects canonical findings outside registered exact coverage", async () => {
    const selected = {
      ...rule("docs", "docs_pattern", docsPattern, ["docs"], "apply-dry-run"),
      pathCoverage: [{ kind: "exact-path" as const, patterns: ["docs/PRODUCT.md"] }],
    };
    const finding = path.join(repoRoot, "docs/SYSTEM.md");
    const grit = makeFakeGritCommandService(
      (request) =>
        makeHabitatCommandResult(request, {
          stdout: captureOutput(jsonl(rewriteEvent(finding, 1), allDone(1, 1))),
        }),
      { repoRoot }
    );

    const outcomes = await Effect.runPromise(
      runGritDiagnosticOutcomesEffect([selected], { repoRoot, grit }).pipe(
        Effect.provide(NodeContext.layer)
      )
    );
    expect(outcomes.get(selected.id)).toMatchObject({
      kind: "provider-failed",
      failure: "DiagnosticOutputIncomplete",
      detail: expect.stringContaining("outside-exact-coverage"),
    });
  });

  test.runIf(process.platform === "win32")(
    "rejects cross-volume paths at the shared provider containment boundary",
    () => {
      expect(pathIsWithinRoot("D:\\outside\\file.ts", "C:\\repo")).toBe(false);
    }
  );

  test("blocks ambiguous relative CreateFile paths after establishing their count", async () => {
    const selected = rule("create", "create_pattern", docsPattern, ["docs"], "apply-dry-run");
    const grit = makeFakeGritCommandService(
      (request) =>
        makeHabitatCommandResult(request, {
          stdout: captureOutput(jsonl(createFileEvent("new.md"), allDone(1, 1))),
        }),
      { repoRoot }
    );
    const outcomes = await Effect.runPromise(
      runGritDiagnosticOutcomesEffect([selected], { repoRoot, grit }).pipe(
        Effect.provide(NodeContext.layer)
      )
    );
    expect(outcomes.get("create")).toMatchObject({
      kind: "provider-failed",
      failure: "DiagnosticOutputIncomplete",
      detail: expect.stringContaining("create-file-path-base-ambiguous"),
    });
  });

  test("canonicalizes CreateFile leaves and parents before admitting their paths", async () => {
    const fixture = mkdtempSync(path.join(tmpdir(), "habitat-grit-create-parent-"));
    const outside = mkdtempSync(path.join(tmpdir(), "habitat-grit-create-parent-outside-"));
    try {
      mkdirSync(path.join(fixture, ".habitat"));
      mkdirSync(path.join(fixture, "scan"));
      writeFileSync(
        path.join(fixture, ".habitat/pattern.md"),
        readFileSync(path.join(repoRoot, providerPattern), "utf8")
      );
      writeFileSync(path.join(outside, "existing.ts"), "export const outside = true;\n");
      symlinkSync(outside, path.join(fixture, "scan/escaped-parent"));
      symlinkSync(path.join(outside, "existing.ts"), path.join(fixture, "scan/existing.ts"));
      symlinkSync(path.join(outside, "missing.ts"), path.join(fixture, "scan/broken.ts"));
      const selected = rule(
        "create",
        "create_pattern",
        ".habitat/pattern.md",
        ["scan"],
        "apply-dry-run"
      );
      const cases = [
        {
          path: path.join(fixture, "scan/existing.ts"),
          detail: "symlink-collision",
        },
        {
          path: path.join(fixture, "scan/broken.ts"),
          detail: "symlink-collision",
        },
        {
          path: path.join(fixture, "scan/escaped-parent/new.ts"),
          detail: "path-escape",
        },
        {
          path: path.join(fixture, "scan/missing-parent/new.ts"),
          detail: "parent-unresolvable",
        },
      ];

      for (const observedPath of cases) {
        const grit = makeFakeGritCommandService(
          (request) =>
            makeHabitatCommandResult(request, {
              stdout: captureOutput(jsonl(createFileEvent(observedPath.path), allDone(1, 1))),
            }),
          { repoRoot: fixture }
        );
        const outcomes = await Effect.runPromise(
          runGritDiagnosticOutcomesEffect([selected], { repoRoot: fixture, grit }).pipe(
            Effect.provide(NodeContext.layer)
          )
        );
        expect(outcomes.get("create")).toMatchObject({
          kind: "provider-failed",
          failure: "DiagnosticOutputIncomplete",
          detail: expect.stringContaining(observedPath.detail),
        });
      }
    } finally {
      rmSync(fixture, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });

  test("rejects pattern, intermediate, and .habitat symlink escapes before command", async () => {
    const patternSource = readFileSync(path.join(repoRoot, providerPattern), "utf8");
    for (const escape of ["pattern", "intermediate", "habitat"] as const) {
      const fixture = mkdtempSync(path.join(tmpdir(), `habitat-grit-${escape}-`));
      const outside = mkdtempSync(path.join(tmpdir(), `habitat-grit-${escape}-outside-`));
      try {
        mkdirSync(path.join(fixture, "scan"));
        writeFileSync(path.join(fixture, "scan/subject.ts"), "const x = 1;\n");
        let pattern = ".habitat/pattern.md";
        if (escape === "habitat") {
          writeFileSync(path.join(outside, "pattern.md"), patternSource);
          symlinkSync(outside, path.join(fixture, ".habitat"));
        } else {
          mkdirSync(path.join(fixture, ".habitat"));
          if (escape === "pattern") {
            writeFileSync(path.join(outside, "pattern.md"), patternSource);
            symlinkSync(
              path.join(outside, "pattern.md"),
              path.join(fixture, ".habitat/pattern.md")
            );
          } else {
            mkdirSync(path.join(outside, "nested"));
            writeFileSync(path.join(outside, "nested/pattern.md"), patternSource);
            symlinkSync(path.join(outside, "nested"), path.join(fixture, ".habitat/link"));
            pattern = ".habitat/link/pattern.md";
          }
        }
        let commandCalled = false;
        const selected = rule("escape", "escape_pattern", pattern, ["scan"]);
        const grit = makeFakeGritCommandService(
          (request) => {
            commandCalled = true;
            return makeHabitatCommandResult(request, {
              stderr: captureOutput(
                jsonDocument({ paths: [path.join(fixture, "scan/subject.ts")], results: [] })
              ),
            });
          },
          { repoRoot: fixture }
        );
        const outcomes = await Effect.runPromise(
          runGritDiagnosticOutcomesEffect([selected], { repoRoot: fixture, grit }).pipe(
            Effect.provide(NodeContext.layer)
          )
        );
        expect(outcomes.get("escape")).toMatchObject({
          kind: "provider-failed",
          failure: "DiagnosticRuleMaterializationFailed",
        });
        expect(commandCalled).toBe(false);
      } finally {
        rmSync(fixture, { recursive: true, force: true });
        rmSync(outside, { recursive: true, force: true });
      }
    }
  });

  test("canonicalizes observed Match and Rewrite paths before containment", async () => {
    const fixture = mkdtempSync(path.join(tmpdir(), "habitat-grit-observed-path-"));
    const outside = mkdtempSync(path.join(tmpdir(), "habitat-grit-observed-outside-"));
    try {
      mkdirSync(path.join(fixture, ".habitat"));
      mkdirSync(path.join(fixture, "scan"));
      writeFileSync(
        path.join(fixture, ".habitat/pattern.md"),
        readFileSync(path.join(repoRoot, providerPattern), "utf8")
      );
      writeFileSync(path.join(outside, "subject.ts"), "const x = 1;\n");
      symlinkSync(outside, path.join(fixture, "scan/nested"));
      const escapedPath = path.join(fixture, "scan/nested/subject.ts");
      const selected = rule(
        "nested",
        "nested_pattern",
        ".habitat/pattern.md",
        ["scan"],
        "apply-dry-run"
      );
      for (const event of [matchEvent(escapedPath, 1), rewriteEvent(escapedPath, 1)]) {
        const grit = makeFakeGritCommandService(
          (request) =>
            makeHabitatCommandResult(request, {
              stdout: captureOutput(jsonl(event, allDone(1, 1))),
            }),
          { repoRoot: fixture }
        );
        const outcomes = await Effect.runPromise(
          runGritDiagnosticOutcomesEffect([selected], { repoRoot: fixture, grit }).pipe(
            Effect.provide(NodeContext.layer)
          )
        );
        expect(outcomes.get("nested")).toMatchObject({
          kind: "provider-failed",
          failure: "DiagnosticOutputIncomplete",
          detail: expect.stringContaining("path-escape"),
        });
      }
    } finally {
      rmSync(fixture, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });
});

function fakeCheckProvider(report: unknown) {
  const stderr = captureOutput(jsonDocument(report));
  return makeFakeGritCommandService((request) => makeHabitatCommandResult(request, { stderr }), {
    repoRoot,
  });
}

function recordAndReturn<Event, Value>(events: Event[], event: Event, value: Value): Value {
  events.push(event);
  return value;
}

function expectAcquisitionCwd(
  acquisition: GritDiagnosticAcquisition,
  observed: readonly HabitatProcessRequest[],
  observedIndex = 0,
  targetCommand = true
): void {
  const actual = observed[observedIndex];
  expect(actual).toBeDefined();
  if (!actual || !("request" in acquisition) || !("command" in acquisition)) {
    throw new Error("expected captured command acquisition with independently observed request");
  }
  expect(acquisition.request.cwd).toEqual(expect.any(String));
  if (targetCommand) expect(acquisition.request.cwd).toBe(actual.cwd);
  else expect(acquisition.request.cwd).not.toBe(actual.cwd);
  expect(acquisition.command.cwd).toBe(actual.cwd);
}

function makeGritCommandTestService(runner: CommandRunnerService) {
  const prerequisites = Layer.mergeAll(
    NodeContext.layer,
    Layer.succeed(CommandRunner, runner),
    makeHabitatConfigLayer(makeHabitatConfig({ repoRoot })),
    makeFakeGitStateProviderLayer(
      () => ({
        branch: null,
        head: null,
        dirty: false,
        statusShort: "",
        statusDigest: "test",
      }),
      { repoRoot }
    )
  );
  return makeGritCommandService(repoRoot).pipe(Effect.provide(prerequisites));
}

function retryPreflightScenario(
  observed: readonly HabitatProcessRequest[],
  request: HabitatProcessRequest
): "unavailable" | "exact" {
  return Match.value({
    commandId: request.commandId,
    previousPreflights: observed.filter(
      ({ commandId }) => commandId === "grit-pinned-native-preflight"
    ).length,
  }).pipe(
    Match.when(
      { commandId: "grit-pinned-native-preflight", previousPreflights: 0 },
      () => "unavailable" as const
    ),
    Match.orElse(() => "exact" as const)
  );
}

function preflightScenarioEffect(
  kind:
    | "unavailable"
    | "nonzero"
    | "interrupted"
    | "wrong-version"
    | "wrong-stream"
    | "truncated"
    | "exact",
  request: HabitatProcessRequest
) {
  return Match.value(kind).pipe(
    Match.when("unavailable", () =>
      Effect.fail(
        new CommandUnavailable({
          commandId: request.commandId,
          executable: request.executable,
          argv: request.argv,
          cwd: request.cwd,
          cause: "preflight executable unavailable",
        })
      )
    ),
    Match.when("nonzero", () =>
      Effect.succeed(
        makeHabitatCommandResult(request, {
          exit: { code: 17, signal: null, interrupted: false },
          stdout: captureOutput("wrong identity must not win"),
        })
      )
    ),
    Match.when("interrupted", () =>
      Effect.succeed(
        makeHabitatCommandResult(request, {
          exit: { code: 130, signal: "SIGTERM", interrupted: true },
          stdout: captureOutput("wrong identity must not win"),
        })
      )
    ),
    Match.when("wrong-version", () =>
      Effect.succeed(
        makeHabitatCommandResult(request, {
          stdout: captureOutput("grit 9.9.9\n"),
        })
      )
    ),
    Match.when("wrong-stream", () =>
      Effect.succeed(
        makeHabitatCommandResult(request, {
          stderr: captureOutput("grit 0.1.1\n"),
        })
      )
    ),
    Match.when("truncated", () =>
      Effect.succeed(
        makeHabitatCommandResult(request, {
          stdout: { ...captureOutput("grit 0.1.1\n"), truncated: true },
        })
      )
    ),
    Match.when("exact", () => Effect.succeed(exactPreflightOrTargetResult(request))),
    Match.exhaustive
  );
}

function exactPreflightOrTargetResult(request: HabitatProcessRequest) {
  return Match.value(request.commandId).pipe(
    Match.when("grit-pinned-native-preflight", () =>
      makeHabitatCommandResult(request, {
        stdout: captureOutput("grit 0.1.1\n"),
      })
    ),
    Match.orElse(() =>
      makeHabitatCommandResult(request, {
        stderr: captureOutput(
          jsonDocument(checkReport(path.join(repoRoot, providerFile), "alpha_pattern"))
        ),
      })
    )
  );
}

function rule(
  id: string,
  patternName: string,
  pattern: string,
  scanRoots: readonly string[],
  acquisition: "check" | "apply-dry-run" = "check"
): RuleGritFacts {
  return {
    id,
    lane: "enforced",
    message: `${id} finding`,
    runner: { name: "grit", files: { pattern }, patternName },
    patternName,
    diagnosticAcquisition: { kind: acquisition },
    pathCoverage: [{ kind: "exact-path", patterns: scanRoots.map((root) => `${root}/**/*`) }],
    scanRoots: [...scanRoots],
  };
}

function checkReport(
  findingPath: string,
  patternName: string,
  paths: readonly string[] = [findingPath],
  message: string | null = null
) {
  const results = Match.value(findingPath.length === 0).pipe(
    Match.when(true, () => []),
    Match.orElse(() => [
      {
        check_id: `#${patternName}/js`,
        local_name: patternName,
        path: findingPath,
        start: { line: 1, col: 1, offset: 0 },
        end: { line: 1, col: 2, offset: 1 },
        extra: { message, severity: "error" },
      },
    ])
  );
  return Value.Parse(GritReportSchema, {
    paths,
    results,
  });
}

function gritResultWithCheckId(fixture: GritResult, checkId: string) {
  return {
    check_id: checkId,
    local_name: fixture.local_name,
    path: fixture.path,
    start: fixture.start,
    end: fixture.end,
    extra: fixture.extra,
  };
}

function commandResult(
  options: { readonly stdout?: string; readonly stderr?: string; readonly exitCode?: number } = {}
) {
  return makeHabitatCommandResult(baseRequest(), {
    exit: { code: options.exitCode ?? 0, signal: null, interrupted: false },
    stdout: captureOutput(options.stdout ?? ""),
    stderr: captureOutput(options.stderr ?? ""),
  });
}

function baseRequest(): HabitatProcessRequest {
  return {
    commandId: "grit-test",
    kind: "pattern-check",
    executable: pinnedGritNativePath(repoRoot),
    argv: ["--json", "check"],
    cwd: repoRoot,
    scanRoots: [providerRoot],
  };
}

function compactRange() {
  return {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 2 },
    startByte: 0,
    endByte: 1,
  };
}

function compactMatchReason() {
  return {
    metadataJson: null,
    source: "UNKNOWN",
    name: null,
    title: null,
    explanation: null,
    level: null,
  } as const;
}

function compactMatch(sourceFile: string, rangeCount: number) {
  return {
    sourceFile,
    ranges: Array.from({ length: rangeCount }, compactRange),
    reason: compactMatchReason(),
  };
}

function matchEvent(sourceFile: string, rangeCount: number) {
  return { __typename: "Match", ...compactMatch(sourceFile, rangeCount) };
}

function rewriteEvent(sourceFile: string, rangeCount: number) {
  return {
    __typename: "Rewrite",
    original: compactMatch(sourceFile, rangeCount),
    rewritten: { sourceFile },
  };
}

function createFileEvent(sourceFile: string) {
  return { __typename: "CreateFile", rewritten: { sourceFile }, reason: compactMatchReason() };
}

function removeFileEvent(sourceFile: string, rangeCount = 1) {
  return { __typename: "RemoveFile", original: compactMatch(sourceFile, rangeCount) };
}

function replaceMatchReason(
  event:
    | ReturnType<typeof matchEvent>
    | ReturnType<typeof rewriteEvent>
    | ReturnType<typeof createFileEvent>
    | ReturnType<typeof removeFileEvent>,
  reason: unknown
) {
  return Match.value(event).pipe(
    Match.when({ __typename: "Match" }, (match) => ({ ...match, reason })),
    Match.when({ __typename: "Rewrite" }, (rewrite) => ({
      ...rewrite,
      original: { ...rewrite.original, reason },
    })),
    Match.when({ __typename: "CreateFile" }, (create) => ({ ...create, reason })),
    Match.when({ __typename: "RemoveFile" }, (remove) => ({
      ...remove,
      original: { ...remove.original, reason },
    })),
    Match.exhaustive
  );
}

function allDone(processed: number, found: number) {
  return { __typename: "AllDone", processed, found, reason: "allMatchesFound" };
}

function analysisLog(level: number, file = "PlaygroundPattern") {
  return {
    __typename: "AnalysisLog",
    level,
    message: "fixture analysis",
    position: { line: 1, column: 1 },
    file,
    engineId: "marzano",
    range: null,
    syntaxTree: null,
    source: null,
  };
}

function fakeApplyProviderWithAnalysisLog(analysisPath: string, fakeRepoRoot = repoRoot) {
  return makeFakeGritCommandService(
    (request) =>
      makeHabitatCommandResult(request, {
        stdout: captureOutput(jsonl(analysisLog(299, analysisPath), allDone(1, 0))),
      }),
    { repoRoot: fakeRepoRoot }
  );
}

function patternInfoEvent() {
  return {
    __typename: "PatternInfo",
    messages: [],
    variables: [],
    sourceFile: "fixture.grit",
    parsedPattern: "{}",
    valid: true,
    usesAi: false,
  };
}

function compactEventFixtures() {
  const file = path.join(repoRoot, providerFile);
  return [
    patternInfoEvent(),
    allDone(1, 0),
    matchEvent(file, 1),
    {
      __typename: "InputFile",
      sourceFile: file,
      syntaxTree: "{}",
    },
    rewriteEvent(file, 1),
    createFileEvent("generated.ts"),
    removeFileEvent(file),
    analysisLog(400),
  ];
}

function nativeRequestFixture() {
  return {
    commandFamily: "selected-rule-json-check",
    commandInvocationId: "grit-test",
    executable: pinnedGritNativePath(repoRoot),
    argv: ["--json", "check"],
    cwd: repoRoot,
    scanRoots: [providerRoot],
    outputContract: "json-report-on-stderr",
  };
}

function completedCommandFixture() {
  const { bytes, sha256, truncated } = captureOutput("");
  const empty = { bytes, sha256, truncated };
  return {
    kind: "completed" as const,
    commandId: "grit-test",
    executable: pinnedGritNativePath(repoRoot),
    argv: ["--json", "check"],
    cwd: repoRoot,
    scanRoots: [providerRoot],
    exit: { code: 0 as const, interrupted: false as const },
    output: { stdout: empty, stderr: empty },
  };
}

function failedCommandFixture(exitCode: number) {
  return {
    kind: "failed" as const,
    commandId: "grit-test",
    executable: pinnedGritNativePath(repoRoot),
    argv: ["--json", "check"],
    cwd: repoRoot,
    scanRoots: [providerRoot],
    exit: { code: exitCode, interrupted: false as const },
    output: null,
  };
}

function interruptedCommandFixture() {
  return {
    kind: "interrupted" as const,
    commandId: "grit-test",
    executable: pinnedGritNativePath(repoRoot),
    argv: ["--json", "check"],
    cwd: repoRoot,
    scanRoots: [providerRoot],
    exit: { code: null, signal: "SIGTERM", interrupted: true as const },
    output: null,
  };
}

function toolUnavailableCommandFixture() {
  return {
    kind: "tool-unavailable" as const,
    commandId: "grit-test",
    executable: pinnedGritNativePath(repoRoot),
    argv: ["--json", "check"],
    cwd: repoRoot,
    scanRoots: [providerRoot],
    cause: "not installed",
  };
}

function jsonl(...events: readonly unknown[]): string {
  return `${events.map(jsonDocument).join("\n")}\n`;
}

function jsonDocument(value: unknown): string {
  return stringifyJsonDocument(value);
}
