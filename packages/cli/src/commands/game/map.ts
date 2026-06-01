import { Command, Flags } from '@oclif/core';
import { getCiv7MapGrid, getCiv7MapSummary, getCiv7PlotSnapshot, type Civ7PlotSnapshotField } from '@civ7/direct-control';

export default class GameMap extends Command {
  static id = 'game map';
  static summary = 'Read bounded Civ7 map state through direct control';
  static description =
    'Reads map summary, one plot, or a bounded plot grid through @civ7/direct-control.';

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
      description: 'Read the map summary',
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
    const fields = parseFields(flags.fields);
    const playerId = flags['player-id'];
    let result: unknown;
    if (flags.bounds) {
      result = await getCiv7MapGrid({
        bounds: parseBounds(flags.bounds),
        fields,
        playerId,
        includeHidden: flags['include-hidden'],
        maxPlots: flags['max-plots'],
      }, options);
    } else if (flags.plot) {
      result = await getCiv7PlotSnapshot({
        ...parseLocation(flags.plot),
        fields,
        playerId,
        includeHidden: flags['include-hidden'],
      }, options);
    } else {
      result = await getCiv7MapSummary({
        ...options,
        includeAreaRegionCounts: flags.summary,
      });
    }

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, result }));
      return;
    }

    this.log(JSON.stringify(result, null, 2));
  }
}

function parseFields(value: string | undefined): Civ7PlotSnapshotField[] {
  return (value?.split(',').map((field) => field.trim()).filter(Boolean) as Civ7PlotSnapshotField[] | undefined)
    ?? ['terrain', 'biome', 'feature', 'resource', 'owner', 'visibility', 'areaRegion'];
}

function parseLocation(value: string): { x: number; y: number } {
  const [x, y] = value.split(',').map((part) => Number(part.trim()));
  if (!Number.isInteger(x) || !Number.isInteger(y)) throw new Error(`Invalid location: ${value}`);
  return { x, y };
}

function parseBounds(value: string): { x: number; y: number; width: number; height: number } {
  const [x, y, width, height] = value.split(',').map((part) => Number(part.trim()));
  if (![x, y, width, height].every(Number.isInteger)) throw new Error(`Invalid bounds: ${value}`);
  return { x, y, width, height };
}
