import { Command, Flags } from "@oclif/core";
import { createCiv7GameControlClient } from "../../../../adapters/control/service-client";
import {
  buildDirectControlOptions,
  emitPlayResult,
} from "../../../../adapters/play/direct-control";

export default class GamePlayDiplomacyRespond extends Command {
  static summary = "Check or send an ordinary diplomacy response";
  static description =
    "Uses the Civ7 control service to check or request one currently offered native diplomacy response.";
  static hiddenAliases = ["game:play:respond-diplomacy"];

  static examples = [
    "<%= config.bin %> game play diplomacy respond --action-id 56 --response-type -1907089594 --json",
    "<%= config.bin %> game play diplomacy respond --action-id 56 --response-type -1907089594 --send --json",
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    "action-id": Flags.integer({
      description: "Diplomatic action ID from the live diplomacy notification",
      required: true,
    }),
    "response-type": Flags.integer({
      description: "Response Type enum value from the live diplomacy UI",
      required: true,
    }),
    send: Flags.boolean({
      description: "Request the response after the service-owned availability check",
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
    const { flags } = await this.parse(GamePlayDiplomacyRespond);
    const input = {
      actionId: flags["action-id"],
      responseType: flags["response-type"],
    };
    const client = createCiv7GameControlClient({
      endpointDefaults: buildDirectControlOptions(flags),
    });
    const result = flags.send
      ? await client.diplomacy.response.request(input)
      : await client.diplomacy.response.check(input);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
