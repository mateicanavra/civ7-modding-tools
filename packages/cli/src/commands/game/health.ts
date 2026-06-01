import { Command, Flags } from '@oclif/core';
import { checkCiv7DirectControlHealth, checkCiv7TunerHealth } from '@civ7/direct-control';

export default class GameHealth extends Command {
  static id = 'game health';
  static summary = 'Check direct Civ7 tuner-socket readiness';
  static description =
    'Queries the Civ7 tuner socket and reports available scripting states through @civ7/direct-control.';

  static examples = [
    '<%= config.bin %> game health',
    '<%= config.bin %> game health --state "App UI" --json',
    '<%= config.bin %> game health --tuner --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    state: Flags.string({
      description: 'Civ7 tuner scripting state name or id to require',
    }),
    tuner: Flags.boolean({
      description: 'Run a Tuner gameplay API canary instead of only checking LSQ state discovery',
      default: false,
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
    const { flags } = await this.parse(GameHealth);
    if (flags.tuner) {
      const health = await checkCiv7TunerHealth({
        host: flags.host,
        port: flags.port,
        timeoutMs: flags['timeout-ms'],
      });

      if (flags.json) {
        this.log(JSON.stringify({ ok: health.ready, health }));
        return;
      }

      if (!health.ready) {
        this.error('Civ7 Tuner state is reachable but gameplay APIs are not ready', { exit: 1 });
      }

      this.log(`Civ7 Tuner ready: ${health.host}:${health.port}`);
      this.log(`State: ${health.state.name} (${health.state.id})`);
      this.log(`Turn: ${health.snapshot.turn.ok ? health.snapshot.turn.value : '<unknown>'}`);
      this.log(`Map: ${health.snapshot.width.ok ? health.snapshot.width.value : '?'}x${health.snapshot.height.ok ? health.snapshot.height.value : '?'}`);
      return;
    }

    const health = await checkCiv7DirectControlHealth({
      host: flags.host,
      port: flags.port,
      state: flags.state ? { id: flags.state, name: flags.state } : undefined,
      timeoutMs: flags['timeout-ms'],
    });

    if (flags.json) {
      this.log(JSON.stringify({ ok: health.ok, health }));
      return;
    }

    if (!health.ok) {
      this.error(`Civ7 direct control unavailable: ${health.error.message}`, { exit: 1 });
    }

    this.log(`Civ7 direct control ready: ${health.host}:${health.port}`);
    this.log(`States: ${health.states.map((state) => `${state.name} (${state.id})`).join(', ') || '<none>'}`);
    if (health.selectedState) {
      this.log(`Selected state: ${health.selectedState.name} (${health.selectedState.id})`);
    }
  }
}
