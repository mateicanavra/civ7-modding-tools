import { Command, Flags } from "@oclif/core";
import { createCiv7GameControlClient } from "../../../adapters/control/service-client";
import { buildDirectControlOptions, emitPlayResult } from "../../../adapters/play/direct-control";

export default class GamePlaySetTechTarget extends Command {
  static summary = "Check or set a technology tree target";
  static description = "Checks or requests a technology target through the Civ7 control service.";

  static examples = [
    "<%= config.bin %> game play set-tech-target --node -1255676052 --json",
    "<%= config.bin %> game play set-tech-target --node -1255676052 --send --json",
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
      required: true,
    }),
    send: Flags.boolean({
      description: "Request the technology target after a fresh native check",
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
    const { flags } = await this.parse(GamePlaySetTechTarget);
    const client = createCiv7GameControlClient({
      endpointDefaults: buildDirectControlOptions(flags),
    });
    const input = { node: flags.node };
    const result = flags.send
      ? await client.progression.technology.target.request(input)
      : await client.progression.technology.target.check(input);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
