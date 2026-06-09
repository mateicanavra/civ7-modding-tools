import { Command, Flags } from '@oclif/core';
import { createCiv7ControlOrpcServerClient } from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import {
  buildDirectControlOptions,
  emitPlayResult,
  parseComponentId,
  validatePlayOperation,
} from '../../../utils/game-play-shared';

const RESPOND_DIPLOMATIC_ACTION = 'RESPOND_DIPLOMATIC_ACTION';

export default class GamePlayRespondDiplomacy extends Command {
  static id = 'game play respond-diplomacy';
  static summary = 'Validate or send a diplomacy response';
  static description =
    'Validates diplomacy responses as player operations, or sends them through the native control-oRPC diplomacy procedure when --send is explicit.';

  static examples = [
    '<%= config.bin %> game play respond-diplomacy --player-id 0 --action-id 56 --response-type -1907089594 --json',
    '<%= config.bin %> game play respond-diplomacy --action-id 56 --response-type -1907089594 --send --json',
    '<%= config.bin %> game play respond-diplomacy --action-id 56 --response-type 926305338 --notification-id \'{"owner":0,"id":19,"type":20}\' --send --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    'player-id': Flags.integer({
      description: 'Player id used for dry-run validation. Send mode follows official UI behavior and uses GameContext.localPlayerID.',
      default: 0,
    }),
    'action-id': Flags.integer({
      description: 'Diplomatic action ID from the live diplomacy notification',
      required: true,
    }),
    'response-type': Flags.integer({
      description: 'Response Type enum value from the live diplomacy UI',
      required: true,
    }),
    'notification-id': Flags.string({
      description: 'Optional diplomatic-response notification ComponentID JSON; send mode activates it before responding',
    }),
    send: Flags.boolean({
      description: 'Send RESPOND_DIPLOMATIC_ACTION after validator success',
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
    const { flags } = await this.parse(GamePlayRespondDiplomacy);
    const options = buildDirectControlOptions(flags);
    if (flags.send) {
      const result = await createCiv7ControlOrpcServerClient({
        directControl: liveCiv7ControlOrpcDirectControlFacade,
        endpointDefaults: options,
      }).diplomacy.response.request({
        actionId: flags['action-id'],
        responseType: flags['response-type'],
        ...(flags['notification-id'] ? { notificationId: parseComponentId(flags['notification-id'], 'notification-id') } : {}),
      });
      emitPlayResult(this.log.bind(this), flags.json, result);
      return;
    }

    const input = {
      operationType: RESPOND_DIPLOMATIC_ACTION,
      playerId: flags['player-id'],
      args: {
        ID: flags['action-id'],
        Type: flags['response-type'],
      },
    };
    const result = await validatePlayOperation('player-operation', input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
