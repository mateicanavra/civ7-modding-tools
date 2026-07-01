// TypeBox-backed react-jsonschema-form `ValidatorType`.
//
// Replaces `@rjsf/validator-ajv8` in the config-authoring form so the compiled
// Studio component bundle contains no runtime code generation. ajv compiles JSON
// Schema with `new Function`, which a strict CSP without `'unsafe-eval'` blocks
// (e.g. the claude.ai/design sandbox), throwing an `EvalError` at validate time.
// TypeBox's value interpreter (`Check`/`Errors` from `typebox/value`) validates
// plain JSON Schema without generating code and is therefore CSP-safe. The
// TypeBox *compiler* (`TypeCompiler`) is deliberately NOT used — it also uses
// `new Function` and would reintroduce the defect.
//
// Error shaping — required-relocation, anyOf/oneOf dedup, the `errorSchema`
// tree, and the `customValidate`/`transformErrors` pipeline — is adapted from
// `@rjsf/validator-ajv8`'s `transformRJSFValidationErrors` /
// `processRawValidationErrors` (Apache-2.0) so behavior stays at parity with the
// previous ajv validator. TypeBox 1.0 emits ajv-shaped errors
// (`keyword`/`schemaPath`/`instancePath`/`params`/`message`), so the mapping is
// 1:1 except three ajv conventions that TypeBox shapes differently and we re-map:
//   - `required`: ajv emits one error per missing property (`params.missingProperty`);
//     TypeBox emits a single error listing all of them (`params.requiredProperties`).
//   - `additionalProperties`: ajv emits one error per extra property
//     (`params.additionalProperty`); TypeBox lists them in an array.
//   - tuple overflow (`items: [...]` + `additionalItems: false`): ajv emits one
//     `additionalItems` error on the array; TypeBox emits a `boolean` error
//     ("schema is false") at the extra element's index.
// Re-expanding `required` is what lets rjsf attribute the error to the missing
// child field rather than the parent object; re-mapping the tuple overflow keeps
// the error on the array field (not a phantom index) with a meaningful message.
import {
  ANY_OF_KEY,
  createErrorHandler,
  type CustomValidator,
  type ErrorTransformer,
  type FormContextType,
  getDefaultFormState,
  getUiOptions,
  ONE_OF_KEY,
  PROPERTIES_KEY,
  type RJSFSchema,
  type RJSFValidationError,
  type StrictRJSFSchema,
  toErrorSchema,
  type UiSchema,
  unwrapErrorHandler,
  type ValidationData,
  validationDataMerge,
  type ValidatorType,
} from "@rjsf/utils";
import { Check, Errors } from "typebox/value";

// TypeBox generics expect a `TSchema`; the config pipeline hands us plain JSON
// Schema (symbols already stripped by `normalizeSchemaForRjsf`). Validate through
// untyped shims so we don't fight TypeBox's compile-time surface.
const checkValue = Check as unknown as (schema: object, value: unknown) => boolean;
const errorsOf = Errors as unknown as (
  schema: object,
  value: unknown
) => Iterable<TypeBoxValueError>;

/** The ajv-compatible fields TypeBox 1.0 exposes on each value error. */
type TypeBoxValueError = {
  keyword?: string;
  schemaPath?: string;
  instancePath?: string;
  params?: Record<string, unknown>;
  message?: string;
};

/** Minimal ajv `ErrorObject` shape consumed by the rjsf error transform. */
type RawErrorObject = {
  instancePath: string;
  schemaPath: string;
  keyword: string;
  params: Record<string, unknown>;
  message?: string;
  parentSchema?: RJSFSchema;
};

