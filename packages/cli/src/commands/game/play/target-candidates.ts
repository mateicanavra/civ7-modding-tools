import { Command, Flags } from '@oclif/core';
import { getCiv7TargetCandidates } from '@civ7/direct-control';
import { buildDirectControlOptions, resolveCoordinateFlags } from '../../../utils/game-play-shared';

export default class GamePlayTargetCandidates extends Command {
  static id = 'game play target-candidates';
  static summary = 'Read strategic target candidates from live city and unit summaries';
  static description =
    'Returns a read-only shortlist of opponent targets ranked from a supplied siege/formation origin. It is planning support, not a movement, diplomacy, or war operation.';

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
    const view = await getCiv7TargetCandidates({
      playerId: flags['player-id'],
      origins,
      maxCandidates: flags['max-candidates'],
      maxPlayers: flags['max-players'],
      unitRadius: flags['unit-radius'],
    }, buildDirectControlOptions(flags));

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, view }));
      return;
    }

    this.log(`Player: ${view.playerId}; origins: ${formatValue(view.origins)}`);
    this.log(`Hidden info policy: ${view.hiddenInfoPolicy}`);
    for (const candidate of view.candidates) {
      this.log(`- owner ${candidate.owner}: distance=${candidate.nearestDistance ?? '<unknown>'}; cities=${candidate.cityCount}; units=${candidate.unitCount}; nearby=${candidate.nearbyUnitCount}; strength=${candidate.apparentStrength}`);
      this.log(`  civ=${formatProbe(candidate.civilizationName)} leader=${formatProbe(candidate.leaderName)} route=${candidate.approach.routeHint} kind=${candidate.approach.routeKind ?? '<unknown>'}`);
      this.log(`  nearest=${formatValue(candidate.nearestCity)}`);
      this.log(`  settlements=${formatValue(candidate.cities)}`);
      if (candidate.reasons.length > 0) this.log(`  reasons=${candidate.reasons.join('; ')}`);
    }
    for (const note of view.notes) this.log(`Note: ${note}`);
  }
}

function formatProbe<T>(probe: { ok: true; value: T } | { ok: false; error: string }): string {
  if (!probe.ok) return `<error: ${probe.error}>`;
  return formatValue(probe.value);
}

function formatValue(value: unknown): string {
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}
