import type {
  Civ7DirectControlOptions,
  Civ7NotificationDismissInput,
  Civ7NotificationDismissalResult,
  Civ7NotificationDismissalSummary,
  Civ7RuntimeProbe,
} from "../../index";

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
    if (notificationDismissalVerified(initial.before, after)) {
      return {
        ...initial,
        after,
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
    verificationAttempts,
    verified: false,
    notes: appendNote(
      initial.notes,
      "Dismissal verification yielded between App UI reads, but the target notification was still present/front/queued by the final identity check.",
    ),
  };
}

function notificationDismissalVerified(
  before: Civ7NotificationDismissalSummary,
  after: Civ7NotificationDismissalSummary | null,
): boolean {
  if (after == null) return false;
  if (after.exists === false) return true;
  if (probeValue(after.isEngineQueueFront) === true) return false;
  if (after.dismissed === true) return true;
  if (probeValue(before.engineQueueContains) === true && probeValue(after.engineQueueContains) === false) return true;
  if (probeValue(before.notificationTrainContains) === true && probeValue(after.notificationTrainContains) === false) return true;
  const wasEngineFront = probeValue(before.isEngineQueueFront) === true;
  if (wasEngineFront && probeValue(after.isEngineQueueFront) === false) return true;
  const wasTrainFront = probeValue(before.isNotificationTrainFront) === true;
  if (wasTrainFront && probeValue(after.isNotificationTrainFront) === false) return true;
  return false;
}

function appendNote(notes: ReadonlyArray<string>, note: string): ReadonlyArray<string> {
  return [...notes, note];
}

function probeValue<T>(probe: Civ7RuntimeProbe<T>): T | undefined {
  return probe.ok ? probe.value : undefined;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