/** Lightweight `lodash/get` for uiSchema title lookups (avoids a lodash dep). */
function getByPath(obj: unknown, path: string | string[]): unknown {
  if (obj == null) return undefined;
  const parts = Array.isArray(path) ? path : path.split(".").filter(Boolean);
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/** Validate `formData` against `schema`, mapping TypeBox errors to ajv-shaped
 * `ErrorObject`s (expanding `required` and `additionalProperties` per ajv). */
function toRawErrorObjects(schema: object, formData: unknown): RawErrorObject[] {
  const out: RawErrorObject[] = [];
  for (const raw of errorsOf(schema, formData)) {
    const base: RawErrorObject = {
      instancePath: raw.instancePath ?? "",
      schemaPath: raw.schemaPath ?? "#",
      keyword: raw.keyword ?? "",
      params: raw.params ?? {},
      message: raw.message,
    };

    const requiredProperties = base.params.requiredProperties;
    if (base.keyword === "required" && Array.isArray(requiredProperties)) {
      for (const prop of requiredProperties as string[]) {
        out.push({
          ...base,
          params: { missingProperty: prop },
          message: `must have required property '${prop}'`,
        });
      }
      continue;
    }

    const additionalProperties = base.params.additionalProperties;
    if (base.keyword === "additionalProperties" && Array.isArray(additionalProperties)) {
      for (const prop of additionalProperties as string[]) {
        out.push({
          ...base,
          params: { additionalProperty: prop },
          message: "must NOT have additional properties",
        });
      }
      continue;
    }

    // Tuple overflow: for `items: [...]` with `additionalItems: false`, TypeBox
    // reports a `boolean` error ("schema is false") at the extra element's index
    // (e.g. instancePath `/thresholds/4`). ajv reports one `additionalItems`
    // error on the ARRAY with the tuple length as `limit`. Re-map so the error
    // attaches to the array field with a meaningful message (parity with ajv).
    if (base.keyword === "boolean" && base.schemaPath.endsWith("/additionalItems")) {
      const segments = base.instancePath.split("/");
      const limit = Number(segments[segments.length - 1]);
      if (Number.isInteger(limit)) {
        out.push({
          ...base,
          instancePath: segments.slice(0, -1).join("/"),
          keyword: "additionalItems",
          params: { limit },
          message: `must NOT have more than ${limit} items`,
        });
        continue;
      }
    }

    out.push(base);
  }
  return out;
}

/** Adapted from `@rjsf/validator-ajv8` `transformRJSFValidationErrors`. */
function transformErrorsToRjsf<
  T,
  S extends StrictRJSFSchema,
  F extends FormContextType,
>(errors: RawErrorObject[], uiSchema?: UiSchema<T, S, F>): RJSFValidationError[] {
  const errorList = errors.map((e): RJSFValidationError => {
    const { instancePath, keyword, params, schemaPath, parentSchema } = e;
    let message = e.message ?? "";
    let property = instancePath.replace(/\//g, ".");
    let stack = `${property} ${message}`.trim();
    let uiTitle = "";
    const deps = params.deps;
    const rawPropertyNames = [
      ...(typeof deps === "string" ? deps.split(", ") : []),
      params.missingProperty,
      params.property,
    ].filter((item): item is string => Boolean(item));

    if (rawPropertyNames.length > 0) {
      for (const currentProperty of rawPropertyNames) {
        const path = property ? `${property}.${currentProperty}` : currentProperty;
        let uiSchemaTitle = getUiOptions(
          getByPath(uiSchema, path.replace(/^\./, "")) as UiSchema<T, S, F>
        ).title;
        if (uiSchemaTitle === undefined) {
          const uiSchemaPath = schemaPath
            .replace(/\/properties\//g, "/")
            .split("/")
            .slice(1, -1)
            .concat([currentProperty]);
          uiSchemaTitle = getUiOptions(
            getByPath(uiSchema, uiSchemaPath) as UiSchema<T, S, F>
          ).title;
        }
        if (uiSchemaTitle) {
          message = message.replace(`'${currentProperty}'`, `'${uiSchemaTitle}'`);
          uiTitle = uiSchemaTitle;
        } else {
          const parentSchemaTitle = getByPath(parentSchema, [
            PROPERTIES_KEY,
            currentProperty,
            "title",
          ]);
          if (typeof parentSchemaTitle === "string") {
            message = message.replace(`'${currentProperty}'`, `'${parentSchemaTitle}'`);
            uiTitle = parentSchemaTitle;
          }
        }
      }
      stack = message;
    } else {
      const uiSchemaTitle = getUiOptions<T, S, F>(
        getByPath(uiSchema, property.replace(/^\./, "")) as UiSchema<T, S, F>
      ).title;
      if (uiSchemaTitle) {
        stack = `'${uiSchemaTitle}' ${message}`.trim();
        uiTitle = uiSchemaTitle;
      } else {
        const parentSchemaTitle = parentSchema?.title;
        if (parentSchemaTitle) {
          stack = `'${parentSchemaTitle}' ${message}`.trim();
          uiTitle = parentSchemaTitle;
        }
      }
    }

    if ("missingProperty" in params) {
      const missing = params.missingProperty as string;
      property = property ? `${property}.${missing}` : missing;
    }

    return { name: keyword, property, message, params, stack, schemaPath, title: uiTitle };
  });

  // Filter out duplicate anyOf/oneOf messages, matching ajv8's behavior.
  return errorList.reduce<RJSFValidationError[]>((acc, err) => {
    const { message, schemaPath } = err;
    const anyOfIndex = schemaPath?.indexOf(`/${ANY_OF_KEY}/`) ?? -1;
    const oneOfIndex = schemaPath?.indexOf(`/${ONE_OF_KEY}/`) ?? -1;
    let schemaPrefix: string | undefined;
    if (anyOfIndex >= 0) schemaPrefix = schemaPath?.substring(0, anyOfIndex);
    else if (oneOfIndex >= 0) schemaPrefix = schemaPath?.substring(0, oneOfIndex);
    const dup = schemaPrefix
      ? acc.find((x) => x.message === message && x.schemaPath?.startsWith(schemaPrefix))
      : undefined;
    if (!dup) acc.push(err);
    return acc;
  }, []);
}

/** Adapted from `@rjsf/validator-ajv8` `processRawValidationErrors`. */
function buildValidationData<
  T,
  S extends StrictRJSFSchema,
  F extends FormContextType,
>(
  validator: ValidatorType<T, S, F>,
  rawErrors: { errors?: RawErrorObject[]; validationError?: Error },
  formData: T | undefined,
  schema: S,
  customValidate?: CustomValidator<T, S, F>,
  transformErrors?: ErrorTransformer<T, S, F>,
  uiSchema?: UiSchema<T, S, F>
): ValidationData<T> {
  const { validationError: invalidSchemaError } = rawErrors;
  let errors = transformErrorsToRjsf<T, S, F>(rawErrors.errors ?? [], uiSchema);

  if (invalidSchemaError) {
    errors = [...errors, { stack: invalidSchemaError.message } as RJSFValidationError];
  }
  if (typeof transformErrors === "function") {
    errors = transformErrors(errors, uiSchema);
  }

  let errorSchema = toErrorSchema<T>(errors);

  if (invalidSchemaError) {
    errorSchema = {
      ...errorSchema,
      $schema: { __errors: [invalidSchemaError.message] },
    } as typeof errorSchema;
  }

  if (typeof customValidate !== "function") {
    return { errors, errorSchema };
  }

  // Include form data with undefined values, which custom validation expects.
  const newFormData = getDefaultFormState<T, S, F>(validator, schema, formData, schema, true) as T;
  const errorHandler = customValidate(newFormData, createErrorHandler<T>(newFormData), uiSchema, errorSchema);
  const userErrorSchema = unwrapErrorHandler<T>(errorHandler);
  return validationDataMerge<T>({ errors, errorSchema }, userErrorSchema);
}

/** A CSP-safe rjsf `ValidatorType` backed by TypeBox's value interpreter. */
export class TypeboxValidator<
  T = unknown,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = Record<string, unknown>,
> implements ValidatorType<T, S, F>
{
  isValid(schema: S, formData: T | undefined, _rootSchema: S): boolean {
    // No `$ref` resolution needed: recipe config schemas are fully inlined by
    // TypeBox serialization (verified), so `_rootSchema` is unused. Matches
    // ajv8's isValid contract of returning `false` on a schema/validate throw.
    try {
      return checkValue(schema, formData);
    } catch {
      return false;
    }
  }

  rawValidation<Result = RawErrorObject>(
    schema: S,
    formData?: T
  ): { errors?: Result[]; validationError?: Error } {
    try {
      return {
        errors: toRawErrorObjects(schema, formData) as unknown as Result[],
        validationError: undefined,
      };
    } catch (err) {
      return { errors: undefined, validationError: err as Error };
    }
  }

  validateFormData(
    formData: T | undefined,
    schema: S,
    customValidate?: CustomValidator<T, S, F>,
    transformErrors?: ErrorTransformer<T, S, F>,
    uiSchema?: UiSchema<T, S, F>
  ): ValidationData<T> {
    const rawErrors = this.rawValidation<RawErrorObject>(schema, formData);
    return buildValidationData<T, S, F>(
      this,
      rawErrors,
      formData,
      schema,
      customValidate,
      transformErrors,
      uiSchema
    );
  }

  reset(): void {
    // TypeBox validates by interpretation; there is no compiled-schema cache to
    // clear (unlike ajv). Present to satisfy the optional `ValidatorType.reset`.
  }
}

/** Mirrors `customizeValidator()` from `@rjsf/validator-ajv8`. */
export function createTypeboxValidator<
  T = unknown,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = Record<string, unknown>,
>(): ValidatorType<T, S, F> {
  return new TypeboxValidator<T, S, F>();
}
