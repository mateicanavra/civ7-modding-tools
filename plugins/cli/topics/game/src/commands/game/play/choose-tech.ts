import { Command, Flags } from "@oclif/core";
import { createCiv7GameControlClient } from "../../../adapters/control/service-client";
import { buildDirectControlOptions, emitPlayResult } from "../../../adapters/play/direct-control";

export default class GamePlayChooseTech extends Command {
  static summary = "Check or choose a technology node";
  static description =
    "Reads technology options, checks one choice, or requests the choice through the Civ7 control service.";

  static examples = [
    "<%= config.bin %> game play choose-tech --options --json",
    "<%= config.bin %> game play choose-tech --node -1255676052 --json",
    "<%= config.bin %> game play choose-tech --node -1255676052 --send --json",
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    node: Flags.integer({
      description: "ProgressionTreeNodeType id from live progression options",
    }),
    options: Flags.boolean({
      description: "Read technology choice options without sending",
      default: false,
      exclusive: ["node", "send"],
    }),
    send: Flags.boolean({
      description: "Request the technology choice after a fresh native check",
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
    const { flags } = await this.parse(GamePlayChooseTech);
    const client = createCiv7GameControlClient({
      endpointDefaults: buildDirectControlOptions(flags),
    });
    if (flags.options) {
      const result = await client.progression.technology.choice.options({});
      emitPlayResult(this.log.bind(this), flags.json, result);
      return;
    }

    const node = flags.node;
    if (typeof node !== "number") {
      throw new Error("game play choose-tech requires --node unless --options is used");
    }
    const result = flags.send
      ? await client.progression.technology.choice.request({ node })
      : await client.progression.technology.choice.check({ node });

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
