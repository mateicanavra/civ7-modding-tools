import { Command, Flags } from "@oclif/core";
import { createCiv7GameControlClient } from "../../../adapters/control/service-client";
import {
  buildDirectControlOptions,
  emitPlayResult,
  parseComponentId,
} from "../../../adapters/play/direct-control";

export default class GamePlayConsiderTownProject extends Command {
  static summary = "Check or complete town project review";
  static description =
    "Checks or completes a town project review through the Civ7 city control service.";

  static examples = [
    '<%= config.bin %> game play consider-town-project --city-id \'{"owner":0,"id":131073,"type":1}\' --json',
    '<%= config.bin %> game play consider-town-project --city-id \'{"owner":0,"id":131073,"type":1}\' --send --json',
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
    send: Flags.boolean({
      description: "Complete the town project review after the service precheck",
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
    const { flags } = await this.parse(GamePlayConsiderTownProject);
    const cityId = parseComponentId(flags["city-id"], "city-id");
    const options = buildDirectControlOptions(flags);
    const client = createCiv7GameControlClient({ endpointDefaults: options });
    const input = { cityId };
    const result = flags.send
      ? await client.city.townFocus.review.request(input)
      : await client.city.townFocus.review.check(input);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
