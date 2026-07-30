import { Command, Flags } from "@oclif/core";
import { createCiv7GameControlClient } from "../../../adapters/control/service-client";
import { buildDirectControlOptions, emitPlayResult } from "../../../adapters/play/direct-control";

export default class GamePlayChooseCelebration extends Command {
  static summary = "Check or choose a celebration bonus";
  static description =
    "Checks the exact live celebration choice through the control service, or requests it when --send is explicit.";

  static examples = [
    "<%= config.bin %> game play choose-celebration --golden-age-type -340825966 --json",
    "<%= config.bin %> game play choose-celebration --golden-age-type -340825966 --send --json",
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    "golden-age-type": Flags.integer({
      description: "GoldenAgeType hash from the live celebration chooser",
      required: true,
    }),
    send: Flags.boolean({
      description: "Request the celebration choice after the service-owned availability check",
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
    const { flags } = await this.parse(GamePlayChooseCelebration);
    const input = {
      goldenAgeType: flags["golden-age-type"],
    };
    const client = createCiv7GameControlClient({
      endpointDefaults: buildDirectControlOptions(flags),
    });
    const result = flags.send
      ? await client.government.celebration.choice.request(input)
      : await client.government.celebration.choice.check(input);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
