import { Command, Flags } from "@oclif/core";
import { createCiv7GameControlClient } from "../../../adapters/control/service-client";
import {
  buildDirectControlOptions,
  emitPlayResult,
  parseComponentId,
} from "../../../adapters/play/direct-control";

export default class GamePlayExpandCity extends Command {
  static summary = "Validate or send a city expansion placement";
  static description =
    "Checks whether the selected plot can expand the city, or requests expansion when --send is explicit.";

  static examples = [
    '<%= config.bin %> game play expand-city --city-id \'{"owner":0,"id":196610,"type":1}\' --x 16 --y 19 --json',
    '<%= config.bin %> game play expand-city --city-id \'{"owner":0,"id":196610,"type":1}\' --x 16 --y 19 --send --json',
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    "city-id": Flags.string({
      description: "City ComponentID JSON from the live NEW_POPULATION decision",
      required: true,
    }),
    x: Flags.integer({
      description: "Expansion plot X coordinate from the live acquire-tile/ready-city view",
      required: true,
    }),
    y: Flags.integer({
      description: "Expansion plot Y coordinate from the live acquire-tile/ready-city view",
      required: true,
    }),
    send: Flags.boolean({
      description: "Request city expansion after the native availability check",
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
    const { flags } = await this.parse(GamePlayExpandCity);
    const input = {
      mode: "expand-city" as const,
      cityId: parseComponentId(flags["city-id"], "city-id"),
      destination: {
        x: flags.x,
        y: flags.y,
      },
    };
    const client = createCiv7GameControlClient({
      endpointDefaults: buildDirectControlOptions(flags),
    });
    const result = flags.send
      ? await client.city.population.place.request(input)
      : await client.city.population.place.check(input);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
