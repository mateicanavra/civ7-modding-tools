import { describe, expect, test } from "vitest";

import {
  cultureChoicePostcondition,
  findCultureChoiceNotification,
  findTechnologyChoiceNotification,
  technologyChoicePostcondition,
  type Civ7ProgressionChoiceNotificationView,
} from "../src/index.js";

describe("progression choice postconditions", () => {
  test("classifies technology choice blocker outcomes", () => {
    const before = notificationView("NOTIFICATION_CHOOSE_TECH", {
      currentResearching: probe(10),
      targetNode: probe(20),
    });

    expect(findTechnologyChoiceNotification(before)?.id).toEqual({
      owner: 0,
      id: 52,
      type: 20,
    });
    expect(
      technologyChoicePostcondition(
        before,
        notificationView("NOTIFICATION_CHOOSE_TECH", {}, { canEndTurn: true })
      )
    ).toMatchObject({
      classification: "turn-unblocked",
      verified: true,
    });
    expect(technologyChoicePostcondition(before, cleanView())).toMatchObject({
      classification: "technology-choice-cleared",
      verified: true,
    });
    expect(
      technologyChoicePostcondition(
        before,
        notificationView("NOTIFICATION_CHOOSE_TECH", {}, { id: 53 })
      )
    ).toMatchObject({
      classification: "technology-choice-transitioned",
      verified: true,
    });
    expect(
      technologyChoicePostcondition(
        before,
        notificationView("NOTIFICATION_CHOOSE_TECH", {
          currentResearching: probe(11),
          targetNode: probe(20),
        })
      )
    ).toMatchObject({
      classification: "technology-state-changed-blocker-still-live",
      verified: false,
    });
    expect(technologyChoicePostcondition(before, before)).toMatchObject({
      classification: "technology-choice-sticky-blocker",
      verified: false,
    });
  });

  test("classifies culture choice blocker outcomes", () => {
    const before = notificationView("NOTIFICATION_CHOOSE_CULTURE_NODE", {
      currentResearching: probe(30),
      targetNode: probe(40),
    });

    expect(findCultureChoiceNotification(before)?.id).toEqual({
      owner: 0,
      id: 52,
      type: 20,
    });
    expect(
      cultureChoicePostcondition(
        before,
        notificationView(
          "NOTIFICATION_CHOOSE_CULTURE_NODE",
          {},
          {
            canEndTurn: true,
          }
        )
      )
    ).toMatchObject({
      classification: "turn-unblocked",
      verified: true,
    });
    expect(cultureChoicePostcondition(before, cleanView())).toMatchObject({
      classification: "culture-choice-cleared",
      verified: true,
    });
    expect(
      cultureChoicePostcondition(
        before,
        notificationView("NOTIFICATION_CHOOSE_CULTURE_NODE", {}, { id: 53 })
      )
    ).toMatchObject({
      classification: "culture-choice-transitioned",
      verified: true,
    });
    expect(
      cultureChoicePostcondition(
        before,
        notificationView("NOTIFICATION_CHOOSE_CULTURE_NODE", {
          currentResearching: probe(31),
          targetNode: probe(40),
        })
      )
    ).toMatchObject({
      classification: "culture-state-changed-blocker-still-live",
      verified: false,
    });
    expect(cultureChoicePostcondition(before, before)).toMatchObject({
      classification: "culture-choice-sticky-blocker",
      verified: false,
    });
  });
});

function notificationView(
  typeName: string,
  details: Record<string, unknown>,
  options: Readonly<{
    id?: number;
    canEndTurn?: boolean;
  }> = {}
): Civ7ProgressionChoiceNotificationView {
  return {
    canEndTurn: probe(options.canEndTurn ?? false),
    notifications: [
      {
        id: { owner: 0, id: options.id ?? 52, type: 20 },
        typeName,
        isEndTurnBlocking: true,
        details,
      },
    ],
  };
}

function cleanView(): Civ7ProgressionChoiceNotificationView {
  return {
    canEndTurn: probe(false),
    notifications: [],
  };
}

function probe<T>(value: T): Readonly<{ ok: true; value: T }> {
  return { ok: true, value };
}
