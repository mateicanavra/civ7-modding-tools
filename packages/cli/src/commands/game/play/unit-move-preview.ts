import { Command, Flags } from '@oclif/core';
import { getCiv7UnitMovePreview } from '@civ7/direct-control';
import {
  buildDirectControlOptions,
  parseComponentId,
  resolveCoordinateFlags,
} from '../../../utils/game-play-shared';

type Probe<T = unknown> = { ok: true; value: T } | { ok: false; error: string };
type UnitMovePreviewView = Awaited<ReturnType<typeof getCiv7UnitMovePreview>>;

export default class GamePlayUnitMovePreview extends Command {
  static id = 'game play unit-move-preview';
  static summary = 'Read official unit movement, target, path, and queued-destination preview';
  static description =
    'Returns a read-only movement preview using the same Units movement/path APIs the Civ7 UI uses for reachable movement, targets, queued destinations, and hover paths.';

  static examples = [
    '<%= config.bin %> game play unit-move-preview --json',
    '<%= config.bin %> game play unit-move-preview --compact --json',
    '<%= config.bin %> game play unit-move-preview --unit-id \'{"owner":0,"id":65536,"type":26}\' --json',
    '<%= config.bin %> game play unit-move-preview --unit-id \'{"owner":0,"id":65536,"type":26}\' --destination 25,35 --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    'unit-id': Flags.string({
      description: 'Explicit unit ComponentID JSON. Defaults to selected unit, then first ready unit.',
    }),
    x: Flags.integer({
      description: 'Optional preview destination x coordinate',
      dependsOn: ['y'],
    }),
    y: Flags.integer({
      description: 'Optional preview destination y coordinate',
      dependsOn: ['x'],
    }),
    destination: Flags.string({
      description: 'Optional preview destination as x,y',
    }),
    'max-plots': Flags.integer({
      description: 'Maximum reachable movement/target plot entries to normalize',
      default: 80,
    }),
    'max-path-plots': Flags.integer({
      description: 'Maximum queued/requested path plot entries to normalize',
      default: 32,
    }),
    'timeout-ms': Flags.integer({
      description: 'Socket timeout',
      default: 45_000,
    }),
    compact: Flags.boolean({
      description: 'In JSON mode, emit a summary-first movement preview envelope instead of the full official preview payload',
      default: false,
    }),
    json: Flags.boolean({
      description: 'Emit machine-readable JSON',
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GamePlayUnitMovePreview);
    const destination = resolveCoordinateFlags({
      x: flags.x,
      y: flags.y,
      pair: flags.destination,
      xFlag: 'x',
      yFlag: 'y',
      pairFlag: 'destination',
    });
    const view = await getCiv7UnitMovePreview({
      unitId: flags['unit-id'] ? parseComponentId(flags['unit-id'], 'unit-id') : undefined,
      destination,
      maxPlots: flags['max-plots'],
      maxPathPlots: flags['max-path-plots'],
    }, buildDirectControlOptions(flags));

    if (flags.json) {
      this.log(JSON.stringify(flags.compact ? buildCompactView(view) : { ok: true, view }));
      return;
    }

    this.log(JSON.stringify(view, null, 2));
  }
}

