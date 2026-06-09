import { Command, Flags } from '@oclif/core';
import {
  createCiv7ControlOrpcServerClient,
  type Civ7StrategyFormationSnapshotResult,
} from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import { buildDirectControlOptions } from '../../../utils/game-play-shared';

type FormationNextStep = Civ7StrategyFormationSnapshotResult['nextSteps'][number];
type FormationSnapshotCliView =
  Omit<Civ7StrategyFormationSnapshotResult, 'formation'> & {
    formation: Omit<Civ7StrategyFormationSnapshotResult['formation'], 'nextSteps'> & {
      nextSteps: Civ7StrategyFormationSnapshotResult['formation']['nextSteps'];
      nextInspections: string[];
    };
  };

export default class GamePlayFormationSnapshot extends Command {
  static id = 'game play formation-snapshot';
  static summary = 'Read ready-unit formation, escort, and civilian-screen context';
  static description =
    'Composes the current ready unit and a bounded battlefield scan into a read-only formation snapshot for escort, screen, and tactical movement decisions.';

  static examples = [
    '<%= config.bin %> game play formation-snapshot --json',
    '<%= config.bin %> game play formation-snapshot --x 20 --y 18 --radius 6 --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    'player-id': Flags.integer({
      description: 'Player id to inspect. Defaults to GameContext.localPlayerID.',
    }),
    x: Flags.integer({
      description: 'Formation origin x coordinate. Defaults to the first ready unit location.',
      dependsOn: ['y'],
    }),
    y: Flags.integer({
      description: 'Formation origin y coordinate. Defaults to the first ready unit location.',
      dependsOn: ['x'],
    }),
    radius: Flags.integer({
      description: 'Battlefield scan radius around the formation origin',
      default: 6,
      min: 1,
      max: 16,
    }),
    'screen-radius': Flags.integer({
      description: 'Maximum grid distance for own units to count as local screens near a civilian',
      default: 2,
      min: 1,
      max: 6,
    }),
    'contact-radius': Flags.integer({
      description: 'Maximum grid distance for other-owner units to count as immediate civilian contacts. Defaults to 4.',
      min: 1,
      max: 8,
    }),
    'max-units': Flags.integer({
      description: 'Maximum nearby unit summaries to return',
      default: 96,
    }),
    'max-cities': Flags.integer({
      description: 'Maximum nearby city summaries to return',
      default: 40,
    }),
    'timeout-ms': Flags.integer({
      description: 'Socket timeout',
      default: 45_000,
    }),
    json: Flags.boolean({
      description: 'Emit machine-readable JSON',
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GamePlayFormationSnapshot);
    const endpointDefaults = buildDirectControlOptions(flags);
    const origin = flags.x === undefined || flags.y === undefined
      ? undefined
      : { x: flags.x, y: flags.y };
    const client = createCiv7ControlOrpcServerClient({
      directControl: liveCiv7ControlOrpcDirectControlFacade,
      endpointDefaults,
    });
    const result = await client.strategy.formationSnapshot({
      playerId: flags['player-id'],
      origin,
      radius: flags.radius,
      screenRadius: flags['screen-radius'],
      contactRadius: flags['contact-radius'],
      maxUnits: flags['max-units'],
      maxCities: flags['max-cities'],
    });
    const view = formationCliView(result);

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, view }));
      return;
    }

    this.log(view.formation.headline);
    this.log(`Posture: ${view.formation.posture}`);
    for (const reason of view.formation.reasons) this.log(`Reason: ${reason}`);
    for (const next of view.formation.nextInspections) {
      this.log(`Next: ${next}`);
    }
  }
}

function formationCliView(
  result: Civ7StrategyFormationSnapshotResult,
): FormationSnapshotCliView {
  return {
    ...result,
    formation: {
      ...result.formation,
      nextInspections: result.formation.nextSteps.map(nextInspectionLabel),
    },
  };
}

function nextInspectionLabel(step: FormationNextStep): string {
  return step.label;
}
