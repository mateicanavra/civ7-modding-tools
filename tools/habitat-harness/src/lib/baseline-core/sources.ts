import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  errorMessage,
  externalSourceFilePath,
  readJsonFile,
  type RequiredBaselineContext,
} from "./context.js";
import {
  parseDocAmbiguityBaselineSource,
  type BaselineRefusal,
  type ExternalExceptionSource,
} from "./schema.js";
import { sortedUnique } from "./utils.js";

const adapterBoundaryAllowlistMessage =
  "/base-standard/ reference allowlisted in scripts/lint/lint-adapter-boundary.sh (tracked debt)";

export function projectExternalExceptionKeys(
  ruleId: string,
  source: ExternalExceptionSource,
  context: RequiredBaselineContext
): { ok: true; keys: string[] } | { ok: false; refusal: BaselineRefusal } {
  const sourcePath = externalSourceFilePath(source.sourcePath);
  const absolutePath = path.join(context.repoRoot, sourcePath);
  if (!existsSync(absolutePath)) {
    return {
      ok: false,
      refusal: {
        kind: "baseline-refusal",
        ruleId,
        path: source.sourcePath,
        reason: "external-exception-source-unreadable",
        message: `External exception source '${source.sourcePath}' does not exist.`,
      },
    };
  }
  return source.kind === "fixed"
    ? sortedProjection(ruleId, source.sourcePath, source.projectedKeys)
    : projectDerivedSource(ruleId, source, absolutePath);
}

function projectDerivedSource(
  ruleId: string,
  source: Extract<ExternalExceptionSource, { kind: "derived" }>,
  absolutePath: string
): { ok: true; keys: string[] } | { ok: false; refusal: BaselineRefusal } {
  switch (source.projector) {
    case "adapter-boundary-allowlist":
      return adapterBoundaryProjectedKeys(ruleId, absolutePath);
    case "doc-ambiguity-baseline":
      return docAmbiguityProjectedKeys(ruleId, source.sourcePath, absolutePath);
  }
}

function adapterBoundaryProjectedKeys(
  ruleId: string,
  scriptPath: string
): { ok: true; keys: string[] } | { ok: false; refusal: BaselineRefusal } {
  let text: string;
  try {
    text = readFileSync(scriptPath, "utf8");
  } catch (error) {
    return {
      ok: false,
      refusal: {
        kind: "baseline-refusal",
        ruleId,
        path: "scripts/lint/lint-adapter-boundary.sh#ALLOWLIST",
        reason: "external-exception-source-unreadable",
        message: `Unable to read adapter-boundary allowlist: ${errorMessage(error)}.`,
      },
    };
  }
  const allowlistMatch = text.match(/ALLOWLIST=\(\n(?<body>[\s\S]*?)\n\)/);
  const body = allowlistMatch?.groups?.body;
  const files = body ? [...body.matchAll(/^\s*"([^"]+)"\s*$/gm)].map((match) => match[1]) : [];
  if (files.length === 0) {
    return {
      ok: false,
      refusal: {
        kind: "baseline-refusal",
        ruleId,
        path: "scripts/lint/lint-adapter-boundary.sh#ALLOWLIST",
        reason: "external-exception-source-malformed",
        message: "Unable to parse adapter-boundary ALLOWLIST entries.",
      },
    };
  }
  return { ok: true, keys: files.map((file) => `${file}::${adapterBoundaryAllowlistMessage}`).sort() };
}

function docAmbiguityProjectedKeys(
  ruleId: string,
  sourcePath: string,
  absolutePath: string
): { ok: true; keys: string[] } | { ok: false; refusal: BaselineRefusal } {
  try {
    const source = parseDocAmbiguityBaselineSource(readJsonFile(absolutePath));
    return derivedProjection(
      ruleId,
      sourcePath,
      source.items.map((item) => `${item.filePath}::${item.id}`)
    );
  } catch (error) {
    return {
      ok: false,
      refusal: {
        kind: "baseline-refusal",
        ruleId,
        path: sourcePath,
        reason: "external-exception-source-malformed",
        message: `External exception source '${sourcePath}' is malformed: ${errorMessage(error)}.`,
      },
    };
  }
}

function sortedProjection(
  ruleId: string,
  sourcePath: string,
  keys: readonly string[]
): { ok: true; keys: string[] } | { ok: false; refusal: BaselineRefusal } {
  const unique = sortedUnique(keys);
  if (unique.length !== keys.length || keys.some((key, index) => key !== unique[index])) {
    return {
      ok: false,
      refusal: {
        kind: "baseline-refusal",
        ruleId,
        path: sourcePath,
        reason: "external-exception-source-malformed",
        message: `External exception source for '${ruleId}' must project sorted unique keys.`,
      },
    };
  }
  return { ok: true, keys: unique };
}

function derivedProjection(
  ruleId: string,
  sourcePath: string,
  keys: readonly string[]
): { ok: true; keys: string[] } | { ok: false; refusal: BaselineRefusal } {
  const unique = sortedUnique(keys);
  if (unique.length !== keys.length) {
    return {
      ok: false,
      refusal: {
        kind: "baseline-refusal",
        ruleId,
        path: sourcePath,
        reason: "external-exception-source-malformed",
        message: `External exception source for '${ruleId}' must project unique keys.`,
      },
    };
  }
  return { ok: true, keys: unique };
}
