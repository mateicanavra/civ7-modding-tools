import { getCiv7PlayNotificationView } from "@civ7/direct-control";
import { Command, Flags } from "@oclif/core";
import { createCiv7GameControlClient } from "../../../adapters/control/service-client";
import {
  buildDirectControlOptions,
  emitPlayResult,
  parseComponentId,
} from "../../../adapters/play/direct-control";

type NarrativeOptionAction = {
  kind: "choose-narrative" | "validate-narrative-choice";
  label: string;
  parameters: Record<string, unknown>;
  readOnly: boolean;
  sendsMutation: boolean;
};

type NarrativeDismissalAction = {
  kind: "inspect-notification-dismissal" | "dismiss-notification";
  label: string;
  parameters: Record<string, unknown>;
  readOnly: boolean;
  sendsMutation: boolean;
  proofBoundary?: "unproven-dismissal";
};

export default class GamePlayChooseNarrative extends Command {
  static summary = "Validate or choose a narrative story direction";
  static description =
    "Checks the exact live narrative choice through the control service, or requests it when --send is explicit.";

  static examples = [
    "<%= config.bin %> game play choose-narrative --options --json",
    '<%= config.bin %> game play choose-narrative --target-type TOT_30001B --target \'{"owner":0,"id":45,"type":35}\' --json',
    '<%= config.bin %> game play choose-narrative --target-type TOT_30001B --target \'{"owner":0,"id":45,"type":35}\' --send --json',
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    "target-type": Flags.string({
      description: "Narrative TargetType value from the live story direction UI",
    }),
    target: Flags.string({
      description: "Narrative Target ComponentID JSON",
    }),
    options: Flags.boolean({
      description:
        "Observe narrative choice options from the live notification HUD without sending",
      default: false,
    }),
    send: Flags.boolean({
      description: "Request the narrative choice after the service-owned availability check",
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
    const { flags } = await this.parse(GamePlayChooseNarrative);
    const options = buildDirectControlOptions(flags);
    if (flags.options) {
      if (flags.send)
        throw new Error("game play choose-narrative --options is read-only; omit --send");
      const view = await getCiv7PlayNotificationView(options);
      const details = narrativeChoiceDetails(view);
      const surfaces = details.map(compactNarrativeChoiceSurface);
      emitPlayResult(this.log.bind(this), flags.json, {
        surface: "narrative-choice-options",
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
            reason: "enabled rows carry semantic narrative fields and validation descriptors",
          },
          {
            path: "details[].disabledOptions",
            reason:
              "disabled narrative buttons are counted but kept out of mutation action recommendations",
          },
          {
            path: "details[].storyLinks",
            reason: "official story-link rows are summarized on enabled rows",
          },
        ],
        notes: [
          "Rows are a separate live HUD observation; the exact narrative choice procedure performs native validation.",
        ],
      });
      return;
    }
    if (!flags["target-type"]) {
      throw new Error("game play choose-narrative requires --target-type unless --options is used");
    }
    if (!flags.target) {
      throw new Error("game play choose-narrative requires --target unless --options is used");
    }
    const target = parseComponentId(flags.target, "target");
    const input = {
      targetType: flags["target-type"],
      target,
    };
    const client = createCiv7GameControlClient({
      endpointDefaults: options,
    });
    const result = flags.send
      ? await client.narrative.choice.request(input)
      : await client.narrative.choice.check(input);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}

function narrativeChoiceDetails(
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
    if (record.kind !== "narrative-choice-options") return false;
    const key = JSON.stringify(
      record.notificationId ?? record.targetStoryId ?? record.localPlayerId
    );
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function compactNarrativeChoiceSurface(details: Record<string, unknown>): {
  kind: "narrative-choice-options";
  classification: unknown;
  notificationId: unknown;
  localPlayerId: unknown;
  notificationOwner: unknown;
  targetStoryIdSource: unknown;
  pendingStoryId: unknown;
  pendingDiscoveryStoryId: unknown;
  targetStoryId: unknown;
  visiblePanelTargetStoryId: unknown;
  enabledOptions: Array<Record<string, unknown>>;
  enabledOptionCount: number;
  disabledOptionCount: number;
  dismissalDiagnosticAction: NarrativeDismissalAction | null;
  unprovenDismissalAction: NarrativeDismissalAction | null;
  notes: unknown;
} {
  const visiblePanel = probeValue(details.visiblePanel);
  const visiblePanelRecord =
    visiblePanel && typeof visiblePanel === "object"
      ? (visiblePanel as Record<string, unknown>)
      : null;
  const enabledOptions = asArray(details.enabledOptions)
    .filter((option): option is Record<string, unknown> =>
      Boolean(option && typeof option === "object")
    )
    .map((option) => ({
      source: option.source,
      targetType: option.targetType,
      targetTypeName: option.targetTypeName,
      target: option.target,
      action: option.action,
      activation: option.activation,
      name: option.name,
      reward: option.reward,
      imperative: option.imperative,
      cost: option.cost,
      nextAction: narrativeOptionAction("choose-narrative", option),
      validationAction: narrativeOptionAction("validate-narrative-choice", option),
    }));
  const notificationId = details.notificationId ?? null;
  const hasDismissalFallback = enabledOptions.length === 0 && notificationId !== null;
  return {
    kind: "narrative-choice-options",
    classification: details.classification ?? null,
    notificationId: details.notificationId ?? null,
    localPlayerId: details.localPlayerId ?? null,
    notificationOwner: details.notificationOwner ?? null,
    targetStoryIdSource: details.targetStoryIdSource ?? null,
    pendingStoryId: probeValue(details.pendingStoryId),
    pendingDiscoveryStoryId: probeValue(details.pendingDiscoveryStoryId),
    targetStoryId: probeValue(details.targetStoryId),
    visiblePanelTargetStoryId: probeValue(visiblePanelRecord?.targetStoryId),
    enabledOptions,
    enabledOptionCount: enabledOptions.length,
    disabledOptionCount: asArray(details.disabledOptions).length,
    dismissalDiagnosticAction: hasDismissalFallback
      ? narrativeDismissalAction("inspect-notification-dismissal", notificationId)
      : null,
    unprovenDismissalAction: hasDismissalFallback
      ? narrativeDismissalAction("dismiss-notification", notificationId)
      : null,
    notes: asArray(details.notes),
  };
}

function narrativeOptionAction(
  kind: NarrativeOptionAction["kind"],
  option: Record<string, unknown>
): NarrativeOptionAction {
  const readOnly = kind === "validate-narrative-choice";
  return {
    kind,
    label: readOnly ? "Validate narrative choice." : "Choose narrative option.",
    parameters: {
      targetType: option.targetType,
      target: option.target,
    },
    readOnly,
    sendsMutation: !readOnly,
  };
}

function narrativeDismissalAction(
  kind: NarrativeDismissalAction["kind"],
  target: unknown
): NarrativeDismissalAction {
  const readOnly = kind === "inspect-notification-dismissal";
  return {
    kind,
    label: readOnly ? "Inspect dismissal evidence." : "Dismiss notification.",
    parameters: { target },
    readOnly,
    sendsMutation: !readOnly,
    ...(readOnly ? {} : { proofBoundary: "unproven-dismissal" as const }),
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
