import { Command, Flags } from '@oclif/core';
import { getCiv7ReadyCityView } from '@civ7/direct-control';
import {
  buildDirectControlOptions,
  parseComponentId,
} from '../../../utils/game-play-shared';

type Probe<T = unknown> = { ok: true; value: T } | { ok: false; error: string };
type ReadyCityView = Awaited<ReturnType<typeof getCiv7ReadyCityView>>;
type ReadyCityActionDescriptor = {
  kind: string;
  label: string;
  parameters: Record<string, unknown>;
  readOnly: false;
  sendsMutation: true;
};

export default class GamePlayReadyCity extends Command {
  static id = 'game play ready-city';
  static summary = 'Read the selected or blocking city with legal closeout operations';
  static description =
    'Returns a read-only live-play view of the selected, requested, or blocker-target city, plus valid no-argument city operations and commands.';

  static examples = [
    '<%= config.bin %> game play ready-city --json',
    '<%= config.bin %> game play ready-city --compact --json',
    '<%= config.bin %> game play ready-city --city-id \'{"owner":0,"id":131073,"type":1}\' --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    'city-id': Flags.string({
      description: 'Explicit city ComponentID JSON. Defaults to selected city, then blocker-target city.',
    }),
    'max-operations': Flags.integer({
      description: 'Maximum operation enum keys to probe per city family',
      default: 96,
    }),
    'timeout-ms': Flags.integer({
      description: 'Socket timeout',
      default: 45_000,
    }),
    compact: Flags.boolean({
      description: 'In JSON mode, emit a summary-first city decision envelope instead of the full ready-city payload',
      default: false,
    }),
    json: Flags.boolean({
      description: 'Emit machine-readable JSON',
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GamePlayReadyCity);
    const view = await getCiv7ReadyCityView({
      cityId: flags['city-id'] ? parseComponentId(flags['city-id'], 'city-id') : undefined,
      maxOperations: flags['max-operations'],
    }, buildDirectControlOptions(flags));

    if (flags.json) {
      this.log(JSON.stringify(flags.compact ? buildCompactView(view) : { ok: true, view }));
      return;
    }

    this.log(`City: ${formatValue(view.cityId)}`);
    this.log(`Selected: ${formatProbe(view.selectedCityId)}; blocker-target: ${formatProbe(view.blockingCityId)}`);
    this.log(`Summary: ${formatProbe(view.city)}`);
    this.log('Legal no-argument city operations:');
    for (const candidate of view.legalOperations) {
      this.log(`- ${candidate.family} ${candidate.operationType}`);
    }
    for (const note of view.notes) this.log(`Note: ${note}`);
  }
}

function buildCompactView(view: ReadyCityView): {
  ok: true;
  contractVersion: 'play-agent-v0';
  surface: 'ready-city';
  summary: string;
  cityId: ReadyCityView['cityId'];
  city: Record<string, unknown> | null;
  legalOperationCount: number;
  productionCandidateCount: number;
  productionCandidates: Array<Record<string, unknown>>;
  townFocusOptionCount: number;
  populationPlacement: {
    isReadyToPlacePopulation: unknown;
    cityWorkerCap: unknown;
    yieldTypeOrder: unknown;
    workablePlots: Array<Record<string, unknown>>;
    expansionCandidates: Array<Record<string, unknown>>;
  } | null;
  nextAction: ReadyCityActionDescriptor | null;
  warnings: string[];
  omitted: Array<{ path: string; reason: string }>;
} {
  const city = compactCity(probeValue(view.city));
  const populationPlacement = probeValue(view.populationPlacement);
  const workablePlots = compactWorkerPlots(probeArray(populationPlacement?.workablePlots));
  const expansionCandidates = compactExpansionCandidates(probeArray(populationPlacement?.expansionCandidates));
  const productionCandidates = compactProductionCandidates(probeArray(view.productionCandidates));
  const nextAction = actionField(workablePlots[0])
    ?? actionField(expansionCandidates[0])
    ?? actionField(productionCandidates[0]);

  return {
    ok: true,
    contractVersion: 'play-agent-v0',
    surface: 'ready-city',
    summary: city?.name
      ? `${String(city.name)}: ${workablePlots.length} assign-worker plots, ${expansionCandidates.length} expansion candidates`
      : 'no selected, requested, or blocker-target city',
    cityId: view.cityId,
    city,
    legalOperationCount: view.legalOperations.length,
    productionCandidateCount: probeArray(view.productionCandidates).length,
    productionCandidates,
    townFocusOptionCount: probeArray(view.townFocusOptions).length,
    populationPlacement: populationPlacement
        ? {
          isReadyToPlacePopulation: populationPlacement.isReadyToPlacePopulation,
          cityWorkerCap: populationPlacement.cityWorkerCap,
          yieldTypeOrder: populationPlacement.yieldTypeOrder,
          workablePlots,
          expansionCandidates,
        }
      : null,
    nextAction,
    warnings: [
      'Read-only city dashboard; validate and postcondition-check assign-worker, expand-city, production, or town-focus sends separately.',
      'Expansion candidate plot yields are map yield facts plus constructible context, not a post-send yield guarantee.',
    ],
    omitted: [
      { path: 'view.productionCandidates[].result', reason: 'compact rows expose valid/action/template fields; use --json without --compact for raw BUILD validation payloads' },
      { path: 'view.townFocusOptions', reason: 'use --json without --compact for all town focus options' },
      { path: 'view.populationPlacement.allPlacementInfo', reason: 'use --json without --compact for raw placement info' },
      { path: 'view.legalOperations[].result', reason: 'use --json without --compact for raw validation payloads' },
    ],
  };
}

