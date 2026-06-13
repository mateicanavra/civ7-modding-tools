import { Command, Flags } from "@oclif/core";
import { getCiv7AppUiSnapshot, inspectCiv7RuntimeApi } from "@civ7/direct-control";

export default class GameInspect extends Command {
  static id = "game inspect";
  static summary = "Inspect available APIs in a Civ7 tuner scripting state";
  static description =
    "Enumerates selected global roots in App UI or Tuner through @civ7/direct-control.";

  static examples = [
    '<%= config.bin %> game inspect --state "App UI" --roots Network,Autoplay --json',
    '<%= config.bin %> game inspect --state "App UI" --roots GameplayMap,Players',
    "<%= config.bin %> game inspect --app-ui-snapshot --json",
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    state: Flags.string({
      description: "Civ7 tuner scripting state name or id",
      default: "App UI",
    }),
    roots: Flags.string({
      description: "Comma-separated global root names to inspect",
    }),
    "app-ui-snapshot": Flags.boolean({
      description: "Return the package-maintained read-only App UI runtime snapshot",
      default: false,
    }),
    "timeout-ms": Flags.integer({
      description: "Socket timeout",
      default: 45_000,
    }),
    json: Flags.boolean({
      description: "Emit machine-readable JSON",
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GameInspect);
    if (flags["app-ui-snapshot"]) {
      const snapshot = await getCiv7AppUiSnapshot({
        host: flags.host,
        port: flags.port,
        timeoutMs: flags["timeout-ms"],
      });
      if (flags.json) {
        this.log(JSON.stringify({ ok: true, snapshot }));
        return;
      }
      this.log(`Civ7 App UI snapshot at ${snapshot.host}:${snapshot.port}`);
      this.log(`Network in session: ${formatProbe(snapshot.snapshot.network.isInSession)}`);
      this.log(`Autoplay active: ${snapshot.snapshot.autoplay.isActive}`);
      this.log(`Turn date: ${formatProbe(snapshot.snapshot.game.turnDate)}`);
      this.log(
        `Map: ${formatProbe(snapshot.snapshot.map.width)} x ${formatProbe(snapshot.snapshot.map.height)}`
      );
      return;
    }

    const inspection = await inspectCiv7RuntimeApi({
      host: flags.host,
      port: flags.port,
      state: flags.state,
      roots: flags.roots
        ?.split(",")
        .map((root) => root.trim())
        .filter(Boolean),
      timeoutMs: flags["timeout-ms"],
    });

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, inspection }));
      return;
    }

    this.log(`Civ7 ${inspection.state.name} API roots at ${inspection.host}:${inspection.port}`);
    for (const root of inspection.roots) {
      this.log(`\n${root.name}: ${root.exists ? root.type : "<missing>"}`);
      if (root.ownKeys.length > 0) this.log(`  own: ${root.ownKeys.join(", ")}`);
      if (root.prototypeKeys.length > 0) this.log(`  prototype: ${root.prototypeKeys.join(", ")}`);
      const methods = root.methods ?? [];
      if (methods.length > 0) {
        this.log(
          `  methods: ${methods.map((method) => `${method.name}/${method.length}`).join(", ")}`
        );
      }
      if (root.error) this.log(`  error: ${root.error}`);
    }
  }
}

function formatProbe<T>(probe: { ok: true; value: T } | { ok: false; error: string }): string {
  return probe.ok ? String(probe.value) : `<error: ${probe.error}>`;
}
