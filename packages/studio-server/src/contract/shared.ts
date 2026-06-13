import { z } from "zod";

/**
 * Shared Zod building blocks for the legacy studio-server success I/O
 * contracts. New durable contract schema surfaces should prefer
 * TypeBox/Standard Schema unless a slice records a different schema-tech
 * decision.
 *
 * Contract-first design note: the studio API's *stable surface* is the response
 * envelope (the `{ ok, ... }` wrappers, `observedAt`, status-code semantics). The
 * deep payloads returned by `@civ7/direct-control` (map summaries, app-UI snapshots,
 * map grids, GameInfo rows, etc.) are large, internal result types that are NOT
 * anchored to any app `status.ts` type and are not part of the contract's drift
 * surface. They are modelled here as permissive schemas (`unknownRecord` /
 * `z.unknown()`); reproducing ~500 lines of direct-control internals here would be
 * brittle and is explicitly out of scope for slice A1 (contracts only, no logic).
 *
 * Where the audit (audit/05-server-contracts.md) anchors an output to an existing
 * app type (`RunInGameOperationStatus`, `MapConfigSaveDeployStatus`,
 * `Civ7SetupCatalog`), the schema is reproduced faithfully in the relevant module.
 */

/** A JSON object with unknown values — used for opaque direct-control payloads. */
export const unknownRecord = z.record(z.string(), z.unknown());

/** A single GameInfo DB row (column name → value). */
export const gameInfoRow = z.record(z.string(), z.unknown());

/** ISO-8601 timestamp string (`new Date().toISOString()` on the server). */
export const isoTimestamp = z.string();

/**
 * The uniform failure body most endpoints emit: `{ ok: false, error }`. Some
 * endpoints additionally include `observedAt` and/or `details` — those are added
 * per-procedure. NOTE: these are documentation of the *current* HTTP error bodies;
 * the actual Effect-failure → status-code mapping lands in slice A3 (errorMap
 * middleware), where the NON-UNIFORM status codes (400/409/500/503) are reproduced
 * per procedure. Contracts here capture the success outputs; error shapes are noted
 * as comments on each procedure.
 */
export const errorEnvelope = z.object({
  ok: z.literal(false),
  error: z.string(),
});
