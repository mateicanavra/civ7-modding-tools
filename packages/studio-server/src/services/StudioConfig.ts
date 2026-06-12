import { Context } from "effect";

import type { StudioServerContext } from "../context.js";

/**
 * `StudioConfig` — the Effect tag carrying the host-supplied
 * {@link StudioServerContext} (process singletons, catalog loader, and the three
 * stateful engine fns). Provided as a `Layer` in `runtime.ts` and consumed by the
 * procedures that need the host seam (catalog, autoplay, run-in-game, save/deploy).
 *
 * Read-surface procedures (status, mapSummary, gameInfo, live reads, setupConfig,
 * savedConfigs) do not depend on this — they call `@civ7/direct-control` directly
 * via `Civ7TunerClient`.
 */
export class StudioConfig extends Context.Tag("@civ7/studio-server/StudioConfig")<
  StudioConfig,
  StudioServerContext
>() {}
