import { narrativeChoicePostcondition, waitForCiv7NarrativeChoiceAfter } from "./narrative-postconditions.js";

import type {
  Civ7ActionApproval,
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7NarrativeChoiceCommandPayload,
  Civ7NarrativeChoiceInput,
  Civ7NarrativeChoiceResult,
  Civ7OperationValidationResult,
  Civ7PlayNotificationViewResult,
} from "../../index";

type NarrativeChoiceRequestDependencies = Readonly<{
  assertApproved: (approval: Civ7ActionApproval, action: string) => void;
  validatePlayerId: (playerId: number) => void;
  assertComponentId: (value: unknown, name: string) => void;
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>,
  ) => Promise<Civ7CommandResult>;
  getPlayNotificationView: (options: Civ7DirectControlOptions) => Promise<Civ7PlayNotificationViewResult>;
  canStartPlayerOperation: (
    input: Readonly<{
      playerId: number;
      operationType: string;
      args: { TargetType: string; Target: Civ7NarrativeChoiceInput["target"]; Action: number };
    }>,
    options: Civ7DirectControlOptions,
  ) => Promise<Civ7OperationValidationResult>;
  parseNarrativePayload: (
    result: Civ7CommandResult,
    label: string,
  ) => Civ7NarrativeChoiceCommandPayload;
  jsLiteral: (value: unknown) => string;
  invalidTargetTypeError: () => never;
  invalidActionError: () => never;
}>;

export async function requestCiv7NarrativeChoice(
  input: Civ7NarrativeChoiceInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
  dependencies: NarrativeChoiceRequestDependencies,
): Promise<Civ7NarrativeChoiceResult> {
  dependencies.assertApproved(approval, "choosing a narrative story direction");
  dependencies.validatePlayerId(input.playerId);
  if (!input.targetType) dependencies.invalidTargetTypeError();
  dependencies.assertComponentId(input.target, "target");
  if (!Number.isInteger(input.action)) dependencies.invalidActionError();

  const before = await dependencies.getPlayNotificationView(options);
  const operationInput = {
    playerId: input.playerId,
    operationType: "CHOOSE_NARRATIVE_STORY_DIRECTION",
    args: {
      TargetType: input.targetType,
      Target: input.target,
      Action: input.action,
    },
  } as const;
  const beforeValidation = await dependencies.canStartPlayerOperation(operationInput, options);
  if (!beforeValidation.valid) {
    return {
      before,
      beforeValidation,
      after: before,
      afterValidation: beforeValidation,
      sent: false,
      verified: false,
      postcondition: {
        classification: "not-sent",
        reason: "CHOOSE_NARRATIVE_STORY_DIRECTION did not validate, so no narrative choice was sent.",
      },
    };
  }

  const command = await dependencies.executeAppUiCommand({
    ...options,
    command: buildNarrativeChoiceRequestCommand(input, dependencies),
  });
  const payload = dependencies.parseNarrativePayload(command, "Civ7 narrative choice request");
  const after = await waitForCiv7NarrativeChoiceAfter(
    input,
    options,
    before,
    beforeValidation,
    dependencies.getPlayNotificationView,
  );
  const afterValidation = await dependencies.canStartPlayerOperation(operationInput, options);
  const postcondition = narrativeChoicePostcondition(
    input,
    payload.sent === true,
    before,
    after,
    beforeValidation,
    afterValidation,
    payload,
  );
  return {
    before,
    beforeValidation,
    command,
    payload,
    after,
    afterValidation,
    sent: payload.sent === true,
    verified: postcondition.classification !== "not-sent" && postcondition.classification !== "no-state-change",
    postcondition,
  };
}

export function buildNarrativeChoiceRequestCommand(
  input: Civ7NarrativeChoiceInput,
  dependencies: Pick<NarrativeChoiceRequestDependencies, "jsLiteral">,
): string {
  return `(() => {
    ${narrativeChoiceRequestSource()}
    return JSON.stringify(sendNarrativeChoice(${dependencies.jsLiteral(input)}));
  })()`;
}

