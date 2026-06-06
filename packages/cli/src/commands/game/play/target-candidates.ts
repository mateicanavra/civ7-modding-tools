import { Command, Flags } from '@oclif/core';
import { createCiv7ControlOrpcServerClient } from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import { buildDirectControlOptions, resolveCoordinateFlags } from '../../../utils/game-play-shared';

export default class GamePlayTargetCandidates extends Command {
  static id = 'game play target-candidates';
  static summary = 'Read strategic target candidates from live city and unit summaries';
  static description =
    'Returns a read-only shortlist of other-owner contacts ranked from a supplied siege/formation origin. It is planning support, not relationship, movement, diplomacy, or action authority.';

  static examples = [
    '<%= config.bin %> game play target-candidates --json',
    '<%= config.bin %> game play target-candidates --x 18 --y 20 --max-candidates 5 --json',
    '<%= config.bin %> game play target-candidates --origin 18,20 --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    'player-id': Flags.integer({
      description: 'Player id to inspect. Defaults to GameContext.localPlayerID.',
    }),
    x: Flags.integer({
      description: 'Formation or siege origin x coordinate',
      dependsOn: ['y'],
    }),
    y: Flags.integer({
      description: 'Formation or siege origin y coordinate',
      dependsOn: ['x'],
    }),
    origin: Flags.string({
      description: 'Formation or siege origin as x,y',
    }),
    'max-candidates': Flags.integer({
      description: 'Maximum target candidates to return',
      default: 8,
    }),
    'max-players': Flags.integer({
      description: 'Maximum alive players to inspect',
      default: 32,
    }),
    'unit-radius': Flags.integer({
      description: 'Radius around each nearest city for apparent unit density',
      default: 4,
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
    const { flags } = await this.parse(GamePlayTargetCandidates);
    const origin = resolveCoordinateFlags({
      x: flags.x,
      y: flags.y,
      pair: flags.origin,
      xFlag: 'x',
      yFlag: 'y',
      pairFlag: 'origin',
    });
    const origins = origin ? [origin] : undefined;
    const view = await createCiv7ControlOrpcServerClient({
      directControl: liveCiv7ControlOrpcDirectControlFacade,
      endpointDefaults: buildDirectControlOptions(flags),
    }).strategy.targetCandidates({
      playerId: flags['player-id'],
      origins,
      maxCandidates: flags['max-candidates'],
      maxPlayers: flags['max-players'],
      unitRadius: flags['unit-radius'],
    });

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, view }));
      return;
    }

    this.log(`Player: ${view.playerId}; origins: ${formatValue(view.origins)}`);
    this.log(`Hidden info policy: ${view.hiddenInfoPolicy}`);
    for (const candidate of view.candidates) {
      this.log(`- owner ${candidate.owner}: distance=${candidate.nearestDistance ?? '<unknown>'}; cities=${candidate.cityCount}; units=${candidate.unitCount}; nearby=${candidate.nearbyUnitCount}; strength=${candidate.apparentStrength}`);
      this.log(`  civ=${candidate.civilizationName ?? '<unknown>'} leader=${candidate.leaderName ?? '<unknown>'} route=${candidate.approach.routeHint} kind=${candidate.approach.routeKind ?? '<unknown>'}`);
      this.log(`  nearest=${formatValue(candidate.nearestCityLocation)}`);
      if (candidate.reasons.length > 0) this.log(`  reasons=${candidate.reasons.join('; ')}`);
    }
    for (const note of view.notes) this.log(`Note: ${note}`);
  }
}

function formatValue(value: unknown): string {
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}
