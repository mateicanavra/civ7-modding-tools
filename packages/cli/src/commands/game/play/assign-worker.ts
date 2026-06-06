import { Command, Flags } from '@oclif/core';
import { createCiv7ControlOrpcServerClient } from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import {
  buildDirectControlOptions,
  emitPlayResult,
  validatePlayOperation,
} from '../../../utils/game-play-shared';

const ASSIGN_WORKER = 'ASSIGN_WORKER';

export default class GamePlayAssignWorker extends Command {
  static id = 'game play assign-worker';
  static summary = 'Validate or assign a city growth worker';
  static description =
    'Validates player-operation ASSIGN_WORKER choices, or sends worker placement through the native control-oRPC city population procedure when --send is explicit.';

  static examples = [
    '<%= config.bin %> game play assign-worker --player-id 0 --location 2543 --json',
    '<%= config.bin %> game play assign-worker --player-id 0 --location 2543 --send --json',
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
    location: Flags.integer({
      description: 'Plot index/location selected for worker placement',
      required: true,
    }),
    amount: Flags.integer({
      description: 'Worker amount',
      default: 1,
    }),
    send: Flags.boolean({
      description: 'Send ASSIGN_WORKER after validator success',
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
    const { flags } = await this.parse(GamePlayAssignWorker);
    const input = {
      operationType: ASSIGN_WORKER,
      playerId: flags['player-id'],
      args: {
        Location: flags.location,
        Amount: flags.amount,
      },
    };
    const options = buildDirectControlOptions(flags);
    if (flags.send && flags.amount !== 1) {
      throw new Error('game play assign-worker --send supports the source-owned one-worker placement atom; omit --amount or use --amount 1');
    }
    const result = flags.send
      ? await createCiv7ControlOrpcServerClient({
          directControl: liveCiv7ControlOrpcDirectControlFacade,
          endpointDefaults: options,
        }).city.population.place.request({
          mode: 'assign-worker',
          playerId: input.playerId,
          location: flags.location,
        })
      : await validatePlayOperation('player-operation', input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
