import type { Tagged } from "type-fest";
import type { Static, TArray, TIntersect, TObject, TProperties, TSchema, TUnion } from "typebox";
import type {
  SupportedTypedArray,
  TTypedArraySchema,
  TypedArrayCardinality,
} from "../schema/typed-array.js";
import {
  compileTypedArrayAdmissionPlan,
  type TypedArrayAdmissionIssue,
  type TypedArrayAdmissionPlan,
  validateTypedArrayAdmission,
} from "../schema/typed-array-admission.js";

/** Immutable operation-entry program compiled once from a contract input schema. */
export type OperationInputAdmissionPlan = TypedArrayAdmissionPlan &
  Readonly<{
    opId: string;
  }>;

/** Exact-constructor typed array admitted under its declared non-grid cardinality contract. */
export type AdmittedBuffer<Value extends SupportedTypedArray> = Tagged<
  Value,
  "MapGenAdmittedBuffer"
>;

/** Grid-coupled typed array whose declared cardinality has been admitted. */
export type GridBuffer<Value extends SupportedTypedArray> = Tagged<Value, "MapGenGridBuffer">;

type MapDirectAdmittedSchema<Schema extends TSchema> =
  Schema extends TTypedArraySchema<
    infer Value extends SupportedTypedArray,
    infer Cardinality extends TypedArrayCardinality
  >
    ? [Cardinality] extends ["map-grid"]
      ? "map-grid" extends Cardinality
        ? GridBuffer<Value>
        : AdmittedBuffer<Value>
      : [Cardinality] extends [readonly ["width", "height"]]
        ? readonly ["width", "height"] extends Cardinality
          ? GridBuffer<Value>
          : AdmittedBuffer<Value>
        : AdmittedBuffer<Value>
    : never;

type MapAdmittedArray<Schema extends TArray, Item extends TSchema> =
  Static<Schema> extends unknown[]
    ? MapAdmittedInputSchema<Item>[]
    : readonly MapAdmittedInputSchema<Item>[];

type MapAdmittedObject<Schema extends TObject, Properties extends TProperties> = {
  [Key in keyof Static<Schema>]: Key extends keyof Properties
    ? MapAdmittedInputSchema<Extract<Properties[Key], TSchema>>
    : Static<Schema>[Key];
};

type MapAdmittedIntersection<Types extends TSchema[]> = Types extends [
  infer Left extends TSchema,
  ...infer Right extends TSchema[],
]
  ? MapAdmittedInputSchema<Left> & MapAdmittedIntersection<Right>
  : unknown;

type MapAdmittedInputSchema<Schema extends TSchema> =
  Schema extends TTypedArraySchema<SupportedTypedArray, TypedArrayCardinality>
    ? MapDirectAdmittedSchema<Schema>
    : Schema extends TArray<infer Item extends TSchema>
      ? MapAdmittedArray<Schema, Item>
      : Schema extends TObject<infer Properties extends TProperties>
        ? MapAdmittedObject<Schema, Properties>
        : Schema extends TUnion<infer Types extends TSchema[]>
          ? MapAdmittedInputSchema<Types[number]>
          : Schema extends TIntersect<infer Types extends TSchema[]>
            ? MapAdmittedIntersection<Types>
            : Static<Schema>;

/**
 * Transient strategy view produced only after Core admits every annotated typed-array field.
 * Public operation callers continue to supply the raw structural `Static<InputSchema>` value.
 */
export type AdmittedOperationInput<InputSchema extends TSchema> = Tagged<
  MapAdmittedInputSchema<InputSchema>,
  "MapGenAdmittedOperationInput"
>;

/** One deterministic, pathful refusal emitted by operation-input admission. */
export type OperationInputAdmissionIssue = TypedArrayAdmissionIssue;

/** Typed refusal raised before strategy selection can observe an inadmissible operation input. */
export class OperationInputAdmissionError extends Error {
  readonly opId: string;
  readonly issues: readonly OperationInputAdmissionIssue[];

  constructor(opId: string, issues: readonly OperationInputAdmissionIssue[]) {
    super(`Operation ${opId} refused ${issues.length} input admission issue(s).`);
    this.name = "OperationInputAdmissionError";
    this.opId = opId;
    this.issues = Object.freeze([...issues]);
    Object.freeze(this);
  }
}

/** Compiles the schema-owned typed-array admission program for one operation contract. */
export function compileOperationInputAdmissionPlan(
  opId: string,
  inputSchema: TSchema
): OperationInputAdmissionPlan {
  return Object.freeze({
    opId,
    ...compileTypedArrayAdmissionPlan(inputSchema, {
      subject: "Operation",
      contextualCardinality: "refuse",
    }),
  });
}

/**
 * Executes one compiled admission transition and returns the same value under the strategy-only
 * admitted view. It never defaults, clones, or performs general TypeBox validation.
 */
export function admitOperationInput<InputSchema extends TSchema>(
  plan: OperationInputAdmissionPlan,
  input: Static<InputSchema>
): AdmittedOperationInput<InputSchema> {
  const issues = validateTypedArrayAdmission(plan, input);
  if (issues.length > 0) throw new OperationInputAdmissionError(plan.opId, issues);
  return input as AdmittedOperationInput<InputSchema>;
}
