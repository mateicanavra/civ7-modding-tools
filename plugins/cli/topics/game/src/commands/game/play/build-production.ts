import { Command, Flags } from "@oclif/core";
import { createCiv7GameControlClient } from "../../../adapters/control/service-client";
import {
  buildDirectControlOptions,
  emitPlayResult,
  parseComponentId,
} from "../../../adapters/play/direct-control";

type BuildProductionFlags = Readonly<{
  host?: string;
  port?: number;
  "city-id": string;
  "unit-type"?: number;
  "constructible-type"?: number;
  "project-type"?: number;
  x?: number;
  y?: number;
  send: boolean;
  "timeout-ms": number;
  json: boolean;
}>;

type ProductionChoiceArgs =
  | Readonly<{ UnitType: number }>
  | Readonly<{ ProjectType: number }>
  | Readonly<{ ConstructibleType: number }>
  | Readonly<{ ConstructibleType: number; X: number; Y: number }>;

export default class GamePlayBuildProduction extends Command {
  static summary = "Validate or choose city production";
  static description =
    "Validates city-operation BUILD choices, or sends production through the native control-oRPC city procedure when --send is explicit.";

  static examples = [
    '<%= config.bin %> game play build-production --city-id \'{"owner":0,"id":65536,"type":25}\' --unit-type 1558890441 --json',
    '<%= config.bin %> game play build-production --city-id \'{"owner":0,"id":65536,"type":1}\' --constructible-type 713967338 --x 22 --y 31 --send --json',
    '<%= config.bin %> game play build-production --city-id \'{"owner":0,"id":65536,"type":1}\' --project-type 12345 --json',
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    "city-id": Flags.string({
      description: "City ComponentID JSON",
      required: true,
    }),
    "unit-type": Flags.integer({
      description: "UnitType id from the live production chooser/GameInfo",
      exclusive: ["constructible-type", "project-type"],
    }),
    "constructible-type": Flags.integer({
      description: "ConstructibleType id from the live production chooser/GameInfo",
      exclusive: ["unit-type", "project-type"],
    }),
    "project-type": Flags.integer({
      description: "ProjectType id from the live production chooser/GameInfo",
      exclusive: ["unit-type", "constructible-type"],
    }),
    x: Flags.integer({
      description: "Placement plot X coordinate for placement-sensitive constructibles",
      dependsOn: ["y"],
    }),
    y: Flags.integer({
      description: "Placement plot Y coordinate for placement-sensitive constructibles",
      dependsOn: ["x"],
    }),
    send: Flags.boolean({
      description: "Send BUILD after validator success",
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
    const { flags } = await this.parse(GamePlayBuildProduction);
    const typedFlags = flags as BuildProductionFlags;
    const input = {
      cityId: parseComponentId(typedFlags["city-id"], "city-id"),
      args: buildProductionArgs(typedFlags),
    };
    const client = createCiv7GameControlClient({
      endpointDefaults: buildDirectControlOptions(typedFlags),
    });
    const result = typedFlags.send
      ? await client.city.production.choice.request(input)
      : await client.city.production.choice.check(input);

    emitPlayResult(this.log.bind(this), typedFlags.json, result);
  }
}

function buildProductionArgs(flags: BuildProductionFlags): ProductionChoiceArgs {
  const unitType = flags["unit-type"];
  const constructibleType = flags["constructible-type"];
  const projectType = flags["project-type"];
  const selectedCount = [unitType, constructibleType, projectType].filter(
    (value) => value !== undefined
  ).length;
  if (selectedCount !== 1) {
    throw new Error(
      "game play build-production requires exactly one of --unit-type, --constructible-type, or --project-type"
    );
  }

  if (unitType !== undefined) {
    if (flags.x !== undefined || flags.y !== undefined) {
      throw new Error("--x/--y placement coordinates are only supported with --constructible-type");
    }
    return { UnitType: unitType };
  }
  if (projectType !== undefined) {
    if (flags.x !== undefined || flags.y !== undefined) {
      throw new Error("--x/--y placement coordinates are only supported with --constructible-type");
    }
    return { ProjectType: projectType };
  }
  if (constructibleType === undefined) {
    throw new Error("game play build-production requires a production item id");
  }

  if (flags.x !== undefined || flags.y !== undefined) {
    if (flags.x === undefined || flags.y === undefined) {
      throw new Error("--x and --y must be provided together");
    }
    return { ConstructibleType: constructibleType, X: flags.x, Y: flags.y };
  }
  return { ConstructibleType: constructibleType };
}