function compactCity(city: unknown): Record<string, unknown> | null {
  if (!city || typeof city !== 'object') return null;
  const value = city as Record<string, unknown>;
  return {
    id: value.id,
    name: value.name,
    location: value.location,
    population: value.population,
    isTown: value.isTown,
    growth: value.growth,
    yields: value.yields,
    buildQueue: value.buildQueue,
  };
}

function compactProductionCandidates(values: ReadonlyArray<Record<string, unknown>>): Array<Record<string, unknown>> {
  return values.map((candidate) => ({
    kind: candidate.kind,
    type: candidate.type,
    typeName: candidate.typeName,
    name: candidate.name,
    args: candidate.args,
    cost: candidate.cost,
    turns: candidate.turns,
    productionBasis: candidate.productionBasis,
    baseYieldSummary: candidate.baseYieldSummary,
    valid: candidate.valid,
    placementPlots: candidate.placementPlots,
    nextAction: productionAction(candidate),
  }));
}

function compactWorkerPlots(values: ReadonlyArray<Record<string, unknown>>): Array<Record<string, unknown>> {
  return values.map((plot) => ({
    index: plot.index,
    x: plot.x,
    y: plot.y,
    currentYieldSummary: plot.currentYieldSummary,
    nextYieldSummary: plot.nextYieldSummary,
    yieldDelta: plot.yieldDelta,
    maintenance: plot.maintenance,
    nextAction: workerAction(plot),
  }));
}

function compactExpansionCandidates(values: ReadonlyArray<Record<string, unknown>>): Array<Record<string, unknown>> {
  return values.map((candidate) => {
    const facts = candidate.plotFacts && typeof candidate.plotFacts === 'object'
      ? candidate.plotFacts as Record<string, unknown>
      : null;
    return {
      index: candidate.index,
      x: candidate.x,
      y: candidate.y,
      constructibleTypeName: candidate.constructibleTypeName,
      constructibleName: candidate.constructibleName,
      constructibleClass: candidate.constructibleClass,
      terrainName: facts?.terrainName,
      featureName: facts?.featureName,
      resourceName: facts?.resourceName,
      yieldSource: facts?.yieldSource,
      yieldSummary: facts?.yieldSummary,
      nextAction: expansionAction(candidate),
    };
  });
}

function productionAction(candidate: Record<string, unknown>): ReadyCityActionDescriptor {
  return {
    kind: 'choose-production',
    label: 'Choose this production candidate after reviewing placement and validation evidence.',
    parameters: {
      candidateKind: candidate.kind,
      type: candidate.type,
      typeName: candidate.typeName,
      placementPlots: candidate.placementPlots,
    },
    readOnly: false,
    sendsMutation: true,
  };
}

function workerAction(plot: Record<string, unknown>): ReadyCityActionDescriptor {
  return {
    kind: 'assign-worker',
    label: 'Assign one worker to this plot after reviewing the yield delta.',
    parameters: {
      location: plot.index,
      x: plot.x,
      y: plot.y,
    },
    readOnly: false,
    sendsMutation: true,
  };
}

function expansionAction(candidate: Record<string, unknown>): ReadyCityActionDescriptor {
  return {
    kind: 'expand-city',
    label: 'Expand the city to this plot after reviewing map yield evidence.',
    parameters: {
      index: candidate.index,
      x: candidate.x,
      y: candidate.y,
      constructibleType: candidate.constructibleType,
      constructibleName: candidate.constructibleName,
    },
    readOnly: false,
    sendsMutation: true,
  };
}

function probeValue<T>(probe: Probe<T> | null | undefined): T | null {
  return probe?.ok ? probe.value : null;
}

function probeArray(probe: Probe<unknown> | null | undefined): Array<Record<string, unknown>> {
  const value = probeValue(probe);
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object') : [];
}

function actionField(value: Record<string, unknown> | undefined): ReadyCityActionDescriptor | null {
  const action = value?.nextAction;
  return action && typeof action === 'object' ? action as ReadyCityActionDescriptor : null;
}

function formatProbe<T>(probe: { ok: true; value: T } | { ok: false; error: string }): string {
  if (!probe.ok) return `<error: ${probe.error}>`;
  return formatValue(probe.value);
}

function formatValue(value: unknown): string {
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}
