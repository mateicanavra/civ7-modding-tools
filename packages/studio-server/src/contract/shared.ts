import { Type, type TSchema } from "typebox";

import { toStandardSchema } from "../typeboxStandardSchema.js";

/**
 * Shared TypeBox building blocks for the studio-server success I/O contracts.
 *
 * Contract-first design note: the studio API's stable surface is the response
 * envelope (`{ ok, ... }`, `observedAt`, status-code semantics). Deep payloads
 * returned by `@civ7/direct-control` are large internal result types, so the
 * contract models those payloads as permissive records instead of duplicating
 * their internals here.
 */

/** A JSON object with unknown values, used for opaque direct-control payloads. */
export const unknownRecordSchema = Type.Record(Type.String(), Type.Unknown());

/** ISO-8601 timestamp string (`new Date().toISOString()` on the server). */
export const isoTimestampSchema = Type.String();

/** Empty request body/query object. */
export const emptyInputSchema = toStandardSchema(Type.Object({}, { additionalProperties: false }));

/** Convert a TypeBox schema to the Standard Schema artifact oRPC consumes. */
export function contractSchema<TypeSchema extends TSchema>(schema: TypeSchema) {
  return toStandardSchema(schema);
}

/**
 * The uniform failure body most endpoints emit: `{ ok: false, error }`.
 * Procedure-specific transport errors are declared in `errors.ts`.
 */
export const errorEnvelopeSchema = Type.Object(
  {
    ok: Type.Literal(false),
    error: Type.String(),
  },
  { additionalProperties: false }
);
