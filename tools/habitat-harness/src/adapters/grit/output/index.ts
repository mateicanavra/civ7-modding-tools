import { Value } from "typebox/value";
import type {
  GritAdapterFailureTag,
  GritParseStatus,
  HabitatCommandResult,
} from "../../../lib/habitat-process.js";
import { normalizeGritPath } from "../scan-roots/index.js";
import {
  type GritCheckParseResult,
  type GritResult,
  type GritWireReport,
  GritWireReportSchema,
} from "../types.js";

export function parseGritCheckTextOutput(
  commandResult: HabitatCommandResult
): GritCheckParseResult {
  if (commandResult.exit.interrupted) {
    return parseFailure(
      commandResult,
      commandResult.failureTag ?? "GritCommandFailed",
      "unparsed",
      "Grit command was interrupted."
    );
  }

  const text = `${commandResult.stdout.text}\n${commandResult.stderr.text}`;
  const results = parseGritTextResults(text);
  if (commandResult.exit.code !== 0 && results.length === 0) {
    return parseFailure(
      commandResult,
      commandResult.failureTag ?? "GritCommandFailed",
      "unparsed",
      `Grit command exited ${commandResult.exit.code}.`
    );
  }

  return {
    ok: true,
    report: {
      paths: [...new Set(results.map((result) => result.path).filter(isString))],
      results,
    },
    parseStatus: "parsed",
    commandResult: { ...commandResult, parseStatus: "parsed", failureTag: null },
  };
}

export function parseGritCheckOutput(commandResult: HabitatCommandResult): GritCheckParseResult {
  if (commandResult.exit.code !== 0 || commandResult.exit.interrupted) {
    return parseFailure(
      commandResult,
      commandResult.failureTag ?? "GritCommandFailed",
      "unparsed",
      `Grit command exited ${commandResult.exit.code}.`
    );
  }

  const candidates = [
    {
      stream: "stdout",
      text: commandResult.stdout.text,
      truncated: commandResult.stdout.truncated,
    },
    {
      stream: "stderr",
      text: commandResult.stderr.text,
      truncated: commandResult.stderr.truncated,
    },
  ];
  const nonEmpty = candidates.filter((candidate) => candidate.text.trim().length > 0);
  if (nonEmpty.length === 0) {
    return parseFailure(commandResult, "GritNoJson", "no-json", "Grit emitted no JSON output.");
  }
  const truncated = nonEmpty.find((candidate) => candidate.truncated);
  if (truncated) {
    return parseFailure(
      commandResult,
      "GritAdapterInternalContractViolation",
      "unsupported-mode",
      `Grit ${truncated.stream} output exceeded the parser capture limit.`
    );
  }

  for (const candidate of nonEmpty) {
    const trimmed = candidate.text.trim();
    if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) continue;
    try {
      return validateGritReport(commandResult, JSON.parse(trimmed) as unknown);
    } catch {
      return parseFailure(
        commandResult,
        "GritMalformedJson",
        "malformed",
        `Grit ${candidate.stream} is not valid JSON.`
      );
    }
  }

  const containsJsonLikeText = nonEmpty.some(
    (candidate) => candidate.text.includes("{") || candidate.text.includes("}")
  );
  return parseFailure(
    commandResult,
    containsJsonLikeText ? "GritMalformedJson" : "GritNoJson",
    containsJsonLikeText ? "malformed" : "no-json",
    containsJsonLikeText
      ? "Grit output contains wrapper text around JSON; Habitat requires exact JSON."
      : "Grit output did not contain a JSON object."
  );
}

function validateGritReport(
  commandResult: HabitatCommandResult,
  value: unknown
): GritCheckParseResult {
  const issues = [...Value.Errors(GritWireReportSchema, value)];
  if (issues.length > 0) {
    const first = issues[0];
    const tag =
      first?.instancePath === "" || first?.instancePath === "/results"
        ? "GritSchemaDrift"
        : "GritUnexpectedResultShape";
    return parseFailure(
      commandResult,
      tag,
      "schema-drift",
      first?.message ?? "Grit JSON does not match the expected report schema."
    );
  }
  const report = value as GritWireReport;
  return {
    ok: true,
    report: {
      paths: report.paths ?? [],
      results: report.results,
    },
    parseStatus: "parsed",
    commandResult: { ...commandResult, parseStatus: "parsed", failureTag: null },
  };
}

function parseGritTextResults(text: string): GritResult[] {
  const results: GritResult[] = [];
  let currentPath = ".";
  let currentLine: number | undefined;
  let currentColumn: number | undefined;

  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    if (line.includes(" files with ") || line.startsWith("Run grit check ")) continue;
    if (!line.startsWith(" ") && !line.includes(" files with ")) {
      currentPath = normalizeGritPath(line.trim());
      currentLine = undefined;
      currentColumn = undefined;
      continue;
    }

    const positionMatch = line.match(/^\s+(\d+):(\d+)\s+/);
    if (positionMatch) {
      currentLine = Number(positionMatch[1]);
      currentColumn = Number(positionMatch[2]);
    }

    const patternMatch = line.match(/\b([a-z][a-z0-9_]+)\s*$/);
    if (!patternMatch) continue;
    results.push({
      local_name: patternMatch[1],
      path: currentPath,
      start: currentLine ? { line: currentLine, col: currentColumn } : undefined,
    });
  }

  return results;
}

function parseFailure(
  commandResult: HabitatCommandResult,
  failureTag: GritAdapterFailureTag,
  parseStatus: Exclude<GritParseStatus, "parsed">,
  message: string
): GritCheckParseResult {
  return {
    ok: false,
    failureTag,
    parseStatus,
    message,
    commandResult: { ...commandResult, parseStatus, failureTag },
  };
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}
