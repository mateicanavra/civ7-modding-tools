import { Command, Flags } from "@oclif/core";
import { createCiv7GameControlClient } from "../../../adapters/control/service-client";
import { buildDirectControlOptions, emitPlayResult } from "../../../adapters/play/direct-control";

export default class GamePlayAssignWorker extends Command {
  static summary = "Validate or assign a city growth worker";
  static description =
    "Checks whether the selected plot can receive a city growth worker, or requests placement when --send is explicit.";

  static examples = [
    "<%= config.bin %> game play assign-worker --location 2543 --json",
    "<%= config.bin %> game play assign-worker --location 2543 --send --json",
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    location: Flags.integer({
      description: "Plot index/location selected for worker placement",
      required: true,
    }),
    send: Flags.boolean({
      description: "Request one worker assignment after the native availability check",
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
    const { flags } = await this.parse(GamePlayAssignWorker);
    const input = {
      mode: "assign-worker" as const,
      location: flags.location,
    };
    const client = createCiv7GameControlClient({
      endpointDefaults: buildDirectControlOptions(flags),
    });
    const result = flags.send
      ? await client.city.population.place.request(input)
      : await client.city.population.place.check(input);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
