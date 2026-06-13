import { Command, Flags } from "@oclif/core";
import { createCiv7ControlOrpcServerClient } from "@civ7/control-orpc";
import { liveCiv7ControlOrpcDirectControlFacade } from "@civ7/control-orpc/runtime";
import { getCiv7PlayNotificationView } from "@civ7/direct-control";
import {
  buildDirectControlOptions,
  emitPlayResult,
  validatePlayOperation,
} from "../../../utils/game-play-shared";

const SET_CULTURE_TREE_NODE = "SET_CULTURE_TREE_NODE";

type ProgressionOptionAction = {
  kind: "choose-culture" | "target-culture" | "validate-culture-choice";
  label: string;
  parameters: Record<string, unknown>;
  readOnly: boolean;
  sendsMutation: boolean;
};

export default class GamePlayChooseCulture extends Command {
  static id = "game play choose-culture";
  static summary = "Validate or choose a culture tree node";
  static description =
    "Validates culture choices as player operations, or sends them through the native control-oRPC progression procedure when --send is explicit.";

  static examples = [
    "<%= config.bin %> game play choose-culture --options --json",
    "<%= config.bin %> game play choose-culture --player-id 0 --node 115 --json",
    "<%= config.bin %> game play choose-culture --node 115 --send --json",
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    "player-id": Flags.integer({
      description: "Player id",
    }),
    node: Flags.integer({
      description: "ProgressionTreeNodeType id from live GameInfo/progression tree reads",
    }),
    options: Flags.boolean({
      description: "Read culture choice options from the live notification HUD without sending",
      default: false,
    }),
    send: Flags.boolean({
      description: "Send SET_CULTURE_TREE_NODE after validator success",
      default: false,
    }),
    closeout: Flags.boolean({
      description:
        "Compatibility no-op; send mode already clears the chooser target as one caller-level workflow",
      default: false,
      hidden: true,
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
    const { flags } = await this.parse(GamePlayChooseCulture);
    const options = buildDirectControlOptions(flags);
    if (flags.options) {
      if (flags.send)
        throw new Error("game play choose-culture --options is read-only; omit --send");
      const view = await getCiv7PlayNotificationView(options);
      const details = cultureChoiceDetails(view);
      const surfaces = details.map(compactCultureChoiceSurface);
      emitPlayResult(this.log.bind(this), flags.json, {
        surface: "culture-choice-options",
        surfaces,
        enabledOptionCount: surfaces.reduce(
          (count, surface) => count + surface.enabledOptions.length,
          0
        ),
        disabledOptionCount: surfaces.reduce(
          (count, surface) => count + surface.disabledOptionCount,
          0
        ),
        omitted: [
          {
            path: "details[].options",
            reason: "enabled rows carry semantic node fields and validation descriptors",
          },
          {
            path: "details[].disabledOptions",
            reason: "disabled nodes are counted but kept out of mutation action recommendations",
          },
          {
            path: "details[].availableNodeTypes",
            reason: "official culture chooser nodes are summarized on enabled rows",
          },
        ],
        notes: ["Rows come from live HUD choices with official culture validation evidence."],
      });
      return;
    }
    if (typeof flags.node !== "number") {
      throw new Error("game play choose-culture requires --node unless --options is used");
    }
    if (flags.send) {
      const result = await createCiv7ControlOrpcServerClient({
        directControl: liveCiv7ControlOrpcDirectControlFacade,
        endpointDefaults: options,
      }).progression.culture.choice.request({
        node: flags.node,
      });
      emitPlayResult(this.log.bind(this), flags.json, result);
      return;
    }
    if (typeof flags["player-id"] !== "number") {
      throw new Error(
        "game play choose-culture requires --player-id unless --options or --send is used"
      );
    }
    const input = {
      operationType: SET_CULTURE_TREE_NODE,
      playerId: flags["player-id"],
      args: {
        ProgressionTreeNodeType: flags.node,
      },
    };
    const result = await validatePlayOperation("player-operation", input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}

function cultureChoiceDetails(
  view: Awaited<ReturnType<typeof getCiv7PlayNotificationView>>
): Record<string, unknown>[] {
  const details = [
    ...view.notifications.map((notification) => notification.details),
    view.hud?.nextDecision?.details,
    ...(view.hud?.decisionQueue ?? []).map((decision) => decision.details),
  ];
  const seen = new Set<string>();
  return details.filter((detail): detail is Record<string, unknown> => {
    if (!detail || typeof detail !== "object") return false;
    const record = detail as Record<string, unknown>;
    if (record.kind !== "culture-choice-options") return false;
    const key = JSON.stringify(
      record.notificationId ??
        record.targetNode ??
        record.currentResearching ??
        record.localPlayerId
    );
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function compactCultureChoiceSurface(details: Record<string, unknown>): {
  kind: "culture-choice-options";
  notificationId: unknown;
  localPlayerId: unknown;
  currentResearching: unknown;
  targetNode: unknown;
  enabledOptions: Array<Record<string, unknown>>;
  enabledOptionCount: number;
  disabledOptionCount: number;
} {
  const enabledOptions = asArray(details.enabledOptions)
    .filter((option): option is Record<string, unknown> =>
      Boolean(option && typeof option === "object")
    )
    .map((option) => ({
      nodeType: option.nodeType,
      nodeTypeName: option.nodeTypeName,
      name: option.name,
      treeType: option.treeType,
      treeTypeName: option.treeTypeName,
      treeName: option.treeName,
      ageType: option.ageType,
      depth: option.depth,
      state: option.state,
      progress: option.progress,
      maxDepth: option.maxDepth,
      turns: probeValue(option.turns),
      cost: probeValue(option.cost),
      nextAction: progressionOptionAction("choose-culture", option),
      targetAction: progressionOptionAction("target-culture", option),
      validationAction: progressionOptionAction("validate-culture-choice", option),
    }));
  return {
    kind: "culture-choice-options",
    notificationId: details.notificationId ?? null,
    localPlayerId: details.localPlayerId ?? null,
    currentResearching: probeValue(details.currentResearching),
    targetNode: probeValue(details.targetNode),
    enabledOptions,
    enabledOptionCount: enabledOptions.length,
    disabledOptionCount: asArray(details.disabledOptions).length,
  };
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function probeValue(value: unknown): unknown {
  if (value && typeof value === "object" && "ok" in value) {
    const probe = value as { ok?: unknown; value?: unknown };
    return probe.ok === true ? (probe.value ?? null) : null;
  }
  return value ?? null;
}

function progressionOptionAction(
  kind: ProgressionOptionAction["kind"],
  option: Record<string, unknown>
): ProgressionOptionAction {
  const readOnly = kind === "validate-culture-choice";
  return {
    kind,
    label:
      kind === "choose-culture"
        ? "Choose culture node."
        : kind === "target-culture"
          ? "Set culture target."
          : "Validate culture choice.",
    parameters: {
      node: option.nodeType,
      nodeTypeName: option.nodeTypeName,
    },
    readOnly,
    sendsMutation: !readOnly,
  };
}
