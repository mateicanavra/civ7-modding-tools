import { createCiv7ControlOrpcServerClient } from "@civ7/control-orpc";
import { liveCiv7ControlOrpcDirectControlFacade } from "@civ7/control-orpc/runtime";
import { type Civ7DirectControlOptions, executeCiv7AppUiCommand } from "@civ7/direct-control";
import { Command, Flags } from "@oclif/core";
import {
  buildDirectControlOptions,
  emitPlayResult,
  validatePlayOperation,
} from "../../../utils/game-play-shared";

const RESPOND_DIPLOMATIC_FIRST_MEET = "RESPOND_DIPLOMATIC_FIRST_MEET";
const FIRST_MEET_RESPONSE_KEYS = {
  friendly: "PLAYER_REALATIONSHIP_FIRSTMEET_FRIENDLY",
  neutral: "PLAYER_REALATIONSHIP_FIRSTMEET_NEUTRAL",
  unfriendly: "PLAYER_REALATIONSHIP_FIRSTMEET_UNFRIENDLY",
} as const;

type FirstMeetResponse = keyof typeof FIRST_MEET_RESPONSE_KEYS;

export default class GamePlayRespondFirstMeet extends Command {
  static id = "game play respond-first-meet";
  static summary = "Validate or send a first-meet diplomacy greeting";
  static description =
    "Wraps player-operation RESPOND_DIPLOMATIC_FIRST_MEET with the two player ids and first-meet greeting Type from the live first-meet UI.";

  static examples = [
    "<%= config.bin %> game play respond-first-meet --player-id 0 --met-player-id 2 --response neutral --json",
    "<%= config.bin %> game play respond-first-meet --met-player-id 2 --response neutral --send --json",
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    "player-id": Flags.integer({
      description:
        "Local player id used for dry-run validation. Send mode reads the local player from live notification evidence.",
    }),
    "met-player-id": Flags.integer({
      description: "Other player id from the live first-meet notification or diplomacy panel",
      required: true,
    }),
    "response-type": Flags.integer({
      description: "First-meet response Type enum value from the live first-meet UI",
      exclusive: ["response"],
    }),
    response: Flags.string({
      description: "Resolve a named first-meet greeting through the live App UI enum",
      options: ["friendly", "neutral", "unfriendly"],
      exclusive: ["response-type"],
    }),
    send: Flags.boolean({
      description: "Send RESPOND_DIPLOMATIC_FIRST_MEET after validator success",
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
    const { flags } = await this.parse(GamePlayRespondFirstMeet);
    const options = buildDirectControlOptions(flags);
    const responseType =
      flags["response-type"] ??
      (await resolveFirstMeetResponseType(
        flags.response as FirstMeetResponse | undefined,
        options
      ));
    if (flags.send) {
      const result = await createCiv7ControlOrpcServerClient({
        directControl: liveCiv7ControlOrpcDirectControlFacade,
        endpointDefaults: options,
      }).diplomacy.firstMeet.response.request({
        metPlayerId: flags["met-player-id"],
        responseType,
      });
      emitPlayResult(this.log.bind(this), flags.json, result);
      return;
    }
    if (typeof flags["player-id"] !== "number") {
      throw new Error("game play respond-first-meet requires --player-id for dry-run validation");
    }

    const input = {
      operationType: RESPOND_DIPLOMATIC_FIRST_MEET,
      playerId: flags["player-id"],
      args: {
        Player1: flags["player-id"],
        Player2: flags["met-player-id"],
        Type: responseType,
      },
    };
    const result = await validatePlayOperation("player-operation", input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}

async function resolveFirstMeetResponseType(
  response: FirstMeetResponse | undefined,
  options: Civ7DirectControlOptions
): Promise<number> {
  if (!response) {
    throw new Error("game play respond-first-meet requires either --response-type or --response");
  }
  const key = FIRST_MEET_RESPONSE_KEYS[response];
  const result = await executeCiv7AppUiCommand({
    ...options,
    command: `JSON.stringify((() => {
      const key = ${JSON.stringify(key)};
      const value =
        (typeof DiplomacyPlayerFirstMeets !== 'undefined' ? DiplomacyPlayerFirstMeets?.[key] : undefined)
        ?? (typeof GameInfo !== 'undefined' ? GameInfo?.Types?.lookup?.(key)?.Hash : undefined)
        ?? null;
      return { key, value };
    })())`,
  });
  const payloadText = result.output.find((part) => part.trim().startsWith("{"));
  if (!payloadText) {
    throw new Error(`Could not resolve first-meet response enum ${key}: empty App UI response`);
  }
  const payload = JSON.parse(payloadText) as { value?: unknown };
  if (typeof payload.value !== "number") {
    throw new Error(`Could not resolve first-meet response enum ${key}: ${String(payload.value)}`);
  }
  return payload.value;
}
