import { createPortableJsonSnapshot } from "@mapgen/lib/json/portable-snapshot.js";
import type { TSchema } from "typebox";
import { Value } from "typebox/value";
import type { OperationRegistry } from "../authoring/operation/bindings.js";
import { bindOperations, OpBindingError } from "../authoring/operation/bindings.js";
import type { StepOpsDecl } from "../authoring/step/ops.js";
import type { CompileErrorItem } from "./errors.js";

export { createPortableJsonSnapshot } from "@mapgen/lib/json/portable-snapshot.js";
export type { CompileErrorItem } from "./errors.js";

export type StepModuleAny = Readonly<{ contract?: Readonly<{ ops?: StepOpsDecl }> }>;

type ErasedOperationNormalizer = (
  selection: Readonly<{ strategy: string; config: unknown }>
) => unknown;

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

/**
 * Snapshots untrusted authored data into frozen portable JSON, then validates it without applying
 * schema defaults. Recipe compilation uses this boundary before and after normalization so
 * normalizers cannot smuggle aliases, accessors, or non-portable values into compiled config.
 *
 * @param schema - TypeBox schema that defines the admitted configuration shape.
 * @param input - Untrusted authored value to detach before validation.
 * @param path - JSON-pointer root attached to any resulting compile diagnostics.
 * @returns The detached value plus zero or more structured compile errors.
 */
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

/**
 * Validates an already-snapshotted value while containing TypeBox failures as compile diagnostics.
 * Unlike `validateStrict`, this helper neither clones nor freezes its input; callers use it only
 * after another boundary has established ownership.
 *
 * @param schema - TypeBox schema to check without materializing defaults.
 * @param value - Caller-owned value that has already crossed its trust boundary.
 * @param path - JSON-pointer root attached to validation diagnostics.
 * @returns The original value and deterministic validation errors.
 */
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

/**
 * Applies each declared operation's selected strategy normalizer to its top-level step envelope.
 * Contract-to-implementation binding failures and normalizer exceptions are accumulated as recipe
 * compile errors, while the caller's configuration object remains unchanged.
 *
 * @param step - Step contract whose operation declarations define the expected envelopes.
 * @param stepConfig - Strictly validated step configuration to normalize.
 * @param operations - Canonical executable operations available to recipe compilation.
 * @param path - JSON-pointer root used for operation-specific diagnostics.
 * @returns The normalized step configuration and any binding or normalization failures.
 */
export function normalizeOpsTopLevel(
  step: StepModuleAny,
  stepConfig: Record<string, unknown>,
  operations: OperationRegistry,
  path: string
): { value: Record<string, unknown>; errors: CompileErrorItem[] } {
  const errors: CompileErrorItem[] = [];

  const opsDecl = step.contract?.ops;
  if (!opsDecl) return { value: stepConfig, errors };

  let boundOperations: OperationRegistry;
  try {
    boundOperations = bindOperations(opsDecl, operations);
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
        message: err instanceof Error ? err.message : "bindOperations failed",
      });
    }
    return { value: stepConfig, errors };
  }

  let value: Record<string, unknown> = stepConfig;
  for (const [opKey, op] of Object.entries(boundOperations)) {
    const envelope = value[opKey];
    if (envelope === undefined) continue;

    try {
      // The operation envelope has already passed its exact contract schema. Generic compiler
      // storage keeps erased callbacks non-invocable; this is the one boundary that restores the
      // admitted normalizer shape.
      const normalize = op.normalize as ErasedOperationNormalizer;
      const next = normalize(envelope as Readonly<{ strategy: string; config: unknown }>);
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

  return { value, errors };
}
