import { executeCiv7Command, resolveCiv7DirectControlConfig } from "@civ7/direct-control";
import { Args, Command, Flags } from "@oclif/core";

export default class GameExec extends Command {
  static id = "game exec";
  static summary = "Run JavaScript against a running Civ7 tuner socket";
  static description =
    "Sends a JavaScript expression or statement to the selected Civ7 tuner scripting state through @civ7/direct-control.";

  static examples = [
    '<%= config.bin %> game exec "1+1"',
    '<%= config.bin %> game exec "JSON.stringify(Object.keys(Network))" --state "App UI" --json',
  ];

  static args = {
    command: Args.string({
      description: "JavaScript command to run in the selected Civ7 tuner state",
      required: true,
    }),
  } as const;

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    state: Flags.string({
      description: "Civ7 tuner scripting state name or id",
    }),
    "timeout-ms": Flags.integer({
      description: "Socket timeout",
      default: 45_000,
    }),
    json: Flags.boolean({
      description: "Emit machine-readable JSON",
      default: false,
    }),
    "dry-run": Flags.boolean({
      description: "Validate direct-control config and print the request without sending it",
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(GameExec);
    const config = resolveCiv7DirectControlConfig({
      host: flags.host,
      port: flags.port,
      timeoutMs: flags["timeout-ms"],
    });
    const request = {
      command: args.command,
      hosts: config.hosts,
      port: config.port,
      state: flags.state ?? "App UI",
    };

    if (flags["dry-run"]) {
      if (flags.json) {
        this.log(JSON.stringify({ ok: true, request, dryRun: true }));
      } else {
        this.log(
          `DIRECT HOSTS=${request.hosts.join(",")} PORT=${request.port} STATE=${request.state} RUN ${request.command}`
        );
      }
      return;
    }

    const response = await executeCiv7Command({
      host: flags.host,
      port: flags.port,
      state: flags.state ? { id: flags.state, name: flags.state } : { role: "app-ui" },
      timeoutMs: flags["timeout-ms"],
      command: args.command,
    });

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, request, response }));
      return;
    }

    for (const line of response.output) {
      this.log(line);
    }
  }
}
