import { Command, Flags } from "@oclif/core";

import { createCiv7GameControlClient } from "../../../../adapters/control/service-client";
import {
  buildDirectControlOptions,
  emitPlayResult,
} from "../../../../adapters/play/direct-control";

const FIRST_MEET_RESPONSES = ["friendly", "neutral", "unfriendly"] as const;
type FirstMeetResponse = (typeof FIRST_MEET_RESPONSES)[number];

export default class GamePlayDiplomacyRespondFirstMeet extends Command {
  static summary = "Check or send a first-meet diplomacy greeting";
  static description =
    "Uses the Civ7 control service to check or request one named native first-meet greeting.";
  static hiddenAliases = ["game:play:respond-first-meet"];

  static examples = [
    "<%= config.bin %> game play diplomacy respond-first-meet --met-player-id 2 --response neutral --json",
    "<%= config.bin %> game play diplomacy respond-first-meet --met-player-id 2 --response neutral --send --json",
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    "met-player-id": Flags.integer({
      description: "Player encountered by the ambient local player",
      required: true,
    }),
    response: Flags.string({
      description: "Named first-meet greeting",
      options: [...FIRST_MEET_RESPONSES],
      required: true,
    }),
    send: Flags.boolean({
      description: "Request the greeting after the service-owned availability check",
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
    const { flags } = await this.parse(GamePlayDiplomacyRespondFirstMeet);
    const input = {
      metPlayerId: flags["met-player-id"],
      response: flags.response as FirstMeetResponse,
    };
    const client = createCiv7GameControlClient({
      endpointDefaults: buildDirectControlOptions(flags),
    });
    const result = flags.send
      ? await client.diplomacy.firstMeet.response.request(input)
      : await client.diplomacy.firstMeet.response.check(input);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
