import { createCiv7ControlOrpcServerClient } from "@civ7/control-orpc";
import { liveCiv7ControlOrpcDirectControlFacade } from "@civ7/control-orpc/runtime";
import type { Civ7DirectControlOptions } from "@civ7/direct-control";
import { Command, Flags } from "@oclif/core";

export default class GameStatus extends Command {
  static id = "game status";
  static summary = "Report Civ7 App UI and Tuner readiness";
  static description =
    "Reports service-owned Civ7 readiness through the in-process control-oRPC router.";

  static examples = [
    "<%= config.bin %> game status --json",
    "<%= config.bin %> game status --host 127.0.0.1 --port 4318",
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    "timeout-ms": Flags.integer({
      description: "Socket timeout",
      default: 10_000,
    }),
    json: Flags.boolean({
      description: "Emit machine-readable JSON",
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GameStatus);
    const endpointDefaults: Civ7DirectControlOptions = {
      host: flags.host,
      port: flags.port,
      timeoutMs: flags["timeout-ms"],
    };
    const client = createCiv7ControlOrpcServerClient({
      directControl: liveCiv7ControlOrpcDirectControlFacade,
      endpointDefaults,
    });
    const status = await client.readiness.current({});

    if (flags.json) {
      this.log(JSON.stringify({ ok: status.playable, status }));
      return;
    }

    this.log(`Civ7 readiness: ${status.readiness}`);
    this.log(`Observe: ${status.capability.canObserve ? "ready" : "not ready"}`);
    this.log(`Mutate: ${status.capability.canMutate ? "ready" : "not ready"}`);
    this.log(`Next: ${status.nextSteps[0]?.label ?? "No next step available."}`);
  }
}
