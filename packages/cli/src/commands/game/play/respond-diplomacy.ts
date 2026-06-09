import { Command, Flags } from '@oclif/core';
import { requestCiv7DiplomacyResponse } from '@civ7/direct-control';
import {
  buildApproval,
  buildDirectControlOptions,
  emitPlayResult,
  parseComponentId,
  requireSendReason,
  validatePlayOperation,
} from '../../../utils/game-play-shared';

const RESPOND_DIPLOMATIC_ACTION = 'RESPOND_DIPLOMATIC_ACTION';

export default class GamePlayRespondDiplomacy extends Command {
  static id = 'game play respond-diplomacy';
  static summary = 'Validate or send a diplomacy response';
  static description =
    'Wraps player-operation RESPOND_DIPLOMATIC_ACTION with the live diplomatic action ID and response Type.';

  static examples = [
    '<%= config.bin %> game play respond-diplomacy --player-id 0 --action-id 56 --response-type -1907089594 --json',
    '<%= config.bin %> game play respond-diplomacy --player-id 0 --action-id 56 --response-type -1907089594 --send --reason "support Farmers Market diplomacy" --json',
    '<%= config.bin %> game play respond-diplomacy --action-id 56 --response-type 926305338 --notification-id \'{"owner":0,"id":19,"type":20}\' --send --reason "accept diplomacy response" --json',
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
    const { flags } = await this.parse(GamePlayRespondDiplomacy);
    const reason = requireSendReason(flags.send, flags.reason, 'game play respond-diplomacy');
    const options = buildDirectControlOptions(flags);
    if (flags.send) {
      const result = await requestCiv7DiplomacyResponse(
        {
          playerId: flags['player-id'],
          actionId: flags['action-id'],
          responseType: flags['response-type'],
          ...(flags['notification-id'] ? { notificationId: parseComponentId(flags['notification-id'], 'notification-id') } : {}),
          activateNotification: true,
          uiCloseout: true,
        },
        options,
        buildApproval(reason),
      );
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
