import type { TSchema } from "typebox";
import { Value } from "typebox/value";

import type { DomainOpCompileAny, OpsById } from "../authoring/bindings.js";
import { bindCompileOps, OpBindingError } from "../authoring/bindings.js";
import type { StepOpsDecl } from "../authoring/step/ops.js";
import type { CompileErrorItem } from "./errors.js";
import { createPortableJsonSnapshot } from "./portable-json-snapshot.js";

export type { CompileErrorItem } from "./errors.js";
export { createPortableJsonSnapshot } from "./portable-json-snapshot.js";

export type StepModuleAny = Readonly<{ contract?: Readonly<{ ops?: StepOpsDecl }> }>;

function joinPath(basePath: string, rawPath: string): string {
  if (!rawPath) return basePath || "/";
  if (!basePath) return rawPath;
  return `${basePath}${rawPath}`;
}

function escapeJsonPointerSegment(value: string): string {
  return value.replaceAll("~", "~0").replaceAll("/", "~1");
}

function formatErrors(
  schema: TSchema,
  value: unknown,
  basePath: string
): Array<{ path: string; message: string }> {
  const formatted: Array<{ path: string; message: string }> = [];
  for (const err of Value.Errors(schema, value)) {
    if (err.keyword === "additionalProperties") {
      for (const key of err.params.additionalProperties) {
        formatted.push({
          path: joinPath(basePath, `${err.instancePath}/${escapeJsonPointerSegment(key)}`),
          message: "Unknown key",
        });
      }
      continue;
    }
    formatted.push({ path: joinPath(basePath, err.instancePath), message: err.message });
  }
  return formatted;
}

export function validateStrict<T>(
  schema: TSchema,
  input: unknown,
  path: string
): { value: T; errors: CompileErrorItem[] } {
  const snapshot = createPortableJsonSnapshot(input, path);
  if (!snapshot.ok) {
    return {
      value: undefined as T,
      errors: [{ code: "config.invalid", path: snapshot.path, message: snapshot.message }],
    };
  }
  return validateSchemaValue(schema, snapshot.value, path);
}

export function validateSchemaValue<T>(
  schema: TSchema,
  value: unknown,
  path: string
): { value: T; errors: CompileErrorItem[] } {
  try {
    const errors = Value.Check(schema, value)
      ? []
      : formatErrors(schema, value, path).map((error) => ({
          code: "config.invalid" as const,
          ...error,
        }));
    return { value: value as T, errors };
  } catch {
    return {
      value: value as T,
      errors: [{ code: "config.invalid", path, message: "Schema validation failed safely" }],
    };
  }
}

export function normalizeOpsTopLevel(
  step: StepModuleAny,
  stepConfig: Record<string, unknown>,
  compileOpsById: OpsById<DomainOpCompileAny>,
  path: string
): { value: Record<string, unknown>; errors: CompileErrorItem[] } {
  const errors: CompileErrorItem[] = [];

  const opsDecl = step.contract?.ops;
  if (!opsDecl) return { value: stepConfig, errors };

  let compileOps: Record<string, DomainOpCompileAny>;
  try {
    compileOps = bindCompileOps(opsDecl, compileOpsById) as Record<string, DomainOpCompileAny>;
  } catch (err) {
    if (err instanceof OpBindingError) {
      errors.push({
        code: "op.missing",
        path: `${path}/${err.opKey}`,
        message: `Missing op implementation for key "${err.opKey}"`,
        opKey: err.opKey,
        opId: err.opId,
      });
    } else {
      errors.push({
        code: "op.missing",
        path,
        message: err instanceof Error ? err.message : "bindCompileOps failed",
      });
    }
    return { value: stepConfig, errors };
  }

  let value: Record<string, unknown> = stepConfig;
  for (const opKey of Object.keys(opsDecl)) {
    const contract = opsDecl[opKey]!;
    const op = compileOps[opKey];
    if (!op) {
      errors.push({
        code: "op.missing",
        path: `${path}/${opKey}`,
        message: `Missing op implementation for key "${opKey}"`,
        opKey,
        opId: contract.id,
      });
      continue;
    }

    const envelope = value[opKey];
    if (envelope === undefined) continue;

    if (typeof op.normalize === "function") {
      try {
        const next = op.normalize(envelope as Readonly<{ strategy: string; config: unknown }>);
        value = { ...value, [opKey]: next };
      } catch (err) {
        errors.push({
          code: "op.normalize.failed",
          path: `${path}/${opKey}`,
          message: err instanceof Error ? err.message : "op.normalize failed",
          opKey,
          opId: op.id,
        });
      }
    }
  }

  return { value, errors };
}
