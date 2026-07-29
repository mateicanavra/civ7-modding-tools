import { Command, Flags } from "@oclif/core";
import { createCiv7GameControlClient } from "../../../adapters/control/service-client";
import { buildDirectControlOptions, emitPlayResult } from "../../../adapters/play/direct-control";

const TRADITION_ACTIONS = ["activate", "deactivate"] as const;

export default class GamePlayChangeTradition extends Command {
  static summary = "Check or change an active tradition";
  static description =
    "Checks or requests a semantic tradition change through the Civ7 control service.";

  static examples = [
    "<%= config.bin %> game play change-tradition --tradition-type 2057145683 --action activate --json",
    "<%= config.bin %> game play change-tradition --tradition-type -331546976 --action deactivate --send --json",
    "<%= config.bin %> game play change-tradition --tradition-type -331546976 --action deactivate --send --closeout --json",
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    "tradition-type": Flags.integer({
      description: "TraditionType id from live tradition options",
      required: true,
    }),
    action: Flags.string({
      description: "Whether to activate or deactivate the tradition",
      options: [...TRADITION_ACTIONS],
      required: true,
    }),
    send: Flags.boolean({
      description: "Request the tradition change after a fresh native check",
      default: false,
    }),
    closeout: Flags.boolean({
      description: "Close tradition review in the same service-owned request",
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
    const { flags } = await this.parse(GamePlayChangeTradition);
    const action = flags.action;
    if (action !== "activate" && action !== "deactivate") {
      throw new Error("game play change-tradition requires --action activate|deactivate");
    }
    if (flags.closeout && !flags.send) {
      throw new Error("game play change-tradition --closeout requires --send");
    }

    const client = createCiv7GameControlClient({
      endpointDefaults: buildDirectControlOptions(flags),
    });
    const result = flags.send
      ? await client.progression.tradition.change.request({
          traditionType: flags["tradition-type"],
          action,
          closeReview: flags.closeout,
        })
      : await client.progression.tradition.change.check({
          traditionType: flags["tradition-type"],
          action,
        });

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