export function narrativeChoiceRequestSource(): string {
  return `${probeHelperSource()}
    const toComponentId = (value) => {
      if (!value || typeof value !== "object") return null;
      if (typeof value.owner !== "number" || typeof value.id !== "number") return null;
      const out = { owner: value.owner, id: value.id };
      if (typeof value.type === "number") out.type = value.type;
      return out;
    };
    const sameComponentId = (left, right) => {
      const a = toComponentId(left);
      const b = toComponentId(right);
      if (!a || !b) return false;
      return a.owner === b.owner && a.id === b.id && (a.type ?? null) === (b.type ?? null);
    };
    const safeCall = (label, fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: label + ": " + String(err) };
      }
    };
    const narrativeSelectors = [
      "small-narrative-event",
      "graphic-narrative-event",
      "screen-narrative-event",
      "screen-narrative-trial",
    ];
    const viewMethod = () => typeof UIViewChangeMethod !== "undefined" ? UIViewChangeMethod.PlayerInteraction : undefined;
    const narrativePopupManager = () => typeof NarrativePopupManager === "undefined" ? null : NarrativePopupManager;
    const narrativePanels = () => {
      if (typeof document === "undefined") return [];
      return narrativeSelectors.flatMap((selector) => Array.from(document.querySelectorAll?.(selector) ?? []));
    };
    const summarizePanel = (root) => {
      const component = root?._component ?? null;
      return {
        panelType: root?.tagName ?? null,
        componentType: component?.constructor?.name ?? null,
        targetStoryId: toComponentId(component?.targetStoryId),
        storyType: component?.storyType ?? null,
        choiceKeys: Array.from(root?.querySelectorAll?.("fxs-reward-button[small-narrative-choice-key]") ?? [])
          .map((button) => button.getAttribute("small-narrative-choice-key"))
          .filter(Boolean),
      };
    };
    const readNarrativeUiState = (target) => {
      const panels = narrativePanels().map(summarizePanel);
      const matchingPanels = panels.filter((panel) => sameComponentId(panel.targetStoryId, target));
      return {
        panelCount: panels.length,
        panels,
        matchingPanelCount: matchingPanels.length,
        matchingPanels,
        popupShowing: safeCall("NarrativePopupManager.isShowing", () => narrativePopupManager()?.isShowing?.()),
        currentNarrativeData: safeCall("NarrativePopupManager.currentNarrativeData", () => narrativePopupManager()?.currentNarrativeData ?? null),
      };
    };
    const closeVisibleNarrativePanels = (target) => safeCall("visible narrative panel close", () => {
      const panels = narrativePanels()
        .filter((root) => sameComponentId(root?._component?.targetStoryId, target));
      const method = viewMethod();
      const results = panels.map((root) => {
        const component = root?._component ?? null;
        if (typeof component?.close !== "function") {
          return { panelType: root?.tagName ?? null, closed: false, reason: "panel component has no close function" };
        }
        component.close(method);
        return { panelType: root?.tagName ?? null, closed: true };
      });
      return { attempted: panels.length, results };
    });
    const closeNarrativePopup = () => safeCall("NarrativePopupManager.closePopup", () => {
      const manager = narrativePopupManager();
      if (!manager || typeof manager.closePopup !== "function") return { available: false };
      manager.closePopup();
      return { available: true };
    });
    const sendNarrativeChoice = (input) => {
      const localPlayerId = GameContext.localPlayerID;
      const playerId = localPlayerId;
      const args = { TargetType: input.targetType, Target: input.target, Action: input.action };
      const before = readNarrativeUiState(input.target);
      const canStart = safeCall("Game.PlayerOperations.canStart", () => Game.PlayerOperations.canStart(
        playerId,
        PlayerOperationTypes.CHOOSE_NARRATIVE_STORY_DIRECTION,
        args,
        false,
      ));
      let sent = false;
      let sendResult = null;
      if (canStart.ok && (canStart.value?.Success === true || canStart.value?.canStart === true)) {
        sendResult = safeCall("Game.PlayerOperations.sendRequest", () => Game.PlayerOperations.sendRequest(
          playerId,
          PlayerOperationTypes.CHOOSE_NARRATIVE_STORY_DIRECTION,
          args,
        ));
        sent = sendResult.ok === true;
      }
      const popupClose = sent ? closeNarrativePopup() : { ok: false, skipped: true, reason: "operation was not sent" };
      const panelClose = sent ? closeVisibleNarrativePanels(input.target) : { ok: false, skipped: true, reason: "operation was not sent" };
      return {
        localPlayerId,
        playerId,
        args,
        canStart,
        sent,
        sendResult,
        ui: {
          before,
          after: readNarrativeUiState(input.target),
          panelClose,
          popupClose,
        },
        notes: [
          "This mirrors the official narrative button handler: CHOOSE_NARRATIVE_STORY_DIRECTION, NarrativePopupManager.closePopup, and visible narrative panel close.",
        ],
      };
    };`;
}

function probeHelperSource(): string {
  return `const probe = (fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    };`;
}
