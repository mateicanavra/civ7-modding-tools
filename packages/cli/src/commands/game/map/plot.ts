import { Args, Command, Flags } from '@oclif/core';
import {
  parseWorldLocation,
  parseWorldPlotFields,
  readCiv7World,
} from '../../../utils/game-map-shared';

// Thin delegation over the same world.plot service call as the
// `game map` topic index (`game map --plot x,y`); D2 in
// docs/projects/cli-command-taxonomy/workstream-record.md.

export default class GameMapPlot extends Command {
  static id = 'game map plot';
  static summary = 'Read one Civ7 plot';
  static description =
    'Reads a service-owned single-plot view through control-oRPC. ' +
    'Focused subcommand form of `game map --plot x,y`.';

  static examples = [
    '<%= config.bin %> game map plot 32,33 --player-id 0 --json',
    '<%= config.bin %> game map plot 32,33 --fields terrain,resource,visibility --json',
  ];

  static args = {
    location: Args.string({
      description: 'Plot location as x,y',
      required: true,
    }),
  } as const;

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
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
    const { args, flags } = await this.parse(GameMapPlot);
    const result = await readCiv7World(
      {
        mode: 'plot',
        location: parseWorldLocation(args.location),
        fields: parseWorldPlotFields(flags.fields),
        playerId: flags['player-id'],
        includeHidden: flags['include-hidden'],
      },
      {
        host: flags.host,
        port: flags.port,
        timeoutMs: flags['timeout-ms'],
      },
    );

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, result }));
      return;
    }

    this.log(JSON.stringify(result, null, 2));
  }
}
