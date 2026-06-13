import { createCiv7ControlOrpcServerClient } from "@civ7/control-orpc";
import { liveCiv7ControlOrpcDirectControlFacade } from "@civ7/control-orpc/runtime";
import { Command, Flags } from "@oclif/core";
import {
  buildDirectControlOptions,
  emitPlayResult,
  executePlayOperationSequence,
  parseComponentId,
  validatePlayOperation,
} from "../../../utils/game-play-shared";

const CHANGE_GROWTH_MODE = "CHANGE_GROWTH_MODE";
const CONSIDER_TOWN_PROJECT = "CONSIDER_TOWN_PROJECT";

export default class GamePlaySetTownFocus extends Command {
  static id = "game play set-town-focus";
  static summary = "Validate or change a town focus project";
  static description =
    "Wraps city-command CHANGE_GROWTH_MODE for town focus choices, which are growth-mode commands rather than production BUILD requests.";

  static examples = [
    '<%= config.bin %> game play set-town-focus --city-id \'{"owner":0,"id":131073,"type":1}\' --growth-type -284569333 --project-type -548685232 --json',
    '<%= config.bin %> game play set-town-focus --city-id \'{"owner":0,"id":131073,"type":1}\' --growth-type -284569333 --project-type -548685232 --send --json',
    '<%= config.bin %> game play set-town-focus --city-id \'{"owner":0,"id":131073,"type":1}\' --growth-type -284569333 --project-type -548685232 --send --closeout --json',
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
    city: Flags.integer({
      description: "Numeric city id for the CHANGE_GROWTH_MODE args; defaults to city-id.id",
    }),
    send: Flags.boolean({
      description: "Send CHANGE_GROWTH_MODE after validator success",
      default: false,
    }),
    closeout: Flags.boolean({
      description: "Also run CONSIDER_TOWN_PROJECT as part of the same caller-level workflow",
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
    if (flags.send) {
      const client = createCiv7ControlOrpcServerClient({
        directControl: liveCiv7ControlOrpcDirectControlFacade,
        endpointDefaults: options,
      });
      const change = await client.city.townFocus.change.request({
        cityId,
        growthType: flags["growth-type"],
        projectType: flags["project-type"],
        ...(flags.city === undefined ? {} : { city: flags.city }),
      });
      if (flags.closeout) {
        const review =
          change.status === "not-sent"
            ? null
            : await client.city.townFocus.review.request({ cityId });
        emitPlayResult(
          this.log.bind(this),
          flags.json,
          townFocusWorkflow([
            { label: "set town focus", result: change },
            ...(review === null ? [] : [{ label: "close town project review", result: review }]),
          ])
        );
        return;
      }

      emitPlayResult(this.log.bind(this), flags.json, change);
      return;
    }

    const input = {
      operationType: CHANGE_GROWTH_MODE,
      cityId,
      args: {
        Type: flags["growth-type"],
        ProjectType: flags["project-type"],
        City: flags.city ?? cityId.id,
      },
    };
    if (flags.closeout) {
      const result = await executePlayOperationSequence(
        [
          {
            label: "set town focus",
            family: "city-command",
            input,
          },
          {
            label: "close town project review",
            family: "city-operation",
            input: {
              operationType: CONSIDER_TOWN_PROJECT,
              cityId,
              args: {},
            },
          },
        ],
        options,
        { send: flags.send }
      );

      emitPlayResult(this.log.bind(this), flags.json, result);
      return;
    }

    const result = await validatePlayOperation("city-command", input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}

function townFocusWorkflow(steps: Array<{ label: string; result: unknown }>) {
  return {
    mode: "send",
    stepCount: steps.length,
    status: steps.some(
      (step) =>
        typeof step.result === "object" &&
        step.result !== null &&
        "status" in step.result &&
        step.result.status === "sent-unverified"
    )
      ? "sent-unverified"
      : "not-sent",
    steps,
    nextSteps: [
      {
        kind: "do-not-repeat",
        source: "city.townFocus.change.request",
        label:
          "Do not repeat this town focus workflow until fresh city readiness evidence is read.",
      },
    ],
  };
}
