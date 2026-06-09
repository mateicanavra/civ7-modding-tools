import { Command, Flags } from '@oclif/core';
import { getCiv7VisibilitySummary, revealCiv7MapForPlayer } from '@civ7/direct-control';

export default class GameVisibility extends Command {
  static id = 'game visibility';
  static summary = 'Read or reveal Civ7 player visibility';
  static description =
    'Reads bounded visibility state, or explicitly reveals the map for a disposable debug session through @civ7/direct-control.';

  static examples = [
    '<%= config.bin %> game visibility --player-id 0 --bounds 0,0,32,32 --json',
    '<%= config.bin %> game visibility --player-id 0 --reveal --disposable --json',
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
    reveal: Flags.boolean({
      description: 'Reveal all plots for the player',
      default: false,
    }),
    disposable: Flags.boolean({
      description: 'Confirm this is a disposable debug session for reveal',
      default: false,
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
    const { flags } = await this.parse(GameVisibility);
    const options = {
      host: flags.host,
      port: flags.port,
      timeoutMs: flags['timeout-ms'],
    };
    if (flags.reveal && flags.disposable !== true) {
      throw new Error('game visibility --reveal requires --disposable');
    }
    const result = flags.reveal
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
