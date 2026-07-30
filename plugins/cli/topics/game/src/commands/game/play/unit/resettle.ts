import { Command, Flags } from "@oclif/core";
import { createCiv7GameControlClient } from "../../../../adapters/control/service-client";
import {
  buildDirectControlOptions,
  emitPlayResult,
  parseComponentId,
} from "../../../../adapters/play/direct-control";

export default class GamePlayUnitResettle extends Command {
  static summary = "Validate or send a population resettle command";
  static description =
    "Checks whether the selected population unit can resettle, or requests resettlement when --send is explicit.";
  static hiddenAliases = ["game:play:resettle-unit"];

  static examples = [
    '<%= config.bin %> game play unit resettle --unit-id \'{"owner":0,"id":1703951,"type":26}\' --x 17 --y 25 --json',
    '<%= config.bin %> game play unit resettle --unit-id \'{"owner":0,"id":1703951,"type":26}\' --x 17 --y 25 --send --json',
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    "unit-id": Flags.string({
      description: "Population unit ComponentID JSON from the live ready-unit/acquire-tile view",
      required: true,
    }),
    x: Flags.integer({
      description: "Owned district target plot X coordinate from the live acquire-tile view",
      required: true,
    }),
    y: Flags.integer({
      description: "Owned district target plot Y coordinate from the live acquire-tile view",
      required: true,
    }),
    send: Flags.boolean({
      description: "Send UNITCOMMAND_RESETTLE after validator success",
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
    const { flags } = await this.parse(GamePlayUnitResettle);
    const input = {
      unitId: parseComponentId(flags["unit-id"], "unit-id"),
      destination: {
        x: flags.x,
        y: flags.y,
      },
    };
    const client = createCiv7GameControlClient({
      endpointDefaults: buildDirectControlOptions(flags),
    });
    const result = flags.send
      ? await client.unit.resettle.request(input)
      : await client.unit.resettle.check(input);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
