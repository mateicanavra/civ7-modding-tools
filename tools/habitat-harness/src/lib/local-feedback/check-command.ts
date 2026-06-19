import { Value } from "typebox/value";
import {
  localFeedbackCheckProjection,
  type CheckReport,
  type LocalFeedbackCheckProjection,
} from "../check/index.js";
import { CheckReportSchema, validateCheckReport } from "../check/schema.js";
import type { SpawnResult } from "../spawn.js";

export type HookCheckCommandProjection =
  | {
      kind: "projected";
      report: CheckReport;
      projection: LocalFeedbackCheckProjection;
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

export function hookCheckCommandProjection(result: SpawnResult): HookCheckCommandProjection {
  const parsed = parseCheckReportJson(result.stdout) ?? parseCheckReportJson(result.stderr);
  if (!parsed) return { kind: "missing-json", exitCode: result.exitCode };
  if (parsed.kind === "invalid") {
    return { kind: "malformed-json", exitCode: result.exitCode, errors: parsed.errors };
  }
  return {
    kind: "projected",
    report: parsed.report,
    projection: localFeedbackCheckProjection(parsed.report),
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
