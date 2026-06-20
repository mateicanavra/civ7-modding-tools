import { Value } from "typebox/value";
import type { SpawnResult } from "../../providers/command/index.js";
import { type CheckReport, type HookCheckSummary, hookCheckSummary } from "../check/index.js";
import { CheckReportSchema, validateCheckReport } from "../check/schema.js";

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
    };

export function hookCheckCommandResult(result: SpawnResult): HookCheckCommandResult {
  const parsed = parseCheckReportJson(result.stdout) ?? parseCheckReportJson(result.stderr);
  if (!parsed) return { kind: "missing-json", exitCode: result.exitCode };
  if (parsed.kind === "invalid") {
    return { kind: "malformed-json", exitCode: result.exitCode, errors: parsed.errors };
  }
  return {
    kind: "parsed",
    report: parsed.report,
    summary: hookCheckSummary(parsed.report),
  };
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
