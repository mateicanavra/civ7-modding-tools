import { oc } from "@orpc/contract";
import { z } from "zod";

import { isoTimestamp } from "./shared.js";

/**
 * `studio.*` namespace — server identity / API version.
 *
 * Source of truth: audit/05-server-contracts.md endpoint #9.
 */

// ---------------------------------------------------------------------------
// #9 studio.serverInfo — GET /api/studio/server-info
// ---------------------------------------------------------------------------
// Request: none. Success 200: { ok:true, serverInstanceId, startedAt,
// runInGameApiVersion: 2, viteCommand }. No errors (pure).
//
// PARITY NOTE (audit/05 #9, target-arch §1): `serverInstanceId`/`startedAt` are
// process-lifetime singletons; clients reconcile run-in-game state against them
// (restart detection). `runInGameApiVersion` is the fixed literal 2.
export const serverInfo = oc.input(z.object({})).output(
  z.object({
    ok: z.literal(true),
    serverInstanceId: z.string(),
    startedAt: isoTimestamp,
    runInGameApiVersion: z.literal(2),
    viteCommand: z.string(),
  }),
);
