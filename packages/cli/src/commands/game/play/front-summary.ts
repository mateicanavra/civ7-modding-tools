import { Command, Flags } from '@oclif/core';
import { createCiv7ControlOrpcServerClient } from '@civ7/control-orpc';
import type { Civ7StrategyFrontSummaryResult } from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import { buildDirectControlOptions, resolveCoordinateFlags } from '../../../utils/game-play-shared';

type Location = Readonly<{ x: number; y: number }>;

export default class GamePlayFrontSummary extends Command {
  static id = 'game play front-summary';
  static summary = 'Read a composed front and formation summary without sending operations';
  static description =
    'Composes live target candidates, battlefield pressure, and optional destination/corridor analysis into a read-only front summary for military planning.';

  static examples = [
    '<%= config.bin %> game play front-summary --json',
    '<%= config.bin %> game play front-summary --x 15 --y 21 --json',
    '<%= config.bin %> game play front-summary --x 15 --y 21 --to-x 13 --to-y 17 --json',
    '<%= config.bin %> game play front-summary --origin 15,21 --destination 13,17 --json',
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
      description: 'Formation, siege line, or ready-unit origin x coordinate',
      dependsOn: ['y'],
    }),
    y: Flags.integer({
      description: 'Formation, siege line, or ready-unit origin y coordinate',
      dependsOn: ['x'],
    }),
    origin: Flags.string({
      description: 'Formation, siege line, or ready-unit origin as x,y',
    }),
    'to-x': Flags.integer({
      description: 'Optional intended target/front x coordinate. Defaults to the nearest target candidate city when available.',
      dependsOn: ['to-y'],
    }),
    'to-y': Flags.integer({
      description: 'Optional intended target/front y coordinate. Defaults to the nearest target candidate city when available.',
      dependsOn: ['to-x'],
    }),
    destination: Flags.string({
      description: 'Optional intended target/front as x,y. Defaults to the nearest target candidate city when available.',
    }),
    'target-x': Flags.integer({
      description: 'Alias for --to-x',
      dependsOn: ['target-y'],
    }),
    'target-y': Flags.integer({
      description: 'Alias for --to-y',
      dependsOn: ['target-x'],
    }),
    radius: Flags.integer({
      description: 'Battlefield scan radius around the front origin',
      default: 8,
      min: 1,
      max: 32,
    }),
    'corridor-radius': Flags.integer({
      description: 'Grid radius around the intended front corridor to inspect',
      default: 2,
      min: 0,
      max: 8,
    }),
    'destination-radius': Flags.integer({
      description: 'Grid radius around the intended target/front endpoint to inspect',
      default: 4,
      min: 1,
      max: 16,
    }),
    'max-candidates': Flags.integer({
      description: 'Maximum target candidates to return',
      default: 5,
    }),
    'max-players': Flags.integer({
      description: 'Maximum alive players to inspect',
      default: 32,
    }),
    'max-units': Flags.integer({
      description: 'Maximum nearby unit summaries to return',
      default: 96,
    }),
    'max-cities': Flags.integer({
      description: 'Maximum nearby city summaries to return',
      default: 40,
    }),
    'unit-radius': Flags.integer({
      description: 'Radius around target cities for apparent unit density',
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
    const { flags } = await this.parse(GamePlayFrontSummary);
    const options = buildDirectControlOptions(flags);
    const requestedOrigin = resolveCoordinateFlags({
      x: flags.x,
      y: flags.y,
      pair: flags.origin,
      xFlag: 'x',
      yFlag: 'y',
      pairFlag: 'origin',
    }) ?? null;
    const requestedTarget = resolveFrontTarget(flags);
    const client = createCiv7ControlOrpcServerClient({
      directControl: liveCiv7ControlOrpcDirectControlFacade,
      endpointDefaults: options,
    });
    const result = await client.strategy.frontSummary({
      playerId: flags['player-id'],
      origins: requestedOrigin ? [requestedOrigin] : undefined,
      target: requestedTarget ?? undefined,
      candidateLimit: flags['max-candidates'],
      scanRadius: flags.radius,
      corridorRadius: flags['corridor-radius'],
      destinationRadius: flags['destination-radius'],
      maxPlayers: flags['max-players'],
      maxUnits: flags['max-units'],
      maxCities: flags['max-cities'],
    });
    const view = {
      ...result,
      origin: result.origins[0] ?? null,
      summary: {
        ...result.front,
        nextInspections: frontInspectionLabels(result),
      },
      notes: [
        ...result.notes,
        'Use this to pick the next inspection, then validate concrete unit actions before mutation.',
      ],
    };

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, view }));
      return;
    }

    this.log(result.front.headline);
    this.log(`Posture: ${result.front.posture}`);
    for (const risk of result.front.risks) this.log(`Risk: ${risk}`);
    for (const item of result.front.pressure.slice(0, 8)) {
      this.log(`- [${item.severity}] ${item.kind}: ${item.summary}`);
    }
    for (const next of frontInspectionLabels(result)) this.log(`Next: ${next}`);
  }
}

function resolveFrontTarget(flags: {
  'to-x'?: number;
  'to-y'?: number;
  'target-x'?: number;
  'target-y'?: number;
  destination?: string;
}): Location | null {
  const hasTo = flags['to-x'] !== undefined || flags['to-y'] !== undefined;
  const hasTarget = flags['target-x'] !== undefined || flags['target-y'] !== undefined;
  if (hasTo && hasTarget) {
    throw new Error('--target-x/--target-y cannot be combined with --to-x/--to-y');
  }
  return resolveCoordinateFlags({
    x: hasTarget ? flags['target-x'] : flags['to-x'],
    y: hasTarget ? flags['target-y'] : flags['to-y'],
    pair: flags.destination,
    xFlag: hasTarget ? 'target-x' : 'to-x',
    yFlag: hasTarget ? 'target-y' : 'to-y',
    pairFlag: 'destination',
  }) ?? null;
}

function frontInspectionLabels(result: Civ7StrategyFrontSummaryResult): string[] {
  return result.front.nextInspections.map((step) => step.label);
}
