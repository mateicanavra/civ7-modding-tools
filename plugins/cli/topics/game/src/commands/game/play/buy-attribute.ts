import { Command, Flags } from "@oclif/core";
import { createCiv7GameControlClient } from "../../../adapters/control/service-client";
import { buildDirectControlOptions, emitPlayResult } from "../../../adapters/play/direct-control";

export default class GamePlayBuyAttribute extends Command {
  static summary = "Check or buy an attribute tree node";
  static description = "Checks or requests an attribute purchase through the Civ7 control service.";

  static examples = [
    "<%= config.bin %> game play buy-attribute --node 20 --json",
    "<%= config.bin %> game play buy-attribute --node 20 --send --json",
    "<%= config.bin %> game play buy-attribute --node 20 --send --closeout --json",
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    node: Flags.integer({
      description: "ProgressionTreeNodeType id from live attribute options",
      required: true,
    }),
    send: Flags.boolean({
      description: "Request the attribute purchase after a fresh native check",
      default: false,
    }),
    closeout: Flags.boolean({
      description: "Close attribute review in the same service-owned request",
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
    const { flags } = await this.parse(GamePlayBuyAttribute);
    if (flags.closeout && !flags.send) {
      throw new Error("game play buy-attribute --closeout requires --send");
    }
    const client = createCiv7GameControlClient({
      endpointDefaults: buildDirectControlOptions(flags),
    });
    const result = flags.send
      ? await client.progression.attribute.purchase.request({
          node: flags.node,
          closeReview: flags.closeout,
        })
      : await client.progression.attribute.purchase.check({ node: flags.node });

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
