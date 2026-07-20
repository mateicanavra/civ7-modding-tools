import type { DomainOp, Static, StrategySelection, TSchema } from "@mapgen/authoring/index.js";
import {
  type CompileErrorItem,
  validateSchemaValue,
  validateStrict,
} from "@mapgen/compiler/normalize.js";

/** Compiler failure surfaced by an operation test without weakening production admission. */
export class TestCompileError extends Error {
  /** Complete compiler diagnostics associated with the failed test admission. */
  readonly errors: CompileErrorItem[];

  /** Creates one readable failure while retaining every structured compiler diagnostic. */
  constructor(message: string, errors: CompileErrorItem[]) {
    const details = errors
      .map((error) => `${error.code} ${error.path}: ${error.message}`)
      .join("\n");
    super(`${message}\n${details}`);
    this.name = "TestCompileError";
    this.errors = errors;
  }
}

/** Validates a test value through the production compiler and returns its admitted static type. */
export function validateSchemaValueForTest<TSchemaT extends TSchema>(
  schema: TSchemaT,
  value: unknown,
  path: string
): Static<TSchemaT> {
  const { value: validatedValue, errors } = validateSchemaValue<Static<TSchemaT>>(
    schema,
    value,
    path
  );
  if (errors.length > 0) throw new TestCompileError(`validation failed at ${path}`, errors);
  return validatedValue;
}

/** Normalizes and revalidates one operation strategy selection through production compilation. */
export function normalizeOperationSelectionForTest<
  InputSchema extends TSchema,
  OutputSchema extends TSchema,
  Strategies extends Record<string, { config: TSchema }>,
>(
  operation: DomainOp<InputSchema, OutputSchema, Strategies>,
  selection: unknown,
  options?: Readonly<{ path?: string }>
): StrategySelection<Strategies> {
  const path = options?.path ?? `/ops/${operation.id}`;
  const first = validateStrict<StrategySelection<Strategies>>(operation.config, selection, path);
  if (first.errors.length > 0) {
    throw new TestCompileError(`op config validation failed at ${path}`, first.errors);
  }

  let normalized: StrategySelection<Strategies>;
  try {
    normalized = operation.normalize(first.value);
  } catch (error) {
    throw new TestCompileError(`op normalization failed at ${path}`, [
      {
        code: "op.normalize.failed",
        path,
        message: error instanceof Error ? error.message : "op.normalize failed",
        opId: operation.id,
      },
    ]);
  }
  const second = validateStrict<StrategySelection<Strategies>>(operation.config, normalized, path);
  if (second.errors.length > 0) {
    throw new TestCompileError(`post-normalize revalidation failed at ${path}`, second.errors);
  }
  return second.value;
}

/** Runs an operation after production normalization admits its selected strategy configuration. */
export function runAdmittedOperationForTest<
  InputSchema extends TSchema,
  OutputSchema extends TSchema,
  Strategies extends Record<string, { config: TSchema }>,
>(
  operation: DomainOp<InputSchema, OutputSchema, Strategies>,
  input: Static<InputSchema>,
  selection: StrategySelection<Strategies>,
  options?: Readonly<{ path?: string }>
): Static<OutputSchema> {
  const normalizedSelection = normalizeOperationSelectionForTest(operation, selection, options);
  return operation.run(input, normalizedSelection);
}
