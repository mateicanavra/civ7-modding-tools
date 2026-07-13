import type { SpawnResult } from "@habitat/cli/resources/command/index";
import {
  type CheckReport,
  CheckReportSchema,
  type HookCheckSummary,
  hookCheckSummary,
  validateCheckReport,
} from "@habitat/cli/service/model/check/index";
import { Value } from "typebox/value";

export type HookCheckCommandResult =
  | {
      kind: "parsed";
      report: CheckReport;
      summary: HookCheckSummary;
    }
  | {
      kind: "missing-json";
      exitCode: number;
    }
  | {
      kind: "malformed-json";
      exitCode: number;
      errors: string[];
    }
  | {
      kind: "status-mismatch";
      actualExitCode: number;
      expectedExitCode: 0 | 1;
      report: CheckReport;
    };

export function hookCheckCommandResult(result: SpawnResult): HookCheckCommandResult {
  const parsed = parseCheckReportJson(result.stdout) ?? parseCheckReportJson(result.stderr);
  if (!parsed) return { kind: "missing-json", exitCode: result.exitCode };
  if (parsed.kind === "invalid") {
    return { kind: "malformed-json", exitCode: result.exitCode, errors: parsed.errors };
  }
  return correlateHookCheckReport(result.exitCode, parsed.report);
}

export function correlateHookCheckReport(
  actualExitCode: number,
  report: CheckReport
): HookCheckCommandResult {
  const expectedExitCode = report.ok ? 0 : 1;
  if (actualExitCode !== expectedExitCode) {
    return { kind: "status-mismatch", actualExitCode, expectedExitCode, report };
  }
  return { kind: "parsed", report, summary: hookCheckSummary(report) };
}

function parseCheckReportJson(
  output: string
): { kind: "valid"; report: CheckReport } | { kind: "invalid"; errors: string[] } | undefined {
  const trimmed = output.trim();
  if (!trimmed) return undefined;
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed) as unknown;
  } catch (error) {
    return { kind: "invalid", errors: [error instanceof Error ? error.message : String(error)] };
  }
  const errors = validateCheckReport(parsed);
  if (errors.length > 0) return { kind: "invalid", errors };
  return { kind: "valid", report: Value.Parse(CheckReportSchema, parsed) };
}
