import type { DomainOp, Static, StrategySelection, TSchema } from "@swooper/mapgen-core/authoring";
import {
  type CompileErrorItem,
  validateSchemaValue,
  validateStrict,
} from "@swooper/mapgen-core/compiler/normalize";

export class TestCompileError extends Error {
  readonly errors: CompileErrorItem[];

  constructor(message: string, errors: CompileErrorItem[]) {
    const details = errors.map((err) => `${err.code} ${err.path}: ${err.message}`).join("\n");
    super(`${message}\n${details}`);
    this.name = "TestCompileError";
    this.errors = errors;
  }
}

export function validateSchemaValueOrThrow<TSchemaT extends TSchema>(
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

export function normalizeOpSelectionOrThrow<
  InputSchema extends TSchema,
  OutputSchema extends TSchema,
  Strategies extends Record<string, { config: TSchema }>,
>(
  op: DomainOp<InputSchema, OutputSchema, Strategies>,
  selection: StrategySelection<Strategies>,
  options?: Readonly<{ path?: string }>
): StrategySelection<Strategies> {
  const path = options?.path ?? `/ops/${op.id}`;

  const first = validateStrict<StrategySelection<Strategies>>(op.config, selection, path);
  if (first.errors.length > 0) {
    throw new TestCompileError(`op config validation failed at ${path}`, first.errors);
  }

  const normalizedByStrategy = op.normalize(first.value);
  const second = validateStrict<StrategySelection<Strategies>>(
    op.config,
    normalizedByStrategy,
    path
  );
  if (second.errors.length > 0) {
    throw new TestCompileError(`post-normalize revalidation failed at ${path}`, second.errors);
  }

  return second.value;
}

export function runOpValidated<
  InputSchema extends TSchema,
  OutputSchema extends TSchema,
  Strategies extends Record<string, { config: TSchema }>,
>(
  op: DomainOp<InputSchema, OutputSchema, Strategies>,
  input: Static<InputSchema>,
  selection: StrategySelection<Strategies>,
  options?: Readonly<{ path?: string }>
): Static<OutputSchema> {
  const normalizedSelection = normalizeOpSelectionOrThrow(op, selection, options);
  return op.run(input, normalizedSelection);
}
