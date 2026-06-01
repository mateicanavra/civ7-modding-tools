import { Args, Command, Flags } from '@oclif/core';
import { getCiv7GameInfoRows } from '@civ7/direct-control';

export default class GameGameInfo extends Command {
  static id = 'game gameinfo';
  static summary = 'Read bounded Civ7 GameInfo rows';
  static description =
    'Reads a targeted GameInfo table through @civ7/direct-control without exposing arbitrary SQL.';

  static examples = [
    '<%= config.bin %> game gameinfo Resources --limit 50 --json',
    '<%= config.bin %> game gameinfo Units --lookup UNIT_SETTLER --json',
  ];

  static args = {
    table: Args.string({
      description: 'GameInfo table name, such as Resources or Units',
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
    lookup: Flags.string({
      description: 'Lookup key',
    }),
    filter: Flags.string({
      description: 'Filter as key=value',
    }),
    limit: Flags.integer({
      description: 'Maximum rows',
      default: 100,
    }),
    offset: Flags.integer({
      description: 'Row offset',
      default: 0,
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
    const { args, flags } = await this.parse(GameGameInfo);
    const result = await getCiv7GameInfoRows({
      table: args.table,
      lookup: flags.lookup,
      filter: flags.filter ? parseFilter(flags.filter) : undefined,
      limit: flags.limit,
      offset: flags.offset,
    }, {
      host: flags.host,
      port: flags.port,
      timeoutMs: flags['timeout-ms'],
    });

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, result }));
      return;
    }

    this.log(JSON.stringify(result, null, 2));
  }
}

function parseFilter(value: string): { key: string; equals: string | number | boolean } {
  const separator = value.indexOf('=');
  if (separator < 1) throw new Error(`Invalid filter: ${value}`);
  return {
    key: value.slice(0, separator),
    equals: parseScalar(value.slice(separator + 1)),
  };
}

function parseScalar(value: string): string | number | boolean {
  if (value === 'true') return true;
  if (value === 'false') return false;
  const numeric = Number(value);
  return Number.isFinite(numeric) && value.trim() !== '' ? numeric : value;
}
