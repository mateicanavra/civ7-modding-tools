import { Command, Flags } from '@oclif/core';
import { createCiv7ControlOrpcServerClient } from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import { buildDirectControlOptions, resolveCoordinateFlags } from '../../../utils/game-play-shared';

export default class GamePlayBattlefieldScan extends Command {
  static id = 'game play battlefield-scan';
  static summary = 'Read a tactical battlefield lens around one or more origins';
  static description =
    'Returns a read-only scan of owner contact, apparent strength, and tactical points of interest. It is a heads-up planning lens, not movement, pathfinding, attack, or action authority.';

  static examples = [
    '<%= config.bin %> game play battlefield-scan --json',
    '<%= config.bin %> game play battlefield-scan --x 17 --y 20 --radius 8 --json',
    '<%= config.bin %> game play battlefield-scan --origin 17,20 --radius 8 --json',
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
      description: 'Front, formation, city, or destination origin x coordinate',
      dependsOn: ['y'],
    }),
    y: Flags.integer({
      description: 'Front, formation, city, or destination origin y coordinate',
      dependsOn: ['x'],
    }),
    origin: Flags.string({
      description: 'Front, formation, city, or destination origin as x,y',
    }),
    radius: Flags.integer({
      description: 'Grid radius around each origin to scan',
      default: 8,
      min: 1,
      max: 32,
    }),
    'max-players': Flags.integer({
      description: 'Maximum alive players to inspect',
      default: 32,
    }),
    'max-units': Flags.integer({
      description: 'Maximum nearby unit summaries to return',
      default: 80,
    }),
    'max-cities': Flags.integer({
      description: 'Maximum nearby city summaries to return',
      default: 32,
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
    const { flags } = await this.parse(GamePlayBattlefieldScan);
    const origin = resolveCoordinateFlags({
      x: flags.x,
      y: flags.y,
      pair: flags.origin,
      xFlag: 'x',
      yFlag: 'y',
      pairFlag: 'origin',
    });
    const origins = origin ? [origin] : undefined;
    const view = await createCiv7ControlOrpcServerClient({
      directControl: liveCiv7ControlOrpcDirectControlFacade,
      endpointDefaults: buildDirectControlOptions(flags),
    }).strategy.battlefieldScan({
      playerId: flags['player-id'],
      origins,
      radius: flags.radius,
      maxPlayers: flags['max-players'],
      maxUnits: flags['max-units'],
      maxCities: flags['max-cities'],
    });

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, view }));
      return;
    }

    this.log(`Player: ${view.playerId}; origins: ${formatValue(view.origins)}; radius=${view.radius}`);
    this.log(`Hidden info policy: ${view.hiddenInfoPolicy}`);
    for (const point of asArray(view.pointsOfInterest)) {
      this.log(`- ${formatValue(point)}`);
    }
    for (const owner of view.owners.slice(0, 8)) {
      this.log(`owner: ${formatValue(owner)}`);
    }
    for (const note of view.notes) this.log(`Note: ${note}`);
  }
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function formatValue(value: unknown): string {
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}
