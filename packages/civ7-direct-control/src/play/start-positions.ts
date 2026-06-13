import { Type } from "typebox";

import { Civ7RuntimeProbeSchema, probeHelperSource } from "../runtime/probe.js";
import { jsonPayloadFromCommandResult } from "../session/command-result.js";
import { executeCiv7TunerCommand } from "../session/execute.js";
import { Civ7MapLocationSchema } from "./map/types.js";

import type { Civ7RuntimeProbe } from "../runtime/probe.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "../session/types.js";
import type { Civ7MapLocation } from "./map/types.js";

// Live-verified against a running Civ7 game on 2026-06-11
// (docs/projects/placement-realignment/evidence/milestone-b-2026-06-11.md, placement stack):
// the engine exposes NO start-plot getter on the player prototype — a live probe of the
// prototype found zero /[Ss]tart/ members. The turn-1 founder-unit position IS the start
// plot, but only before units move, so this read is named "founder-unit-derived" and always
// reports Game.turn so callers can judge validity themselves.

export const CIV7_START_POSITIONS_METHOD = "founder-unit-derived" as const;

export type Civ7StartPositionPlayer = Readonly<{
  id: number;
  isHuman: boolean;
  civilizationType: string | number | null;
  leaderType: string | number | null;
  unitCount: number;
  firstUnitPlot: Civ7MapLocation | null;
}>;

export const Civ7StartPositionPlayerSchema = Type.Object(
  {
    id: Type.Integer({ minimum: 0, maximum: 1024 }),
    isHuman: Type.Boolean(),
    civilizationType: Type.Union([Type.String(), Type.Number(), Type.Null()]),
    leaderType: Type.Union([Type.String(), Type.Number(), Type.Null()]),
    unitCount: Type.Integer({ minimum: 0 }),
    firstUnitPlot: Type.Union([Civ7MapLocationSchema, Type.Null()]),
  },
  { additionalProperties: false }
);

const civ7TunerStateSchema = Type.Object(
  {
    id: Type.String(),
    name: Type.String(),
  },
  { additionalProperties: false }
);

export const Civ7StartPositionsResultSchema = Type.Object(
  {
    host: Type.String(),
    port: Type.Number(),
    state: civ7TunerStateSchema,
    method: Type.Literal(CIV7_START_POSITIONS_METHOD),
    turn: Civ7RuntimeProbeSchema(Type.Number()),
    players: Civ7RuntimeProbeSchema(Type.Array(Civ7StartPositionPlayerSchema)),
    notes: Type.Array(Type.String()),
  },
  { additionalProperties: false }
);

export type Civ7StartPositionsResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  method: typeof CIV7_START_POSITIONS_METHOD;
  turn: Civ7RuntimeProbe<number>;
  players: Civ7RuntimeProbe<ReadonlyArray<Civ7StartPositionPlayer>>;
  notes: ReadonlyArray<string>;
}>;

type StartPositionsReadDependencies = Readonly<{
  executeTunerCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>
  ) => Promise<Civ7CommandResult>;
  parseStartPositions: (result: Civ7CommandResult, label: string) => Civ7StartPositionsResult;
  probeHelperSource: () => string;
}>;

export async function readCiv7StartPositions(
  options: Civ7DirectControlOptions = {},
  dependencies: StartPositionsReadDependencies = defaultStartPositionsReadDependencies
): Promise<Civ7StartPositionsResult> {
  const result = await dependencies.executeTunerCommand({
    ...options,
    command: buildStartPositionsCommand(dependencies),
  });
  return dependencies.parseStartPositions(result, "Civ7 start positions");
}

export function buildStartPositionsCommand(
  dependencies: Pick<StartPositionsReadDependencies, "probeHelperSource">
): string {
  // CAVEAT (live-verified): there is no start-plot getter anywhere on the player prototype
  // (probed live: zero /[Ss]tart/ members). The founder unit's current location is only the
  // start plot while units have not moved — in practice on turn 1. Game.turn is reported so
  // callers can judge how trustworthy firstUnitPlot is as a start position.
  return `(() => {
    ${dependencies.probeHelperSource()}
    const readStartPositions = () => {
      const turn = probe(() => Game.turn);
      const players = probe(() => Players.getAliveMajorIds().map(id => {
        const p = Players.get(id);
        const units = p?.Units?.getUnits?.() ?? [];
        return {
          id,
          isHuman: !!p?.isHuman,
          civilizationType: p?.civilizationType ?? null,
          leaderType: p?.leaderType ?? null,
          unitCount: units.length,
          firstUnitPlot: units[0]?.location ?? null,
        };
      }));
      return { method: ${JSON.stringify(CIV7_START_POSITIONS_METHOD)}, turn, players };
    };
    return JSON.stringify(readStartPositions());
  })()`;
}

const CIV7_START_POSITIONS_NOTES: ReadonlyArray<string> = [
  "The engine exposes no start-plot getter on the player prototype (live probe found zero /[Ss]tart/ members), so start positions are founder-unit-derived.",
  "firstUnitPlot is the founder unit's CURRENT location: it equals the start plot only before units move (turn 1 in practice). Use the reported turn to judge validity.",
];

const defaultStartPositionsReadDependencies: StartPositionsReadDependencies = {
  executeTunerCommand: executeCiv7TunerCommand,
  parseStartPositions: (result, label) => ({
    ...jsonPayloadFromCommandResult<Omit<Civ7StartPositionsResult, "notes">>(result, label),
    notes: CIV7_START_POSITIONS_NOTES,
  }),
  probeHelperSource,
};
