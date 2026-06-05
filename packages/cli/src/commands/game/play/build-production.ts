import { Command, Flags } from '@oclif/core';
import { createCiv7ControlOrpcServerClient } from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import {
  buildDirectControlOptions,
  emitPlayResult,
  parseComponentId,
  validatePlayOperation,
} from '../../../utils/game-play-shared';

const BUILD = 'BUILD';

type BuildProductionFlags = Readonly<{
  host?: string;
  port?: number;
  'city-id': string;
  'unit-type'?: number;
  'constructible-type'?: number;
  'project-type'?: number;
  x?: number;
  y?: number;
  send: boolean;
  'timeout-ms': number;
  json: boolean;
}>;

export default class GamePlayBuildProduction extends Command {
  static id = 'game play build-production';
  static summary = 'Validate or choose city production';
  static description =
    'Validates city-operation BUILD choices, or sends production through the native control-oRPC city procedure when --send is explicit.';

  static examples = [
    '<%= config.bin %> game play build-production --city-id \'{"owner":0,"id":65536,"type":25}\' --unit-type 1558890441 --json',
    '<%= config.bin %> game play build-production --city-id \'{"owner":0,"id":65536,"type":1}\' --constructible-type 713967338 --x 22 --y 31 --send --json',
    '<%= config.bin %> game play build-production --city-id \'{"owner":0,"id":65536,"type":1}\' --project-type 12345 --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    'city-id': Flags.string({
      description: 'City ComponentID JSON',
      required: true,
    }),
    'unit-type': Flags.integer({
      description: 'UnitType id from the live production chooser/GameInfo',
      exclusive: ['constructible-type', 'project-type'],
    }),
    'constructible-type': Flags.integer({
      description: 'ConstructibleType id from the live production chooser/GameInfo',
      exclusive: ['unit-type', 'project-type'],
    }),
    'project-type': Flags.integer({
      description: 'ProjectType id from the live production chooser/GameInfo',
      exclusive: ['unit-type', 'constructible-type'],
    }),
    x: Flags.integer({
      description: 'Placement plot X coordinate for placement-sensitive constructibles',
      dependsOn: ['y'],
    }),
    y: Flags.integer({
      description: 'Placement plot Y coordinate for placement-sensitive constructibles',
      dependsOn: ['x'],
    }),
    send: Flags.boolean({
      description: 'Send BUILD after validator success',
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
    const { flags } = await this.parse(GamePlayBuildProduction);
    const typedFlags = flags as BuildProductionFlags;
    const input = {
      operationType: BUILD,
      cityId: parseComponentId(typedFlags['city-id'], 'city-id'),
      args: buildProductionArgs(typedFlags),
    };
    const options = buildDirectControlOptions(typedFlags);
    const result = typedFlags.send
      ? await createCiv7ControlOrpcServerClient({
          directControl: liveCiv7ControlOrpcDirectControlFacade,
          endpointDefaults: options,
        }).city.production.choice.request({ cityId: input.cityId, args: input.args })
      : await validatePlayOperation('city-operation', input, options);

    emitPlayResult(this.log.bind(this), typedFlags.json, result);
  }
}

function buildProductionArgs(flags: BuildProductionFlags): Record<string, number> {
  const itemKinds = [
    ['UnitType', flags['unit-type']],
    ['ConstructibleType', flags['constructible-type']],
    ['ProjectType', flags['project-type']],
  ] as const;
  const selected = itemKinds.filter(([, value]) => value !== undefined);
  if (selected.length !== 1) {
    throw new Error('game play build-production requires exactly one of --unit-type, --constructible-type, or --project-type');
  }

  const [key, value] = selected[0];
  if (value === undefined) {
    throw new Error('game play build-production requires a production item id');
  }
  const args: Record<string, number> = {};
  args[key] = value;
  if (flags.x !== undefined || flags.y !== undefined) {
    if (key !== 'ConstructibleType') {
      throw new Error('--x/--y placement coordinates are only supported with --constructible-type');
    }
    if (flags.x === undefined || flags.y === undefined) {
      throw new Error('--x and --y must be provided together');
    }
    args.X = flags.x;
    args.Y = flags.y;
  }
  return args;
}
