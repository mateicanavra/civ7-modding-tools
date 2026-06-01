import { Command, Flags } from '@oclif/core';
import { getCiv7ReadyUnitView } from '@civ7/direct-control';
import {
  buildDirectControlOptions,
  parseComponentId,
} from '../../../utils/game-play-shared';

export default class GamePlayReadyUnit extends Command {
  static id = 'game play ready-unit';
  static summary = 'Read the selected or first ready unit with legal operations';
  static description =
    'Returns a read-only live-play view of the selected or first ready unit, valid no-target operations, and nearby occupied plots.';

  static examples = [
    '<%= config.bin %> game play ready-unit --json',
    '<%= config.bin %> game play ready-unit --unit-id \'{"owner":0,"id":458752,"type":26}\' --radius 2 --json',
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
    radius: Flags.integer({
      description: 'Nearby occupied-plot radius around the unit',
      default: 2,
    }),
    'max-operations': Flags.integer({
      description: 'Maximum operation enum keys to probe per family',
      default: 96,
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
    const { flags } = await this.parse(GamePlayReadyUnit);
    const view = await getCiv7ReadyUnitView({
      unitId: flags['unit-id'] ? parseComponentId(flags['unit-id'], 'unit-id') : undefined,
      radius: flags.radius,
      maxOperations: flags['max-operations'],
    }, buildDirectControlOptions(flags));

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, view }));
      return;
    }

    this.log(`Unit: ${formatValue(view.unitId)}`);
    this.log(`Selected: ${formatProbe(view.selectedUnitId)}; first ready: ${formatProbe(view.firstReadyUnitId)}`);
    this.log(`Summary: ${formatProbe(view.unit)}`);
    this.log('Legal operations:');
    for (const candidate of view.legalOperations) {
      this.log(`- ${candidate.family} ${candidate.operationType}`);
    }
    this.log(`Promotion readiness: ${formatProbe(view.promotionReadiness)}`);
    this.log(`Nearby occupied plots: ${formatProbe(view.nearby)}`);
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
