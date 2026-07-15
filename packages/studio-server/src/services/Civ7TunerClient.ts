import {
  DEFAULT_CIV7_TUNER_TIMEOUT_MS,
  getCiv7CitySummary,
  getCiv7GameInfoRows,
  getCiv7MapGrid,
  getCiv7MapSummary,
  getCiv7PlayableStatus,
  getCiv7PlayerSummary,
  getCiv7SetupSnapshot,
  getCiv7UnitSummary,
  listCiv7SavedGameConfigurations,
} from "@civ7/direct-control";
import { Effect } from "effect";

import { Civ7TunerSession, Civ7TunerSessionLive } from "./Civ7TunerSession.js";

/**
 * `Civ7TunerClient` — Effect service wrapping the `@civ7/direct-control` FireTuner
 * socket + filesystem reads used by the studio's read surface.
 *
 * Every tuner read routes through the shared `Civ7TunerSession` (`use` +
 * `options.session` injection): one multiplexed connection for the whole
 * polling surface instead of connect-per-request — the churn that wedged the
 * game — plus the session's backoff gate when the tuner stops answering. Each
 * retained standalone method preserves its direct-control call shape. The
 * `live.status` aggregate intentionally consumes only `playableStatus` and
 * projects one coherent App UI observation instead of issuing three redundant
 * reads. `savedConfigurations` is a filesystem read (no socket) and deliberately
 * bypasses the session/gate.
 *
 * The Studio live reader remains direct-control-backed; merged control-oRPC
 * procedures share the same host admission lease at the handler boundary.
 */
export class Civ7TunerClient extends Effect.Service<Civ7TunerClient>()(
  "@civ7/studio-server/Civ7TunerClient",
  {
    accessors: true,
    dependencies: [Civ7TunerSessionLive],
    effect: Effect.gen(function* () {
      const tuner = yield* Civ7TunerSession;
      const timeoutMs = DEFAULT_CIV7_TUNER_TIMEOUT_MS;
      return {
        // #1 status — getCiv7PlayableStatus({ timeoutMs })
        playableStatus: () => tuner.use((o) => getCiv7PlayableStatus({ timeoutMs, ...o })),

        // #2 mapSummary — includeAreaRegionCounts: true
        mapSummary: () =>
          tuner.use((o) => getCiv7MapSummary({ timeoutMs, includeAreaRegionCounts: true, ...o })),

        // #3 / live.gameInfo — getCiv7GameInfoRows({ table, limit }, { timeoutMs })
        gameInfoRows: (table: string, limit: number) =>
          tuner.use((o) => getCiv7GameInfoRows({ table, limit }, { timeoutMs, ...o })),

        // #10 setupConfig — getCiv7SetupSnapshot({ timeoutMs })
        setupSnapshot: () => tuner.use((o) => getCiv7SetupSnapshot({ timeoutMs, ...o })),

        // #11 savedConfigs — filesystem read; no tuner socket, no gate.
        savedConfigurations: () =>
          Effect.tryPromise({
            try: () => listCiv7SavedGameConfigurations(),
            catch: (err) => err,
          }),

        // #5 live.snapshot — getCiv7MapGrid(input, { timeoutMs })
        mapGrid: (input: Parameters<typeof getCiv7MapGrid>[0]) =>
          tuner.use((o) => getCiv7MapGrid(input, { timeoutMs, ...o })),

        // #6 live.entities — player/unit/city summaries
        playerSummary: (input: Parameters<typeof getCiv7PlayerSummary>[0]) =>
          tuner.use((o) => getCiv7PlayerSummary(input, { timeoutMs, ...o })),
        unitSummary: (input: Parameters<typeof getCiv7UnitSummary>[0]) =>
          tuner.use((o) => getCiv7UnitSummary(input, { timeoutMs, ...o })),
        citySummary: (input: Parameters<typeof getCiv7CitySummary>[0]) =>
          tuner.use((o) => getCiv7CitySummary(input, { timeoutMs, ...o })),
      };
    }),
  }
) {}
