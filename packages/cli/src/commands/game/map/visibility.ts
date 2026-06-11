import { Command, Flags } from '@oclif/core';
import {
  exploreCiv7MapForPlayer,
  getCiv7VisibilitySummary,
  revealCiv7MapForPlayer,
} from '@civ7/direct-control';

// Two discrete mutations, deliberately not interchangeable:
// --explore  terrain becomes known (REVEALED/fogged, no live vision) via the
//            engine's tracked visibility grants, with discovery popups
//            suppressed through the official display queue. The map-QA verb.
// --reveal   the engine's own Visibility.revealAllPlots(player) — a special,
//            rare-use per-player command whose discovery side effects display
//            normally.
export default class GameMapVisibility extends Command {
  static id = 'game map visibility';
  static summary = 'Read, explore, or reveal Civ7 player visibility';
  static description =
    'Reads bounded visibility state, explores the whole map (terrain known, fogged, popups ' +
    'suppressed), or reveals it outright via the engine reveal command, for a disposable debug ' +
    'session through @civ7/direct-control.';

  static examples = [
    '<%= config.bin %> game map visibility --player-id 0 --bounds 0,0,32,32 --json',
    '<%= config.bin %> game map visibility --player-id 0 --explore --disposable --json',
    '<%= config.bin %> game map visibility --player-id 0 --reveal --disposable --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    'player-id': Flags.integer({
      description: 'Player id',
      required: true,
    }),
    bounds: Flags.string({
      description: 'Grid bounds as x,y,width,height',
    }),
    grid: Flags.boolean({
      description: 'Include bounded visibility grid',
      default: false,
    }),
    explore: Flags.boolean({
      description: 'Explore the whole map for the player (terrain known under fog, discovery popups suppressed)',
      default: false,
      exclusive: ['reveal'],
    }),
    reveal: Flags.boolean({
      description: 'Reveal all plots for the player (engine reveal command; discovery popups display)',
      default: false,
    }),
    disposable: Flags.boolean({
      description: 'Confirm this is a disposable debug session for explore/reveal',
      default: false,
    }),
    'settle-ms': Flags.integer({
      description: 'Explore grant hold time so the fog-of-war renderer can stream the reveal (default scales with map size)',
    }),
    'max-plots': Flags.integer({
      description: 'Maximum plots for grid reads',
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
    const { flags } = await this.parse(GameMapVisibility);
    const options = {
      host: flags.host,
      port: flags.port,
      timeoutMs: flags['timeout-ms'],
    };
    if ((flags.reveal || flags.explore) && flags.disposable !== true) {
      throw new Error(`game map visibility --${flags.reveal ? 'reveal' : 'explore'} requires --disposable`);
    }
    const result = flags.explore
      ? await exploreCiv7MapForPlayer(
          {
            playerId: flags['player-id'],
            ...(flags['settle-ms'] === undefined ? {} : { settleMs: flags['settle-ms'] }),
          },
          options,
        )
      : flags.reveal
        ? await revealCiv7MapForPlayer(
            { playerId: flags['player-id'] },
            options,
          )
        : await getCiv7VisibilitySummary({
            playerId: flags['player-id'],
            bounds: flags.bounds ? parseBounds(flags.bounds) : undefined,
            includeGrid: flags.grid || Boolean(flags.bounds),
            maxPlots: flags['max-plots'],
          }, options);

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, result }));
      return;
    }

    this.log(JSON.stringify(result, null, 2));
  }
}

function parseBounds(value: string): { x: number; y: number; width: number; height: number } {
  const [x, y, width, height] = value.split(',').map((part) => Number(part.trim()));
  if (![x, y, width, height].every(Number.isInteger)) throw new Error(`Invalid bounds: ${value}`);
  return { x, y, width, height };
}
