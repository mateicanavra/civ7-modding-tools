import { Command, Flags } from '@oclif/core';
import {
  buildApproval,
  buildDirectControlOptions,
  emitPlayResult,
  executePlayOperationSequence,
  parseComponentId,
  requireSendReason,
  sendPlayOperation,
  validatePlayOperation,
} from '../../../utils/game-play-shared';

const CHANGE_GROWTH_MODE = 'CHANGE_GROWTH_MODE';
const CONSIDER_TOWN_PROJECT = 'CONSIDER_TOWN_PROJECT';

export default class GamePlaySetTownFocus extends Command {
  static id = 'game play set-town-focus';
  static summary = 'Validate or change a town focus project';
  static description =
    'Wraps city-command CHANGE_GROWTH_MODE for town focus choices, which are growth-mode commands rather than production BUILD requests.';

  static examples = [
    '<%= config.bin %> game play set-town-focus --city-id \'{"owner":0,"id":131073,"type":1}\' --growth-type -284569333 --project-type -548685232 --json',
    '<%= config.bin %> game play set-town-focus --city-id \'{"owner":0,"id":131073,"type":1}\' --growth-type -284569333 --project-type -548685232 --send --reason "set coastal town to Fishing Town focus" --json',
    '<%= config.bin %> game play set-town-focus --city-id \'{"owner":0,"id":131073,"type":1}\' --growth-type -284569333 --project-type -548685232 --send --closeout --reason "set and close reviewed town focus" --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    'city-id': Flags.string({
      description: 'Town ComponentID JSON',
      required: true,
    }),
    'growth-type': Flags.integer({
      description: 'GrowthTypes enum value from the live town focus UI',
      required: true,
    }),
    'project-type': Flags.integer({
      description: 'ProjectTypes enum value from the live town focus UI',
      required: true,
    }),
    city: Flags.integer({
      description: 'Numeric city id for the CHANGE_GROWTH_MODE args; defaults to city-id.id',
    }),
    send: Flags.boolean({
      description: 'Send CHANGE_GROWTH_MODE after validator success',
      default: false,
    }),
    closeout: Flags.boolean({
      description: 'Also run CONSIDER_TOWN_PROJECT as part of the same caller-level workflow',
      default: false,
    }),
    reason: Flags.string({
      description: 'Required approval reason for --send',
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
    const { flags } = await this.parse(GamePlaySetTownFocus);
    const reason = requireSendReason(flags.send, flags.reason, 'game play set-town-focus');
    const cityId = parseComponentId(flags['city-id'], 'city-id');
    const input = {
      operationType: CHANGE_GROWTH_MODE,
      cityId,
      args: {
        Type: flags['growth-type'],
        ProjectType: flags['project-type'],
        City: flags.city ?? cityId.id,
      },
    };
    const options = buildDirectControlOptions(flags);
    if (flags.closeout) {
      const result = await executePlayOperationSequence([
        {
          label: 'set town focus',
          family: 'city-command',
          input,
        },
        {
          label: 'close town project review',
          family: 'city-operation',
          input: {
            operationType: CONSIDER_TOWN_PROJECT,
            cityId,
            args: {},
          },
        },
      ], options, { send: flags.send, reason });

      emitPlayResult(this.log.bind(this), flags.json, result);
      return;
    }

    const result = flags.send
      ? await sendPlayOperation('city-command', input, options, buildApproval(reason))
      : await validatePlayOperation('city-command', input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