function buildCompactView(view: UnitMovePreviewView): {
  ok: true;
  contractVersion: 'play-agent-v0';
  surface: 'unit-move-preview';
  summary: string;
  unitId: UnitMovePreviewView['unitId'];
  unit: Record<string, unknown> | null;
  requestedDestination: UnitMovePreviewView['requestedDestination'];
  queuedDestination: unknown;
  reach: {
    movementPlotCount: number;
    zoneOfControlPlotCount: number;
    targetPlotCount: number;
  };
  candidates: {
    reachableMovement: Array<Record<string, unknown>>;
    reachableTargets: Array<Record<string, unknown>>;
    reachableZonesOfControl: Array<Record<string, unknown>>;
    limit: number;
  };
  paths: {
    requested: Record<string, unknown> | null;
    queued: Record<string, unknown> | null;
  };
  nextAction: UnitMoveActionDescriptor | null;
  warnings: string[];
  omitted: Array<{ path: string; reason: string }>;
  hiddenInfoPolicy: string;
  relationshipProof: string;
} {
  const unit = compactUnit(probeValue(view.unit));
  const queuedDestination = probeValue(view.queuedDestination);
  const requestedPath = compactPath(probeValue(view.requestedPath));
  const queuedPath = compactPath(probeValue(view.queuedPath));
  const requestedDestination = view.requestedDestination;
  const candidateLimit = 12;
  const movementCandidates = compactPlotCandidates(probeValue(view.reachableMovement), view.unitId, unit, candidateLimit);
  const targetCandidates = compactPlotCandidates(probeValue(view.reachableTargets), view.unitId, unit, candidateLimit);
  const zoneOfControlCandidates = compactPlotCandidates(probeValue(view.reachableZonesOfControl), view.unitId, unit, candidateLimit);
  const warnings = [
    view.relationshipPolicy.guidance,
    queuedDestination
      ? 'Queued destinations are intent, not safety. Re-read movement preview and tactical context each turn.'
      : null,
    requestedDestination
      ? 'Requested path preview does not reserve the path or authorize a send; validate and postcondition-check the mutation.'
      : null,
  ].filter((warning): warning is string => Boolean(warning));

  return {
    ok: true,
    contractVersion: 'play-agent-v0',
    surface: 'unit-move-preview',
    summary: unit
      ? `${String(unit.typeName ?? 'unit')} at ${formatLocation(unit.location)}`
      : 'no selected or ready unit for movement preview',
    unitId: view.unitId,
    unit,
    requestedDestination,
    queuedDestination,
    reach: {
      movementPlotCount: countPlots(probeValue(view.reachableMovement)),
      zoneOfControlPlotCount: countPlots(probeValue(view.reachableZonesOfControl)),
      targetPlotCount: countPlots(probeValue(view.reachableTargets)),
    },
    candidates: {
      reachableMovement: movementCandidates,
      reachableTargets: targetCandidates,
      reachableZonesOfControl: zoneOfControlCandidates,
      limit: candidateLimit,
    },
    paths: {
      requested: requestedPath,
      queued: queuedPath,
    },
    nextAction: movementValidationDescriptor(view.unitId, requestedDestination),
    warnings,
    omitted: [
      { path: 'view.reachableMovement', reason: `compact includes up to ${candidateLimit} reachable movement candidate rows` },
      { path: 'view.reachableZonesOfControl', reason: `compact includes up to ${candidateLimit} zone-of-control candidate rows` },
      { path: 'view.reachableTargets', reason: `compact includes up to ${candidateLimit} reachable target candidate rows` },
      { path: 'view.requestedPath.plots', reason: 'compact output summarizes requested path evidence without plot samples' },
      { path: 'view.queuedPath.plots', reason: 'compact output summarizes queued path evidence without plot samples' },
    ],
    hiddenInfoPolicy: 'runtime-preview; visibility and route safety are not proven by compact movement output',
    relationshipProof: view.relationshipPolicy.relationshipProof,
  };
}

function compactUnit(unit: unknown): Record<string, unknown> | null {
  if (!unit || typeof unit !== 'object') return null;
  const value = unit as Record<string, unknown>;
  return {
    id: value.id,
    owner: value.owner,
    typeName: value.typeName,
    location: value.location,
    movementMovesRemaining: value.movementMovesRemaining,
    movementTurnsRemaining: value.movementTurnsRemaining,
    attacksRemaining: value.attacksRemaining,
    damage: value.damage,
    activity: value.activity,
  };
}

function compactPath(path: unknown): Record<string, unknown> | null {
  if (!path || typeof path !== 'object') return null;
  const value = path as Record<string, unknown>;
  return {
    plotCount: value.plotCount ?? countPlots(value.plots),
    turns: value.turns ?? null,
    obstacles: value.obstacles ?? null,
  };
}

