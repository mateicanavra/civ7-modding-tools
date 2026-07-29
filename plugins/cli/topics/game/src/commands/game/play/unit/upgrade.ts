import { Command, Flags } from "@oclif/core";
import { createCiv7GameControlClient } from "../../../../adapters/control/service-client";
import {
  buildDirectControlOptions,
  emitPlayResult,
  parseComponentId,
} from "../../../../adapters/play/direct-control";

export default class GamePlayUnitUpgrade extends Command {
  static summary = "Validate or send a unit upgrade command";
  static description =
    "Checks whether the selected unit can upgrade, or requests the upgrade when --send is explicit.";
  static hiddenAliases = ["game:play:upgrade-unit"];

  static examples = [
    '<%= config.bin %> game play unit upgrade --unit-id \'{"owner":0,"id":1769488,"type":26}\' --json',
    '<%= config.bin %> game play unit upgrade --unit-id \'{"owner":0,"id":1769488,"type":26}\' --send --json',
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    "unit-id": Flags.string({
      description: "Unit ComponentID JSON from the live ready-unit/action-panel view",
      required: true,
    }),
    send: Flags.boolean({
      description: "Send UNITCOMMAND_UPGRADE after validator success",
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
    const { flags } = await this.parse(GamePlayUnitUpgrade);
    const input = {
      unitId: parseComponentId(flags["unit-id"], "unit-id"),
    };
    const client = createCiv7GameControlClient({
      endpointDefaults: buildDirectControlOptions(flags),
    });
    const result = flags.send
      ? await client.unit.upgrade.request(input)
      : await client.unit.upgrade.check(input);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
