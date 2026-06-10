import {
  DEFAULT_CIV7_TUNER_TIMEOUT_MS,
  getCiv7AppUiSnapshot,
  getCiv7AutoplayStatus,
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

/**
 * `Civ7TunerClient` — Effect service wrapping the `@civ7/direct-control` FireTuner
 * socket + filesystem reads used by the studio's read surface.
 *
 * Each accessor lifts a direct-control promise into an Effect via
 * `Effect.tryPromise`, surfacing the rejection in the Effect error channel so the
 * procedure layer (router/*) can map it to the correct legacy status code. The
 * direct-control *call shapes* (args, timeout, includeAreaRegionCounts, clamps)
 * are lifted verbatim from the `/api/*` handlers in
 * `apps/mapgen-studio/vite.config.ts` — no semantic change.
 *
 * Parity note: the studio remains direct-control-backed for these live reads this
 * run (FRAME §4.7). The control-oRPC seam (architecture/12) is designed-toward,
 * not yet bound. No FireTuner reads are added beyond the existing handler set.
 */
export class Civ7TunerClient extends Effect.Service<Civ7TunerClient>()(
  "@civ7/studio-server/Civ7TunerClient",
  {
    accessors: true,
    sync: () => {
      const timeoutMs = DEFAULT_CIV7_TUNER_TIMEOUT_MS;
      return {
        // #1 status — getCiv7PlayableStatus({ timeoutMs })
        playableStatus: () =>
          Effect.tryPromise(() => getCiv7PlayableStatus({ timeoutMs })),

        // #2 mapSummary — includeAreaRegionCounts: true
        mapSummary: () =>
          Effect.tryPromise(() =>
            getCiv7MapSummary({ timeoutMs, includeAreaRegionCounts: true }),
          ),

        // live.status field read — includeAreaRegionCounts: false
        liveMapSummary: () =>
          Effect.tryPromise(() =>
            getCiv7MapSummary({ timeoutMs, includeAreaRegionCounts: false }),
          ),

        appUiSnapshot: () => Effect.tryPromise(() => getCiv7AppUiSnapshot({ timeoutMs })),

        autoplayStatus: () => Effect.tryPromise(() => getCiv7AutoplayStatus({ timeoutMs })),

        // #3 / live.gameInfo — getCiv7GameInfoRows({ table, limit }, { timeoutMs })
        gameInfoRows: (table: string, limit: number) =>
          Effect.tryPromise(() => getCiv7GameInfoRows({ table, limit }, { timeoutMs })),

        // #10 setupConfig — getCiv7SetupSnapshot({ timeoutMs })
        setupSnapshot: () => Effect.tryPromise(() => getCiv7SetupSnapshot({ timeoutMs })),

        // #11 savedConfigs — listCiv7SavedGameConfigurations()
        savedConfigurations: () => Effect.tryPromise(() => listCiv7SavedGameConfigurations()),

        // #5 live.snapshot — getCiv7MapGrid(input, { timeoutMs })
        mapGrid: (input: Parameters<typeof getCiv7MapGrid>[0]) =>
          Effect.tryPromise(() => getCiv7MapGrid(input, { timeoutMs })),

        // #6 live.entities — player/unit/city summaries
        playerSummary: (input: Parameters<typeof getCiv7PlayerSummary>[0]) =>
          Effect.tryPromise(() => getCiv7PlayerSummary(input, { timeoutMs })),
        unitSummary: (input: Parameters<typeof getCiv7UnitSummary>[0]) =>
          Effect.tryPromise(() => getCiv7UnitSummary(input, { timeoutMs })),
        citySummary: (input: Parameters<typeof getCiv7CitySummary>[0]) =>
          Effect.tryPromise(() => getCiv7CitySummary(input, { timeoutMs })),
      };
    },
  },
) {}
