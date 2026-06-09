import { notificationDismissalSource } from "./dismissal.js";
import { waitForCiv7NotificationDismissal } from "./verification.js";

import type {
  Civ7ActionApproval,
} from "../../index.js";
import type { Civ7ComponentId } from "../../civ7-component-id.js";
import type { Civ7RuntimeProbe } from "../../runtime/probe.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "../../session/types.js";

export type Civ7NotificationDismissInput = Readonly<{
  notificationId: Civ7ComponentId;
}>;

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
  notes: ReadonlyArray<string>;
}>;

type NotificationDismissalRequestDependencies = Readonly<{
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>,
  ) => Promise<Civ7CommandResult>;
  parseNotificationDismissal: (
    result: Civ7CommandResult,
    label: string,
  ) => Civ7NotificationDismissalResult;
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
  dependencies: NotificationDismissalRequestDependencies,
): Promise<Civ7NotificationDismissalResult> {
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildNotificationDismissalCommand(input, { send: false }, dependencies),
  });
  return dependencies.parseNotificationDismissal(result, "Civ7 notification dismissal");
}

export async function requestCiv7NotificationDismissal(
  input: Civ7NotificationDismissInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
  dependencies: NotificationDismissalRequestDependencies & Readonly<{
    assertApproved: (approval: Civ7ActionApproval, action: string) => void;
  }>,
): Promise<Civ7NotificationDismissalResult> {
  dependencies.assertApproved(approval, "dismissing Civ7 notification");
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildNotificationDismissalCommand(input, { send: true, verificationAttempts: 1 }, dependencies),
  });
  const initial = dependencies.parseNotificationDismissal(result, "Civ7 notification dismissal");
  if (initial.verified || !initial.sent || initial.before.exists === false) return initial;
  return await waitForCiv7NotificationDismissal(
    input,
    options,
    initial,
    async (nextInput, nextOptions) => await getCiv7NotificationDismissal(nextInput, nextOptions, dependencies),
  );
}
