import type {
  Civ7NotificationDismissInput,
  Civ7NotificationDismissalResult,
} from "./dismissal-request.js";
import {
  notificationDismissalPostcondition,
  notificationDismissalPostconditionConfirmed,
} from "./postconditions.js";
import type { Civ7DirectControlOptions } from "../../session/types.js";

const DEFAULT_CIV7_NOTIFICATION_DISMISSAL_WAIT_MS = 2_000;
const DEFAULT_CIV7_NOTIFICATION_DISMISSAL_POLL_MS = 250;

export async function waitForCiv7NotificationDismissal(
  input: Civ7NotificationDismissInput,
  options: Civ7DirectControlOptions,
  initial: Civ7NotificationDismissalResult,
  readDismissal: (
    input: Civ7NotificationDismissInput,
    options: Civ7DirectControlOptions,
  ) => Promise<Civ7NotificationDismissalResult>,
): Promise<Civ7NotificationDismissalResult> {
  const timeoutMs = Math.min(
    Math.max(options.timeoutMs ?? DEFAULT_CIV7_NOTIFICATION_DISMISSAL_WAIT_MS, 1_000),
    DEFAULT_CIV7_NOTIFICATION_DISMISSAL_WAIT_MS,
  );
  const verificationAttempts = [...(initial.verificationAttempts ?? [])];
  const startedAt = Date.now();
  let after = initial.after ?? initial.before;
  while (Date.now() - startedAt <= timeoutMs) {
    await sleep(DEFAULT_CIV7_NOTIFICATION_DISMISSAL_POLL_MS);
    const current = await readDismissal(input, options);
    after = current.before;
    verificationAttempts.push(after);
    const postcondition = notificationDismissalPostcondition({ ...initial, after });
    if (notificationDismissalPostconditionConfirmed(postcondition.classification)) {
      return {
        ...initial,
        after,
        postcondition,
        verificationAttempts,
        verified: true,
        notes: appendNote(
          initial.notes,
          "Dismissal verification yielded between App UI reads so frame-driven notification/display queues could advance before the final identity check.",
        ),
      };
    }
  }
  return {
    ...initial,
    after,
    postcondition: notificationDismissalPostcondition({ ...initial, after }),
    verificationAttempts,
    verified: false,
    notes: appendNote(
      initial.notes,
      "Dismissal verification yielded between App UI reads, but the target notification was still present/front/queued by the final identity check.",
    ),
  };
}

function appendNote(notes: ReadonlyArray<string>, note: string): ReadonlyArray<string> {
  return [...notes, note];
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
