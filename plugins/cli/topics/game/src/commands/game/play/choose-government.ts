import { Command, Flags } from "@oclif/core";
import { createCiv7GameControlClient } from "../../../adapters/control/service-client";
import { buildDirectControlOptions, emitPlayResult } from "../../../adapters/play/direct-control";

export default class GamePlayChooseGovernment extends Command {
  static summary = "Check or choose a government";
  static description =
    "Checks the exact live government choice through the control service, or requests it when --send is explicit.";

  static examples = [
    "<%= config.bin %> game play choose-government --government-type 0 --json",
    "<%= config.bin %> game play choose-government --government-type 0 --send --json",
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    "government-type": Flags.integer({
      description: "GovernmentType index from the live government picker",
      required: true,
    }),
    send: Flags.boolean({
      description: "Request the government choice after the service-owned availability check",
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
    const { flags } = await this.parse(GamePlayChooseGovernment);
    const input = {
      governmentType: flags["government-type"],
    };
    const client = createCiv7GameControlClient({
      endpointDefaults: buildDirectControlOptions(flags),
    });
    const result = flags.send
      ? await client.government.choice.request(input)
      : await client.government.choice.check(input);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
