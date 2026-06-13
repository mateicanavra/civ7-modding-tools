import {
  assertCiv7ComponentId,
  type Civ7ComponentId,
  type Civ7OperationInput,
  canStartCiv7CityCommand,
  canStartCiv7CityOperation,
  canStartCiv7PlayerOperation,
  canStartCiv7UnitCommand,
  canStartCiv7UnitOperation,
  requestCiv7CityCommand,
  requestCiv7CityOperation,
  requestCiv7PlayerOperation,
  requestCiv7UnitCommand,
  requestCiv7UnitOperation,
} from "@civ7/direct-control";
import { Command, Flags } from "@oclif/core";

export default class GameOperation extends Command {
  static id = "game operation";
  static summary = "Validate or send Civ7 gameplay operations";
  static description =
    "Runs validator-first Unit/City/Player operation and command wrappers through @civ7/direct-control.";

  static examples = [
    '<%= config.bin %> game operation --family unit-operation --operation-type SKIP_TURN --unit-id \'{"owner":0,"id":65536,"type":26}\' --json',
    '<%= config.bin %> game operation --family unit-operation --operation-type SKIP_TURN --unit-id \'{"owner":0,"id":65536,"type":26}\' --send --json',
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    family: Flags.string({
      description: "Operation family",
      options: [
        "unit-operation",
        "unit-command",
        "city-operation",
        "city-command",
        "player-operation",
      ],
      required: true,
    }),
    "operation-type": Flags.string({
      description: "Operation or command enum key",
      required: true,
    }),
    "unit-id": Flags.string({
      description: "Unit ComponentID JSON",
    }),
    "city-id": Flags.string({
      description: "City ComponentID JSON",
    }),
    "player-id": Flags.integer({
      description: "Player id",
    }),
    args: Flags.string({
      description: "Operation args JSON",
    }),
    send: Flags.boolean({
      description: "Send the request after validator success",
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
    const { flags } = await this.parse(GameOperation);
    const options = {
      host: flags.host,
      port: flags.port,
      timeoutMs: flags["timeout-ms"],
    };
    const input = buildOperationInput(flags);
    const result = flags.send
      ? await sendOperation(flags.family, input, options)
      : await validateOperation(flags.family, input, options);

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, result }));
      return;
    }

    this.log(JSON.stringify(result, null, 2));
  }
}

function buildOperationInput(flags: {
  family: string;
  "operation-type": string;
  "unit-id"?: string;
  "city-id"?: string;
  "player-id"?: number;
  args?: string;
}): Civ7OperationInput {
  const base = {
    operationType: flags["operation-type"],
    args: flags.args ? (JSON.parse(flags.args) as unknown) : undefined,
  };
  if (flags.family.startsWith("unit-"))
    return { ...base, unitId: parseComponentId(flags["unit-id"], "unit-id") };
  if (flags.family.startsWith("city-"))
    return { ...base, cityId: parseComponentId(flags["city-id"], "city-id") };
  if (flags["player-id"] === undefined) throw new Error("player-operation requires --player-id");
  return { ...base, playerId: flags["player-id"] };
}

async function validateOperation(
  family: string,
  input: Civ7OperationInput,
  options: { host?: string; port?: number; timeoutMs?: number }
) {
  if (family === "unit-operation")
    return await canStartCiv7UnitOperation(assertUnitInput(input), options);
  if (family === "unit-command")
    return await canStartCiv7UnitCommand(assertUnitInput(input), options);
  if (family === "city-operation")
    return await canStartCiv7CityOperation(assertCityInput(input), options);
  if (family === "city-command")
    return await canStartCiv7CityCommand(assertCityInput(input), options);
  return await canStartCiv7PlayerOperation(assertPlayerInput(input), options);
}

async function sendOperation(
  family: string,
  input: Civ7OperationInput,
  options: { host?: string; port?: number; timeoutMs?: number }
) {
  if (family === "unit-operation")
    return await requestCiv7UnitOperation(assertUnitInput(input), options);
  if (family === "unit-command")
    return await requestCiv7UnitCommand(assertUnitInput(input), options);
  if (family === "city-operation")
    return await requestCiv7CityOperation(assertCityInput(input), options);
  if (family === "city-command")
    return await requestCiv7CityCommand(assertCityInput(input), options);
  return await requestCiv7PlayerOperation(assertPlayerInput(input), options);
}

function parseComponentId(value: string | undefined, flag: string): Civ7ComponentId {
  if (!value) throw new Error(`--${flag} is required`);
  try {
    return assertCiv7ComponentId(JSON.parse(value) as unknown, `--${flag}`);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`--${flag} must be valid JSON: ${error.message}`);
    }
    throw error;
  }
}

function assertUnitInput(
  input: Civ7OperationInput
): Civ7OperationInput & { unitId: Civ7ComponentId } {
  if (!("unitId" in input)) throw new Error("unit operation requires unitId");
  return input;
}

function assertCityInput(
  input: Civ7OperationInput
): Civ7OperationInput & { cityId: Civ7ComponentId } {
  if (!("cityId" in input)) throw new Error("city operation requires cityId");
  return input;
}

function assertPlayerInput(input: Civ7OperationInput): Civ7OperationInput & { playerId: number } {
  if (!("playerId" in input)) throw new Error("player operation requires playerId");
  return input;
}
