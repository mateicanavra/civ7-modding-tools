import { Command, Flags } from '@oclif/core';
import { getCiv7PlayableStatus } from '@civ7/direct-control';

export default class GameStatus extends Command {
  static id = 'game status';
  static summary = 'Report Civ7 App UI and Tuner readiness';
  static description =
    'Composes App UI lifecycle status and Tuner gameplay readiness through @civ7/direct-control.';

  static examples = [
    '<%= config.bin %> game status --json',
    '<%= config.bin %> game status --host 127.0.0.1 --port 4318',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    'timeout-ms': Flags.integer({
      description: 'Socket timeout',
      default: 10_000,
    }),
    json: Flags.boolean({
      description: 'Emit machine-readable JSON',
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GameStatus);
    const status = await getCiv7PlayableStatus({
      host: flags.host,
      port: flags.port,
      timeoutMs: flags['timeout-ms'],
    });

    if (flags.json) {
      this.log(JSON.stringify({ ok: status.playable, status }));
      return;
    }

    this.log(`Civ7 readiness: ${status.readiness}`);
    this.log(`Direct tuner socket: ${status.host}:${status.port}`);
    this.log(`Tuner gameplay APIs: ${status.tuner?.ready ? 'ready' : 'not ready'}`);
    this.log(`App UI loading state: ${status.appUi.snapshot.ui.loadingStateName ?? '<unknown>'}`);
  }
}
