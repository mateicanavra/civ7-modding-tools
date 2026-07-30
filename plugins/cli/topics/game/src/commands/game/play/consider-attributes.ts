import { Command, Flags } from "@oclif/core";
import { createCiv7GameControlClient } from "../../../adapters/control/service-client";
import { buildDirectControlOptions, emitPlayResult } from "../../../adapters/play/direct-control";

export default class GamePlayConsiderAttributes extends Command {
  static summary = "Check or close attribute assignment review";
  static description =
    "Checks or requests attribute review completion through the Civ7 control service.";

  static examples = [
    "<%= config.bin %> game play consider-attributes --json",
    "<%= config.bin %> game play consider-attributes --send --json",
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    send: Flags.boolean({
      description: "Request attribute review completion after a fresh native check",
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
    const { flags } = await this.parse(GamePlayConsiderAttributes);
    const client = createCiv7GameControlClient({
      endpointDefaults: buildDirectControlOptions(flags),
    });
    const result = flags.send
      ? await client.progression.attribute.review.request({})
      : await client.progression.attribute.review.check({});

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
