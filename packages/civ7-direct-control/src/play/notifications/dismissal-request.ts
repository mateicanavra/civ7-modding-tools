import { Type, type Static } from "typebox";

import { assertCiv7ComponentId, Civ7ComponentIdSchema } from "../../civ7-component-id.js";
import { notificationDismissalSource } from "./dismissal.js";
import {
  Civ7NotificationDismissalPostconditionSchema,
  Civ7NotificationDismissalSummarySchema,
  notificationDismissalPostcondition,
} from "./postconditions.js";
import { waitForCiv7NotificationDismissal } from "./verification.js";
import { assertApproved } from "../../action-approval.js";
import { jsLiteral } from "../../runtime/command-serialization.js";
import { jsonPayloadFromCommandResult } from "../../session/command-result.js";
import { executeCiv7AppUiCommand } from "../../session/execute.js";

import type { Civ7ActionApproval } from "../../action-approval.js";
import type { Civ7ComponentId } from "../../civ7-component-id.js";
import type { Civ7RuntimeProbe } from "../../runtime/probe.js";
import type { Civ7NotificationDismissalPostcondition } from "./postconditions.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "../../session/types.js";

export type Civ7NotificationDismissInput = Readonly<{
  notificationId: Civ7ComponentId;
}>;

export const Civ7NotificationDismissInputSchema = Type.Object({
  notificationId: Civ7ComponentIdSchema,
}, { additionalProperties: false });

export const Civ7NotificationDismissRequestInputSchema = Type.Object({
  notificationId: Civ7ComponentIdSchema,
  approvalReason: Type.String({ minLength: 1 }),
  disposableSession: Type.Optional(Type.Boolean()),
}, { additionalProperties: false });
export type Civ7NotificationDismissRequestInput = Readonly<Static<typeof Civ7NotificationDismissRequestInputSchema>>;

export type Civ7NotificationDismissalSummary = Readonly<{
  id: Civ7ComponentId | null;
  exists: boolean;
  type: unknown;
  typeName: string | null;
  summary: string | null;
  message: string | null;
  target: unknown;
  location: unknown;
  canUserDismiss: unknown;
  expired: unknown;
  dismissed: unknown;
  blocksTurnAdvancement: Civ7RuntimeProbe<unknown>;
  endTurnBlockingType: Civ7RuntimeProbe<unknown>;
  isEndTurnBlocking: Civ7RuntimeProbe<boolean>;
  engineQueueCount: Civ7RuntimeProbe<number>;
  engineQueueContains: Civ7RuntimeProbe<boolean>;
  engineQueueFirstId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  isEngineQueueFront: Civ7RuntimeProbe<boolean>;
  notificationTrainCount: Civ7RuntimeProbe<number>;
  notificationTrainContains: Civ7RuntimeProbe<boolean>;
  notificationTrainFirstId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  isNotificationTrainFront: Civ7RuntimeProbe<boolean>;
}>;

export type Civ7NotificationDismissalResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  notificationId: Civ7ComponentId;
  before: Civ7NotificationDismissalSummary;
  after: Civ7NotificationDismissalSummary | null;
  canDismiss: boolean;
  sent: boolean;
  result: unknown;
  closeoutPath?: string | null;
  verificationAttempts?: ReadonlyArray<Civ7NotificationDismissalSummary>;
  verified: boolean;
  postcondition: Civ7NotificationDismissalPostcondition;
  notes: ReadonlyArray<string>;
}>;

const civ7TunerStateSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
}, { additionalProperties: false });

export const Civ7NotificationDismissalResultSchema = Type.Object({
  host: Type.String(),
  port: Type.Number(),
  state: civ7TunerStateSchema,
  notificationId: Civ7ComponentIdSchema,
  before: Civ7NotificationDismissalSummarySchema,
  after: Type.Union([Civ7NotificationDismissalSummarySchema, Type.Null()]),
  canDismiss: Type.Boolean(),
  sent: Type.Boolean(),
  result: Type.Unknown(),
  closeoutPath: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  verificationAttempts: Type.Optional(Type.Array(Civ7NotificationDismissalSummarySchema)),
  verified: Type.Boolean(),
  postcondition: Civ7NotificationDismissalPostconditionSchema,
  notes: Type.Array(Type.String()),
}, { additionalProperties: false });

type Civ7NotificationDismissalPayload = Omit<Civ7NotificationDismissalResult, "postcondition">;

type NotificationDismissalRequestDependencies = Readonly<{
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>,
  ) => Promise<Civ7CommandResult>;
  parseNotificationDismissal: (
    result: Civ7CommandResult,
    label: string,
  ) => Civ7NotificationDismissalPayload;
  jsLiteral: (value: unknown) => string;
}>;

export function buildNotificationDismissalCommand(
  input: Civ7NotificationDismissInput,
  options: { send: boolean; verificationAttempts?: number },
  dependencies: Pick<NotificationDismissalRequestDependencies, "jsLiteral">,
): string {
  return `(() => {
    ${notificationDismissalSource()}
    return JSON.stringify(readNotificationDismissal(${dependencies.jsLiteral(input)}, ${dependencies.jsLiteral(options)}));
  })()`;
}

export async function getCiv7NotificationDismissal(
  input: Civ7NotificationDismissInput,
  options: Civ7DirectControlOptions = {},
  dependencies: NotificationDismissalRequestDependencies = defaultNotificationDismissalRequestDependencies,
): Promise<Civ7NotificationDismissalResult> {
  assertCiv7ComponentId(input.notificationId, "notificationId");
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildNotificationDismissalCommand(input, { send: false }, dependencies),
  });
  return withNotificationDismissalPostcondition(
    dependencies.parseNotificationDismissal(result, "Civ7 notification dismissal"),
  );
}

export async function requestCiv7NotificationDismissal(
  input: Civ7NotificationDismissInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
  dependencies: NotificationDismissalRequestDependencies & Readonly<{
    assertApproved: (approval: Civ7ActionApproval, action: string) => void;
  }> = defaultNotificationDismissalRequestDependencies,
): Promise<Civ7NotificationDismissalResult> {
  dependencies.assertApproved(approval, "dismissing Civ7 notification");
  assertCiv7ComponentId(input.notificationId, "notificationId");
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildNotificationDismissalCommand(input, { send: true, verificationAttempts: 1 }, dependencies),
  });
  const initial = withNotificationDismissalPostcondition(
    dependencies.parseNotificationDismissal(result, "Civ7 notification dismissal"),
  );
  if (initial.verified || !initial.sent || initial.before.exists === false) return initial;
  return await waitForCiv7NotificationDismissal(
    input,
    options,
    initial,
    async (nextInput, nextOptions) => await getCiv7NotificationDismissal(nextInput, nextOptions, dependencies),
  );
}

const defaultNotificationDismissalRequestDependencies: NotificationDismissalRequestDependencies & Readonly<{
  assertApproved: (approval: Civ7ActionApproval, action: string) => void;
}> = {
  assertApproved,
  executeAppUiCommand: executeCiv7AppUiCommand,
  jsLiteral,
  parseNotificationDismissal: (result, label) =>
    jsonPayloadFromCommandResult<Civ7NotificationDismissalPayload>(result, label),
};

function withNotificationDismissalPostcondition(
  result: Civ7NotificationDismissalPayload,
): Civ7NotificationDismissalResult {
  return {
    ...result,
    postcondition: notificationDismissalPostcondition(result),
  };
}