function probeValue<T>(probe: Probe<T> | null | undefined): T | null {
  return probe?.ok ? probe.value : null;
}

function countPlots(value: unknown): number {
  if (!Array.isArray(value)) return 0;
  return value.reduce((count, item) => {
    if (Array.isArray(item)) return count + countPlots(item);
    return count + 1;
  }, 0);
}

function compactPlotCandidates(value: unknown, unitId: UnitMovePreviewView['unitId'], unit: Record<string, unknown> | null, limit: number): Array<Record<string, unknown>> {
  const unitLocation = locationRecord(unit?.location);
  return flattenPlots(value)
    .sort((left, right) => {
      const leftCurrent = sameLocation(left, unitLocation);
      const rightCurrent = sameLocation(right, unitLocation);
      if (leftCurrent !== rightCurrent) return leftCurrent ? 1 : -1;
      const leftDistance = hexApproxDistance(left, unitLocation) ?? 999;
      const rightDistance = hexApproxDistance(right, unitLocation) ?? 999;
      if (leftDistance !== rightDistance) return leftDistance - rightDistance;
      if ((left.y ?? 0) !== (right.y ?? 0)) return (left.y ?? 0) - (right.y ?? 0);
      return (left.x ?? 0) - (right.x ?? 0);
    })
    .slice(0, limit)
    .map((plot) => ({
      index: plot.index ?? null,
      x: plot.x,
      y: plot.y,
      currentLocation: sameLocation(plot, unitLocation),
      distanceFromUnit: hexApproxDistance(plot, unitLocation),
      nextAction: movementValidationDescriptor(
        unitId,
        typeof plot.x === 'number' && typeof plot.y === 'number'
          ? { x: plot.x, y: plot.y }
          : null,
      ),
    }));
}

type UnitMoveActionDescriptor = {
  kind: 'validate-unit-action';
  label: string;
  unitId: UnitMovePreviewView['unitId'];
  destination: { x: number; y: number };
  sendReady: false;
};

function movementValidationDescriptor(
  unitId: UnitMovePreviewView['unitId'],
  destination: { x: number; y: number } | null,
): UnitMoveActionDescriptor | null {
  if (!unitId || !destination) return null;
  return {
    kind: 'validate-unit-action',
    label: `validate unit action at (${destination.x},${destination.y}) before sending`,
    unitId,
    destination,
    sendReady: false,
  };
}

function flattenPlots(value: unknown): Array<{ index?: number; x?: number; y?: number }> {
  if (!Array.isArray(value)) return [];
  const plots: Array<{ index?: number; x?: number; y?: number }> = [];
  for (const item of value) {
    if (Array.isArray(item)) {
      plots.push(...flattenPlots(item));
      continue;
    }
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const x = Number(record.x);
    const y = Number(record.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    const index = Number(record.index);
    plots.push({
      x,
      y,
      ...(Number.isFinite(index) ? { index } : {}),
    });
  }
  return plots;
}

function locationRecord(value: unknown): { x?: number; y?: number } | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const x = Number(record.x);
  const y = Number(record.y);
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
}

function sameLocation(left: { x?: number; y?: number } | null, right: { x?: number; y?: number } | null): boolean {
  return Boolean(left && right && left.x === right.x && left.y === right.y);
}

function hexApproxDistance(left: { x?: number; y?: number } | null, right: { x?: number; y?: number } | null): number | null {
  if (!left || !right || typeof left.x !== 'number' || typeof left.y !== 'number' || typeof right.x !== 'number' || typeof right.y !== 'number') {
    return null;
  }
  return Math.max(Math.abs(left.x - right.x), Math.abs(left.y - right.y));
}

function formatLocation(location: unknown): string {
  if (!location || typeof location !== 'object') return '<unknown>';
  const value = location as { x?: unknown; y?: unknown };
  return typeof value.x === 'number' && typeof value.y === 'number'
    ? `(${value.x},${value.y})`
    : '<unknown>';
}
