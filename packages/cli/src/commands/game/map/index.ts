import { Command, Flags } from '@oclif/core';
import {
  parseWorldBounds,
  parseWorldLocation,
  parseWorldPlotFields,
  readCiv7World,
} from '../../../utils/game-map-shared';

// Topic index for the `game map` noun (D2 in
// docs/projects/cli-command-taxonomy/workstream-record.md): the original
// flag-multiplexed command is preserved verbatim so every existing
// `game map --summary/--plot/--bounds` invocation keeps working unchanged.
// The focused subcommands (`game map summary|plot|grid`) delegate to the
// same readCiv7World service-call helper.

export default class GameMap extends Command {
  static id = 'game map';
  static summary = 'Read Civ7 current world and bounded map state';
  static description =
    'Reads service-owned current world, plot, or bounded grid views through control-oRPC.';

  static examples = [
    '<%= config.bin %> game map --summary --json',
    '<%= config.bin %> game map --plot 32,33 --player-id 0 --fields terrain,resource,visibility --json',
    '<%= config.bin %> game map --bounds 0,0,16,16 --fields terrain,biome --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    summary: Flags.boolean({
      description: 'Read the current world summary',
      default: false,
    }),
    plot: Flags.string({
      description: 'Plot location as x,y',
    }),
    bounds: Flags.string({
      description: 'Grid bounds as x,y,width,height',
    }),
    fields: Flags.string({
      description: 'Comma-separated plot fields',
    }),
    'player-id': Flags.integer({
      description: 'Player id for visibility-scoped reads',
    }),
    'include-hidden': Flags.boolean({
      description: 'Include hidden plot facts for developer diagnostics',
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
    const { flags } = await this.parse(GameMap);
    const options = {
      host: flags.host,
      port: flags.port,
      timeoutMs: flags['timeout-ms'],
    };
    const fields = parseWorldPlotFields(flags.fields);
    const playerId = flags['player-id'];
    let result: unknown;
    if (flags.bounds) {
      result = await readCiv7World(
        {
          mode: 'grid',
          bounds: parseWorldBounds(flags.bounds),
          fields,
          playerId,
          includeHidden: flags['include-hidden'],
          maxPlots: flags['max-plots'],
        },
        options,
      );
    } else if (flags.plot) {
      result = await readCiv7World(
        {
          mode: 'plot',
          location: parseWorldLocation(flags.plot),
          fields,
          playerId,
          includeHidden: flags['include-hidden'],
        },
        options,
      );
    } else {
      result = await readCiv7World({ mode: 'summary' }, options);
    }

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, result }));
      return;
    }

    this.log(JSON.stringify(result, null, 2));
  }
}
