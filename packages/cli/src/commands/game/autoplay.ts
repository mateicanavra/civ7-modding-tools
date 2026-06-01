import { Command, Flags } from '@oclif/core';
import {
  configureCiv7Autoplay,
  getCiv7AutoplayStatus,
  startCiv7Autoplay,
  stopCiv7Autoplay,
} from '@civ7/direct-control';

export default class GameAutoplay extends Command {
  static id = 'game autoplay';
  static summary = 'Inspect or control Civ7 autoplay';
  static description =
    'Reads and changes native Civ7 Autoplay state through @civ7/direct-control with explicit approval for mutations.';

  static examples = [
    '<%= config.bin %> game autoplay --json',
    '<%= config.bin %> game autoplay --action start --reason "unbounded smoke test" --json',
    '<%= config.bin %> game autoplay --action start --turns 1 --reason "bounded smoke test" --json',
    '<%= config.bin %> game autoplay --action stop --reason "stop smoke test"',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    action: Flags.string({
      description: 'Action to run',
      options: ['status', 'configure', 'start', 'stop'],
      default: 'status',
    }),
    turns: Flags.integer({
      description: 'Optional autoplay turn count; omit for native unbounded autoplay',
    }),
    'observe-as-player': Flags.integer({
      description: 'Player id to observe as',
    }),
    'return-as-player': Flags.integer({
      description: 'Player id to return as',
    }),
    pause: Flags.boolean({
      description: 'Set autoplay pause state during configure/start',
      allowNo: true,
    }),
    reason: Flags.string({
      description: 'Approval reason for start/stop',
    }),
    'timeout-ms': Flags.integer({
      description: 'Socket timeout',
      default: 45_000,
    }),
    'wait-timeout-ms': Flags.integer({
      description: 'Autoplay state transition wait timeout',
    }),
    'poll-interval-ms': Flags.integer({
      description: 'Autoplay state polling interval',
    }),
    'stability-window-ms': Flags.integer({
      description: 'Turn-stability window for stop verification',
    }),
    json: Flags.boolean({
      description: 'Emit machine-readable JSON',
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GameAutoplay);
    const options = {
      host: flags.host,
      port: flags.port,
      timeoutMs: flags['timeout-ms'],
      turns: flags.turns,
      observeAsPlayer: flags['observe-as-player'],
      returnAsPlayer: flags['return-as-player'],
      pause: flags.pause,
      waitTimeoutMs: flags['wait-timeout-ms'],
      pollIntervalMs: flags['poll-interval-ms'],
      stabilityWindowMs: flags['stability-window-ms'],
    };
    const approval = {
      approved: true as const,
      reason: flags.reason ?? `CLI autoplay ${flags.action}`,
      disposableSession: true,
    };
    const result =
      flags.action === 'configure'
        ? await configureCiv7Autoplay(options, approval)
        : flags.action === 'start'
          ? await startCiv7Autoplay(options, approval)
          : flags.action === 'stop'
            ? await stopCiv7Autoplay(options, approval)
            : await getCiv7AutoplayStatus(options);

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, result }));
      return;
    }

    this.log(JSON.stringify(result, null, 2));
  }
}
