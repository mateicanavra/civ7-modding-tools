import { Command, Flags } from "@oclif/core";
import { createCiv7GameControlClient } from "../../../adapters/control/service-client";
import {
  buildDirectControlOptions,
  emitPlayResult,
  parseComponentId,
} from "../../../adapters/play/direct-control";

export default class GamePlaySetTownFocus extends Command {
  static summary = "Check or change a town focus";
  static description = "Checks or applies a town focus through the Civ7 city control service.";

  static examples = [
    '<%= config.bin %> game play set-town-focus --city-id \'{"owner":0,"id":131073,"type":1}\' --growth-type -284569333 --project-type -548685232 --json',
    '<%= config.bin %> game play set-town-focus --city-id \'{"owner":0,"id":131073,"type":1}\' --growth-type -284569333 --project-type -548685232 --send --json',
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    "city-id": Flags.string({
      description: "Town ComponentID JSON",
      required: true,
    }),
    "growth-type": Flags.integer({
      description: "GrowthTypes enum value from the live town focus UI",
      required: true,
    }),
    "project-type": Flags.integer({
      description: "ProjectTypes enum value from the live town focus UI",
      required: true,
    }),
    send: Flags.boolean({
      description: "Apply the selected town focus after the service precheck",
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
    const { flags } = await this.parse(GamePlaySetTownFocus);
    const cityId = parseComponentId(flags["city-id"], "city-id");
    const options = buildDirectControlOptions(flags);
    const input = {
      cityId,
      growthType: flags["growth-type"],
      projectType: flags["project-type"],
    };
    const client = createCiv7GameControlClient({ endpointDefaults: options });
    const result = flags.send
      ? await client.city.townFocus.change.request(input)
      : await client.city.townFocus.change.check(input);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
