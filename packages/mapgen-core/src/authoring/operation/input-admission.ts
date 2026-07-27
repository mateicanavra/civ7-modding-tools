import type { Tagged } from "type-fest";
import type { Static, TArray, TIntersect, TObject, TProperties, TSchema, TUnion } from "typebox";
import type { ReadonlyData, ReadonlyDataArray, ReadonlyTypedArray } from "../data/readonly-data.js";
import {
  compileSchemaAdmission,
  type SchemaAdmission,
  type SchemaAdmissionIssue,
} from "../schema/admission.js";
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
import type { OperationInput } from "./types.js";

/** Immutable operation-entry program compiled once from a contract input schema. */
export type OperationInputAdmissionPlan = TypedArrayAdmissionPlan &
  Readonly<{
    opId: string;
    structure: SchemaAdmission;
  }>;

/** Exact-constructor typed array admitted under its declared non-grid cardinality contract. */
export type AdmittedBuffer<Value extends SupportedTypedArray> = Tagged<
  ReadonlyTypedArray<Value>,
  "MapGenAdmittedBuffer"
>;

/** Grid-coupled typed array whose declared cardinality has been admitted. */
export type GridBuffer<Value extends SupportedTypedArray> = Tagged<
  ReadonlyTypedArray<Value>,
  "MapGenGridBuffer"
>;

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

type MapAdmittedArray<Item extends TSchema> = ReadonlyDataArray<MapAdmittedInputSchema<Item>>;

type MapAdmittedObject<Schema extends TObject, Properties extends TProperties> = ReadonlyData<{
  readonly [Key in keyof Static<Schema>]: Key extends keyof Properties
    ? MapAdmittedInputSchema<Extract<Properties[Key], TSchema>>
    : Static<Schema>[Key];
}>;

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
      ? MapAdmittedArray<Item>
      : Schema extends TObject<infer Properties extends TProperties>
        ? MapAdmittedObject<Schema, Properties>
        : Schema extends TUnion<infer Types extends TSchema[]>
          ? MapAdmittedInputSchema<Types[number]>
          : Schema extends TIntersect<infer Types extends TSchema[]>
            ? MapAdmittedIntersection<Types>
            : ReadonlyData<Static<Schema>>;

/**
 * Deeply readonly strategy view produced after Core admits every annotated typed-array field.
 * Admission adds genuine typed-array proof brands without cloning or freezing the value.
 */
export type AdmittedOperationInput<InputSchema extends TSchema> = Tagged<
  MapAdmittedInputSchema<InputSchema>,
  "MapGenAdmittedOperationInput"
>;

/** One deterministic, pathful refusal emitted by operation-input admission. */
export type OperationInputAdmissionIssue = SchemaAdmissionIssue | TypedArrayAdmissionIssue;

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
    structure: compileSchemaAdmission(inputSchema),
    ...compileTypedArrayAdmissionPlan(inputSchema, {
      subject: "Operation",
      contextualCardinality: "refuse",
    }),
  });
}

/**
 * Executes one compiled structural and typed-array admission transition, then returns the same
 * value under the strategy-only admitted view. It never defaults, cleans, clones, or freezes.
 */
export function admitOperationInput<InputSchema extends TSchema>(
  plan: OperationInputAdmissionPlan,
  input: OperationInput<InputSchema>
): AdmittedOperationInput<InputSchema> {
  const structuralIssues = plan.structure(input);
  if (structuralIssues.length > 0) {
    throw new OperationInputAdmissionError(plan.opId, structuralIssues);
  }
  const issues = validateTypedArrayAdmission(plan, input);
  if (issues.length > 0) throw new OperationInputAdmissionError(plan.opId, issues);
  return input as AdmittedOperationInput<InputSchema>;
}
