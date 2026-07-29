import { Command, Flags } from "@oclif/core";
import { createCiv7GameControlClient } from "../../../../adapters/control/service-client";
import {
  buildDirectControlOptions,
  emitPlayResult,
  parseComponentId,
} from "../../../../adapters/play/direct-control";

export default class GamePlayUnitTarget extends Command {
  static summary = "Resolve a unit plot target through the official right-click action order";
  static description =
    "Checks or sends a unit target action through the native control-oRPC unit service.";
  static hiddenAliases = ["game:play:unit-target"];

  static examples = [
    '<%= config.bin %> game play unit target --unit-id \'{"owner":0,"id":65536,"type":26}\' --x 23 --y 33 --json',
    '<%= config.bin %> game play unit target --unit-id \'{"owner":0,"id":65536,"type":26}\' --x 23 --y 33 --send --json',
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    "unit-id": Flags.string({
      description: "Unit ComponentID JSON",
      required: true,
    }),
    x: Flags.integer({
      description: "Target plot X coordinate",
      required: true,
    }),
    y: Flags.integer({
      description: "Target plot Y coordinate",
      required: true,
    }),
    send: Flags.boolean({
      description: "Send the selected target action after resolving it",
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
    const { flags } = await this.parse(GamePlayUnitTarget);
    const input = {
      unitId: parseComponentId(flags["unit-id"], "unit-id"),
      x: flags.x,
      y: flags.y,
    };
    const options = buildDirectControlOptions(flags);
    const client = createCiv7GameControlClient({
      endpointDefaults: options,
    });
    const result = flags.send
      ? await client.unit.target.action.request(input)
      : await client.unit.target.action.check(input);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
