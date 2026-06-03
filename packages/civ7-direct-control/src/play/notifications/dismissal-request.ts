import { waitForCiv7NotificationDismissal } from "./verification";

import type {
  Civ7ActionApproval,
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7NotificationDismissInput,
  Civ7NotificationDismissalResult,
} from "../../index";

type NotificationDismissalRequestDependencies = Readonly<{
  buildNotificationDismissalCommand: (
    input: Civ7NotificationDismissInput,
    options: { send: boolean; verificationAttempts?: number },
  ) => string;
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>,
  ) => Promise<Civ7CommandResult>;
  parseNotificationDismissal: (
    result: Civ7CommandResult,
    label: string,
  ) => Civ7NotificationDismissalResult;
}>;

export async function getCiv7NotificationDismissal(
  input: Civ7NotificationDismissInput,
  options: Civ7DirectControlOptions = {},
  dependencies: NotificationDismissalRequestDependencies,
): Promise<Civ7NotificationDismissalResult> {
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: dependencies.buildNotificationDismissalCommand(input, { send: false }),
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
    command: dependencies.buildNotificationDismissalCommand(input, { send: true, verificationAttempts: 1 }),
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
