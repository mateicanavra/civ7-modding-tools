import { Context } from "effect";

import type { StudioServerContext } from "../context.js";

/**
 * `StudioConfig` — the Effect tag carrying the host-supplied
 * {@link StudioServerContext} (catalog loader, recipe-DAG service, control
 * facade, event hub, and operation leaf ports). Provided as a `Layer` in
 * `runtime.ts` and consumed by procedures that need host filesystem/resources.
 *
 * Read-surface procedures (status, mapSummary, gameInfo, live reads, setupConfig,
 * savedConfigs) do not depend on this — they call `@civ7/direct-control`
 * directly via `Civ7TunerClient`. Stateful operation lifecycle does not live in
 * this config; it is owned by the package operation runtime.
 */
export class StudioConfig extends Context.Tag("@civ7/studio-server/StudioConfig")<
  StudioConfig,
  StudioServerContext
>() {}
