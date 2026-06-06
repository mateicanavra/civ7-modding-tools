import { Command, Flags } from '@oclif/core';
import {
  createCiv7ControlOrpcServerClient,
  type Civ7ProgressionTraditionsResult,
} from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import { buildDirectControlOptions } from '../../../utils/game-play-shared';

export default class GamePlayTraditions extends Command {
  static id = 'game play traditions';
  static summary = 'Read current tradition slots and available policy actions';
  static description =
    'Builds a read-only policy decision packet from the live player Culture API and GameInfo catalog.';

  static examples = [
    '<%= config.bin %> game play traditions --json',
    '<%= config.bin %> game play traditions --player-id 0',
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
    'timeout-ms': Flags.integer({
      description: 'Socket timeout',
      default: 45_000,
    }),
    compact: Flags.boolean({
      description: 'In JSON mode, emit a compact option surface instead of the full traditions packet',
      default: false,
    }),
    json: Flags.boolean({
      description: 'Emit machine-readable JSON',
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GamePlayTraditions);
    const view = await createCiv7ControlOrpcServerClient({
      directControl: liveCiv7ControlOrpcDirectControlFacade,
      endpointDefaults: buildDirectControlOptions(flags),
    }).progression.traditions.current({
      playerId: flags['player-id'],
    });

    if (flags.json) {
      this.log(JSON.stringify(flags.compact ? buildCompactTraditionsView(view) : { ok: true, view }));
      return;
    }

    this.log(`Turn ${formatProbe(view.turn)} (${formatProbe(view.turnDate)}); player ${view.playerId}`);
    this.log(`Government: ${view.government.name ?? view.government.type ?? '<unknown>'}`);
    this.log(`Slots: ${view.slots.active}/${formatProbe(view.slots.total)} active; available=${view.slots.available}; open=${view.slots.open}`);
    this.log(`Actions: activate=${view.actions.activate}; deactivate=${view.actions.deactivate}`);
    if (view.recentUnlocks.length > 0) {
      this.log('Recent unlocks:');
      for (const tradition of view.recentUnlocks) this.log(`- ${formatTradition(tradition)}`);
    }
    this.log('Active:');
    for (const tradition of view.active) this.log(`- ${formatTradition(tradition)}`);
    if (view.available.length > 0) {
      this.log('Available:');
      for (const tradition of view.available) this.log(`- ${formatTradition(tradition)}`);
    }
    for (const step of view.nextSteps) this.log(`Next: ${step.label}`);
    for (const note of view.notes) this.log(`Note: ${note}`);
  }
}

function buildCompactTraditionsView(view: Civ7ProgressionTraditionsResult): {
  ok: true;
  contractVersion: 'play-agent-v0';
  command: 'game play traditions';
  playerId: number;
  turn: unknown;
  turnDate: unknown;
  government: unknown;
  slots: unknown;
  actions: unknown;
  active: Array<Record<string, unknown>>;
  available: Array<Record<string, unknown>>;
  recentUnlocks: Array<Record<string, unknown>>;
  enabledAvailableCount: number;
  disabledAvailableCount: number;
  recommendedCli: ReadonlyArray<string>;
  nextSteps: Civ7ProgressionTraditionsResult['nextSteps'];
  omitted: Array<{ path: string; reason: string }>;
  hiddenInfoPolicy: unknown;
  notes: ReadonlyArray<string>;
} {
  const active = view.active.map((tradition) =>
    compactTraditionRow(tradition, {
      playerId: view.playerId,
      sendCloseout: false,
    }));
  const available = view.available.map((tradition) =>
    compactTraditionRow(tradition, {
      playerId: view.playerId,
      sendCloseout: true,
    }));
  const recentUnlocks = view.recentUnlocks.map((tradition) =>
    compactTraditionRow(tradition, {
      playerId: view.playerId,
      sendCloseout: true,
    }));
  return {
    ok: true,
    contractVersion: 'play-agent-v0',
    command: 'game play traditions',
    playerId: view.playerId,
    turn: view.turn,
    turnDate: view.turnDate,
    government: view.government,
    slots: view.slots,
    actions: view.actions,
    active,
    available,
    recentUnlocks,
    enabledAvailableCount: available.filter((tradition) => tradition.validationSuccess === true).length,
    disabledAvailableCount: available.filter((tradition) => tradition.validationSuccess !== true).length,
    recommendedCli: available
      .map((tradition) => tradition.validateCli)
      .filter((command): command is string => Boolean(command)),
    nextSteps: view.nextSteps,
    omitted: view.omitted,
    hiddenInfoPolicy: view.hiddenInfoPolicy,
    notes: [
      'Read-only compact tradition option surface. It does not choose or send CHANGE_TRADITION.',
      'Use validateCli before mutation when proof matters; use sendCloseoutCli only after selecting a tradition for the review blocker.',
      'If slots are full, deactivate an active tradition first, re-read, then activate the selected available tradition.',
    ],
  };
}

function compactTraditionRow(
  tradition: Civ7ProgressionTraditionsResult['traditions'][number],
  options: { playerId: number; sendCloseout: boolean },
): Record<string, unknown> {
  const action = tradition.actions[0];
  const sendCli = action
    ? traditionChangeCli(action.parameters.traditionType, action.parameters.action)
    : null;
  const validateCli = action
    ? traditionValidationCli(
        options.playerId,
        action.parameters.traditionType,
        action.parameters.action,
      )
    : null;
  return {
    id: tradition.id,
    type: tradition.type,
    name: tradition.name,
    ageType: tradition.ageType,
    cultureSlotType: tradition.cultureSlotType,
    traitType: tradition.traitType,
    isCrisis: tradition.isCrisis,
    active: tradition.active,
    unlocked: tradition.unlocked,
    recentUnlock: tradition.recentUnlock,
    actionKind: action?.kind ?? null,
    action: action?.action ?? null,
    validationSuccess: action?.validationSuccess ?? null,
    validateCli: validateCli ? `${validateCli} --json` : null,
    sendCli: sendCli ? `${sendCli} --send` : null,
    sendCloseoutCli: options.sendCloseout && sendCli
      ? `${sendCli} --send --closeout`
      : null,
  };
}

function formatTradition(tradition: {
  id: number;
  type: string | null;
  name: string | null;
  description: string | null;
  actions: ReadonlyArray<{ kind: string; action: number | null; validationSuccess: boolean | null }>;
}): string {
  const action = tradition.actions[0];
  const validation = action ? String(action.validationSuccess) : 'no action';
  return `${tradition.name ?? tradition.type ?? tradition.id} (${tradition.id}) ${action?.kind ?? ''}=${action?.action ?? '<none>'}; validation=${validation}${tradition.description ? `; ${tradition.description}` : ''}`;
}

function formatProbe<T>(probe: { ok: true; value: T } | { ok: false; error: string }): string {
  if (!probe.ok) return `<error: ${probe.error}>`;
  return String(probe.value);
}

function traditionChangeCli(
  traditionType: number,
  action: number | null,
): string | null {
  if (action == null) return null;
  return `game play change-tradition --tradition-type ${traditionType} --action ${action}`;
}

function traditionValidationCli(
  playerId: number,
  traditionType: number,
  action: number | null,
): string | null {
  if (action == null) return null;
  return `game play change-tradition --player-id ${playerId} --tradition-type ${traditionType} --action ${action}`;
}
